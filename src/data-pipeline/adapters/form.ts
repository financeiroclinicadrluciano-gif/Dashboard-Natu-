import type { ValidationIssue } from "../model";
import {
  inferWorkbookYear,
  normalizeText,
  periodFromSheetName,
  sheetRows,
  type WorkbookInput,
} from "../workbooks";
import {
  metric,
  sourceSummary,
  type AdapterResult,
} from "./common";

export function adaptForm(
  input: WorkbookInput,
  periodHint: string,
): AdapterResult {
  const issues: ValidationIssue[] = [];
  const year = inferWorkbookYear(input);
  const sheetName =
    input.workbook.SheetNames.find(
      (name) =>
        normalizeText(name).startsWith("FORM ") &&
        periodFromSheetName(name, year) === periodHint,
    ) ??
    input.workbook.SheetNames.find((name) =>
      normalizeText(name).startsWith("FORM "),
    );

  if (!sheetName) {
    return {
      source: sourceSummary("form", input, periodHint, 0),
      metrics: [],
      breakdowns: {},
      issues: [
        {
          severity: "CRITICAL",
          code: "FORM_SHEET_MISSING",
          message: "Nenhuma aba mensal de formulario foi encontrada.",
          source: "form",
        },
      ],
    };
  }

  const rows = sheetRows(input.workbook, sheetName);
  const headers = rows[0].map(normalizeText);
  const idIndex = headers.findIndex((header) => header === "ID");
  const statusIndex = headers.findIndex((header) => header === "LEAD_STATUS");
  const records = rows.slice(1).filter((row) =>
    idIndex >= 0 ? Boolean(row[idIndex]) : row.some(Boolean),
  );
  const statuses = new Map<string, number>();

  for (const row of records) {
    const status =
      statusIndex >= 0
        ? normalizeText(row[statusIndex]) || "VAZIO"
        : "SEM CAMPO";
    statuses.set(status, (statuses.get(status) ?? 0) + 1);
  }

  if (!statuses.has("MQL")) {
    issues.push({
      severity: "INFO",
      code: "FORM_MQL_CLASSIFICATION_EXTERNAL",
      message:
        "A aba mensal de formulario nao contem classificacao MQL final; o consolidado auditado permanece na fonte Marketing.",
      source: "form",
    });
  }

  return {
    source: sourceSummary("form", input, periodHint, records.length),
    metrics: [
      metric({
        id: "form.submissions.raw.current",
        label: "Submissoes brutas da aba mensal",
        value: records.length,
        unit: "COUNT",
        period: periodHint,
        source: "form",
        sheet: sheetName,
      }),
      metric({
        id: "form.mql.current",
        label: "MQL na aba mensal",
        value: statuses.get("MQL") ?? null,
        unit: "COUNT",
        status: statuses.has("MQL") ? "VALIDATED" : "SEM_BASE",
        period: periodHint,
        source: "form",
        sheet: sheetName,
        note: statuses.has("MQL")
          ? null
          : "A classificacao validada esta no consolidado de Marketing.",
      }),
    ],
    breakdowns: {
      "form.statuses": [...statuses].map(([status, count]) => ({
        status,
        count,
      })),
    },
    issues,
  };
}

