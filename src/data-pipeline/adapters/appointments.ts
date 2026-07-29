import type { ValidationIssue } from "../model";
import {
  inferWorkbookYear,
  normalizeText,
  sheetRows,
  type WorkbookInput,
} from "../workbooks";
import {
  metric,
  sourceSummary,
  type AdapterResult,
} from "./common";

function normalizeOrigin(value: unknown): string {
  const origin = normalizeText(value);
  if (origin.includes("FOLLOW")) {
    return "Follow-up";
  }
  if (origin.includes("MKT") && origin.includes("INDIC")) {
    return "Marketing / Indicacao";
  }
  if (origin.includes("MKT")) {
    return "Marketing";
  }
  if (origin.includes("INDIC")) {
    return "Indicacao";
  }
  return origin ? "Outros" : "Sem origem";
}

function isoPeriod(value: unknown): string | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
  }
  return null;
}

export function adaptAppointments(input: WorkbookInput): AdapterResult {
  const issues: ValidationIssue[] = [];
  const sheetName = input.workbook.SheetNames[0];
  const rows = sheetRows(input.workbook, sheetName).slice(1);
  const used = rows.filter((row) =>
    row.some((value) => value !== null && value !== ""),
  );
  const periods = used
    .map((row) => isoPeriod(row[4]))
    .filter(Boolean) as string[];
  const period = periods.sort().at(-1) ?? `${inferWorkbookYear(input)}-01`;
  const current = used.filter((row) => isoPeriod(row[4]) === period);
  const withConsultation = current.filter((row) => row[5] instanceof Date);
  const missingOwner = current.filter((row) => !normalizeText(row[8]));

  const originCounts = new Map<string, number>();
  const modeCounts = new Map<string, number>();
  const professionalCounts = new Map<string, number>();

  for (const row of current) {
    const origin = normalizeOrigin(row[0]);
    originCounts.set(origin, (originCounts.get(origin) ?? 0) + 1);
    const mode = normalizeText(row[7]) || "SEM MODALIDADE";
    modeCounts.set(mode, (modeCounts.get(mode) ?? 0) + 1);
    const professional = normalizeText(row[3])
      .replace("VIVAN", "VIVIAN")
      .replace("LUCA", "LUCCA");
    if (professional) {
      professionalCounts.set(
        professional,
        (professionalCounts.get(professional) ?? 0) + 1,
      );
    }
  }

  issues.push({
    severity: "WARNING",
    code: "APPOINTMENT_CONFIRMATION_UNSUPPORTED",
    message:
      "A base nao possui regra auditavel de confirmacao/pagamento; confirmados permanecem SEM_BASE.",
    source: "appointments",
  });

  if (missingOwner.length) {
    issues.push({
      severity: "WARNING",
      code: "APPOINTMENT_OWNER_MISSING",
      message: "Existem agendamentos do periodo sem responsavel.",
      source: "appointments",
      details: { records: missingOwner.length },
    });
  }

  const metrics = [
    metric({
      id: "appointments.raw.current",
      label: "Agendamentos brutos",
      value: current.length,
      unit: "COUNT",
      period,
      source: "appointments",
      sheet: sheetName,
      note: "Linhas com data de agendamento no periodo.",
    }),
    metric({
      id: "appointments.with_consultation_date.current",
      label: "Registros com data de consulta",
      value: withConsultation.length,
      unit: "COUNT",
      period,
      source: "appointments",
      sheet: sheetName,
    }),
    metric({
      id: "appointments.missing_consultation_date.current",
      label: "Registros sem data de consulta",
      value: current.length - withConsultation.length,
      unit: "COUNT",
      period,
      source: "appointments",
      sheet: sheetName,
    }),
    metric({
      id: "appointments.missing_owner.current",
      label: "Registros sem responsavel",
      value: missingOwner.length,
      unit: "COUNT",
      status: missingOwner.length ? "WARNING" : "VALIDATED",
      period,
      source: "appointments",
      sheet: sheetName,
    }),
    metric({
      id: "appointments.confirmed.current",
      label: "Agendamentos confirmados",
      value: null,
      unit: "COUNT",
      status: "SEM_BASE",
      period,
      source: "appointments",
      sheet: sheetName,
      note: "Nao ha status ou regra inequívoca de pagamento/confirmacao.",
    }),
    metric({
      id: "appointments.no_show.current",
      label: "No-show",
      value: null,
      unit: "COUNT",
      status: "SEM_BASE",
      period,
      source: "appointments",
      sheet: sheetName,
      note: "A base nao possui campo de presenca.",
    }),
  ];

  for (const [origin, value] of originCounts) {
    metrics.push(
      metric({
        id: `appointments.origin.${normalizeText(origin).toLowerCase().replace(/[^a-z0-9]+/g, "_")}.current`,
        label: `Origem ${origin}`,
        value,
        unit: "COUNT",
        period,
        source: "appointments",
        sheet: sheetName,
      }),
    );
  }

  return {
    source: sourceSummary("appointments", input, period, used.length),
    metrics,
    breakdowns: {
      "appointments.origins": [...originCounts].map(([origin, count]) => ({
        origin,
        count,
      })),
      "appointments.modalities": [...modeCounts].map(([mode, count]) => ({
        mode,
        count,
      })),
      "appointments.professionals": [...professionalCounts].map(
        ([professional, count]) => ({ professional, count }),
      ),
    },
    issues,
  };
}

