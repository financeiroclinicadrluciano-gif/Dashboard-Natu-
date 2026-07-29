import type { DashboardMetric, ValidationIssue } from "../model";
import {
  finiteNumber,
  normalizeText,
  sheetRows,
  type WorkbookInput,
} from "../workbooks";
import {
  labelRows,
  metric,
  sourceSummary,
  type AdapterResult,
} from "./common";

export function adaptCloser(
  input: WorkbookInput,
  periodHint: string,
): AdapterResult {
  const issues: ValidationIssue[] = [];
  const rows: Array<{
    professional: string;
    journey: string;
    consultation: number;
    treatment: number;
    status: string;
    proposal: number;
  }> = [];

  for (const sheetName of input.workbook.SheetNames.filter(
    (name) => normalizeText(name) !== "DASHBOARD",
  )) {
    for (const row of sheetRows(input.workbook, sheetName).slice(1)) {
      const patientPresent = Boolean(normalizeText(row[0]));
      const journey = normalizeText(row[1]);
      if (!patientPresent || !/^\d+A$/.test(journey)) {
        continue;
      }

      rows.push({
        professional: sheetName,
        journey,
        consultation: finiteNumber(row[2]) ?? 0,
        treatment: finiteNumber(row[3]) ?? 0,
        status: normalizeText(row[4]),
        proposal: finiteNumber(row[5]) ?? 0,
      });
    }
  }

  const closed = rows.filter((row) => row.status === "FECHOU");
  const negotiating = rows.filter((row) => row.status === "NEGOCIACAO");
  const notClosed = rows.filter((row) => row.status === "NAO FECHOU");
  const missingStatus = rows.filter(
    (row) =>
      !["FECHOU", "NAO FECHOU", "NEGOCIACAO"].includes(row.status),
  );
  const consultationRevenue = rows.reduce(
    (sum, row) => sum + row.consultation,
    0,
  );
  const treatmentRevenue = closed.reduce(
    (sum, row) => sum + row.treatment,
    0,
  );
  const revenue = consultationRevenue + treatmentRevenue;
  const pipeline = negotiating.reduce(
    (sum, row) => sum + row.proposal,
    0,
  );
  const attended = rows.length;

  if (missingStatus.length) {
    issues.push({
      severity: "WARNING",
      code: "CLOSER_STATUS_MISSING",
      message: "A Closer possui atendimentos sem status decisorio.",
      source: "closer",
      details: { records: missingStatus.length },
    });
  }

  const metrics: DashboardMetric[] = [
    metric({
      id: "commercial.attended.current",
      label: "Atendimentos",
      value: attended,
      unit: "COUNT",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
    }),
    metric({
      id: "commercial.closed.current",
      label: "Fechamentos",
      value: closed.length,
      unit: "COUNT",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
    }),
    metric({
      id: "commercial.negotiating.current",
      label: "Em negociacao",
      value: negotiating.length,
      unit: "COUNT",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
    }),
    metric({
      id: "commercial.not_closed.current",
      label: "Nao fechados",
      value: notClosed.length,
      unit: "COUNT",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
    }),
    metric({
      id: "commercial.missing_status.current",
      label: "Atendimentos sem status",
      value: missingStatus.length,
      unit: "COUNT",
      status: missingStatus.length ? "WARNING" : "VALIDATED",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
    }),
    metric({
      id: "commercial.not_closed_total.current",
      label: "Atendimentos ainda nao fechados",
      value: attended - closed.length,
      unit: "COUNT",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
      formula: "atendimentos - fechamentos",
      dependencies: [
        "commercial.attended.current",
        "commercial.closed.current",
      ],
    }),
    metric({
      id: "commercial.close_rate.current",
      label: "Taxa de fechamento",
      value: attended ? closed.length / attended : null,
      unit: "PERCENT",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
      formula: "fechamentos / atendimentos",
      dependencies: [
        "commercial.closed.current",
        "commercial.attended.current",
      ],
    }),
    metric({
      id: "commercial.consultation_revenue.current",
      label: "Receita de consultas",
      value: consultationRevenue,
      unit: "BRL",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
    }),
    metric({
      id: "commercial.treatment_revenue.current",
      label: "Tratamentos fechados",
      value: treatmentRevenue,
      unit: "BRL",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
    }),
    metric({
      id: "commercial.revenue.current",
      label: "Receita comercial fechada",
      value: revenue,
      unit: "BRL",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
      formula: "consultas realizadas + tratamentos com status FECHOU",
      dependencies: [
        "commercial.consultation_revenue.current",
        "commercial.treatment_revenue.current",
      ],
    }),
    metric({
      id: "commercial.pipeline.current",
      label: "Pipeline aberto",
      value: pipeline,
      unit: "BRL",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
      formula: "soma de NOVA PROPOSTA nas linhas NEGOCIACAO",
    }),
    metric({
      id: "commercial.ticket_attended.current",
      label: "Ticket por atendido",
      value: attended ? revenue / attended : null,
      unit: "BRL",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
      formula: "receita comercial / atendimentos",
      dependencies: [
        "commercial.revenue.current",
        "commercial.attended.current",
      ],
    }),
    metric({
      id: "commercial.ticket_closed.current",
      label: "Ticket por fechado",
      value: closed.length ? revenue / closed.length : null,
      unit: "BRL",
      period: periodHint,
      source: "closer",
      sheet: "abas por profissional",
      formula: "receita comercial / fechamentos",
      dependencies: [
        "commercial.revenue.current",
        "commercial.closed.current",
      ],
    }),
  ];

  const dashboardRows = labelRows(sheetRows(input.workbook, "DASHBOARD"));
  const checks = [
    ["PACIENTES ATENDIDOS", attended],
    ["PACIENTES FECHADOS", closed.length],
    ["PACIENTES EM NEGOCIACAO", negotiating.length],
    ["CONVERSAO GERAL", attended ? closed.length / attended : 0],
    ["RECEITA FECHADA", revenue],
    ["PIPELINE ABERTO", pipeline],
    ["TICKET MEDIO GERAL", attended ? revenue / attended : 0],
  ] as const;

  for (const [label, calculated] of checks) {
    const expected = finiteNumber(dashboardRows.get(label)?.[1]);
    if (expected === null || Math.abs(expected - calculated) > 0.01) {
      issues.push({
        severity: "CRITICAL",
        code: "CLOSER_DASHBOARD_MISMATCH",
        message: `A aba Dashboard da Closer diverge no indicador ${label}.`,
        source: "closer",
        details: { expected, calculated },
      });
    }
  }

  const byProfessional = [...new Set(rows.map((row) => row.professional))].map(
    (professional) => {
      const cohort = rows.filter((row) => row.professional === professional);
      const cohortClosed = cohort.filter((row) => row.status === "FECHOU");
      const consultationRevenue = cohort.reduce(
        (sum, row) => sum + row.consultation,
        0,
      );
      const treatmentRevenue = cohortClosed.reduce(
        (sum, row) => sum + row.treatment,
        0,
      );
      const cohortRevenue = consultationRevenue + treatmentRevenue;
      const cohortPipeline = cohort
        .filter((row) => row.status === "NEGOCIACAO")
        .reduce((sum, row) => sum + row.proposal, 0);
      return {
        professional,
        attended: cohort.length,
        closed: cohortClosed.length,
        closeRate: cohort.length ? cohortClosed.length / cohort.length : 0,
        revenue: cohortRevenue,
        consultationRevenue,
        treatmentRevenue,
        pipeline: cohortPipeline,
      };
    },
  );

  const byJourney = [...new Set(rows.map((row) => row.journey))].map(
    (journey) => {
      const cohort = rows.filter((row) => row.journey === journey);
      const cohortClosed = cohort.filter((row) => row.status === "FECHOU");
      const cohortRevenue =
        cohort.reduce((sum, row) => sum + row.consultation, 0) +
        cohortClosed.reduce((sum, row) => sum + row.treatment, 0);
      return {
        journey,
        attended: cohort.length,
        closed: cohortClosed.length,
        closeRate: cohort.length ? cohortClosed.length / cohort.length : 0,
        revenue: cohortRevenue,
        ticket: cohort.length ? cohortRevenue / cohort.length : 0,
      };
    },
  );

  return {
    source: sourceSummary("closer", input, periodHint, rows.length),
    metrics,
    breakdowns: {
      "commercial.professionals": byProfessional,
      "commercial.journeys": byJourney,
    },
    issues,
  };
}
