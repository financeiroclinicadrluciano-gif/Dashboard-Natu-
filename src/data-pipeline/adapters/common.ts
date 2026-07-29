import type {
  DashboardMetric,
  SourceRole,
  SourceSummary,
  ValidationIssue,
} from "../model";
import {
  finiteNumber,
  normalizeText,
  type SheetRows,
  type WorkbookInput,
} from "../workbooks";

export interface AdapterResult {
  source: SourceSummary;
  metrics: DashboardMetric[];
  breakdowns: Record<string, Array<Record<string, string | number | null>>>;
  issues: ValidationIssue[];
}

interface MetricOptions {
  id: string;
  label: string;
  value: number | null;
  unit: DashboardMetric["unit"];
  status?: DashboardMetric["status"];
  period: string;
  source: SourceRole;
  sheet: string;
  formula?: string | null;
  dependencies?: string[];
  note?: string | null;
}

export function metric(options: MetricOptions): DashboardMetric {
  return {
    status: options.value === null ? "SEM_BASE" : "VALIDATED",
    formula: null,
    dependencies: [],
    note: null,
    ...options,
  };
}

export function labelRows(
  rows: SheetRows,
  column = 0,
): Map<string, SheetRows[number]> {
  const map = new Map<string, SheetRows[number]>();
  for (const row of rows) {
    const label = normalizeText(row[column]);
    if (label && !map.has(label)) {
      map.set(label, row);
    }
  }
  return map;
}

export function findRow(
  rows: Map<string, SheetRows[number]>,
  pattern: RegExp,
): SheetRows[number] | null {
  for (const [label, row] of rows) {
    if (pattern.test(label)) {
      return row;
    }
  }
  return null;
}

export function rowNumber(
  rows: Map<string, SheetRows[number]>,
  pattern: RegExp,
  column: number,
): number | null {
  return finiteNumber(findRow(rows, pattern)?.[column]);
}

export function sourceSummary(
  role: SourceRole,
  input: WorkbookInput,
  period: string,
  records: number,
): SourceSummary {
  return {
    role,
    fileName: `${role}.xlsx`,
    sha256: input.sha256,
    period,
    sheets: input.workbook.SheetNames,
    records,
  };
}

export function requiredNumber(
  value: number | null,
  code: string,
  message: string,
  source: SourceRole,
  issues: ValidationIssue[],
): number | null {
  if (value === null) {
    issues.push({ severity: "CRITICAL", code, message, source });
  }
  return value;
}
