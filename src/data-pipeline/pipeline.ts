import {
  adaptAppointments,
  adaptCloser,
  adaptFinance,
  adaptForm,
  adaptMarketing,
  adaptWeekly,
  type AdapterResult,
} from "./adapters";
import {
  buildAnalysis,
  validateAnalysisEvidence,
} from "./analysis";
import {
  analysisPackageSchema,
  dashboardSnapshotSchema,
  type DashboardMetric,
  type DashboardSnapshot,
  type PipelineResult,
  type SourceRole,
  type ValidationIssue,
} from "./model";
import {
  classifyWorkbooks,
  type WorkbookInput,
} from "./workbooks";

function monthDistance(a: string, b: string): number {
  const [aYear, aMonth] = a.split("-").map(Number);
  const [bYear, bMonth] = b.split("-").map(Number);
  return Math.abs((aYear - bYear) * 12 + aMonth - bMonth);
}

function containsPii(value: unknown, key = ""): boolean {
  const metadataKeys = new Set([
    "sha256",
    "importId",
    "generatedAt",
    "period",
    "primaryPeriod",
    "fileName",
  ]);
  if (
    metadataKeys.has(key) ||
    typeof value === "number" ||
    value === null
  ) {
    return false;
  }
  if (typeof value === "string") {
    const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    const phone =
      /(?:\+?55[\s.-]*)?\(?\d{2}\)?[\s.-]*9?\d{4}[\s.-]?\d{4}/;
    return email.test(value) || phone.test(value);
  }
  if (Array.isArray(value)) {
    return value.some((item) => containsPii(item));
  }
  if (typeof value === "object") {
    const forbiddenKeys = new Set([
      "patient",
      "patient_id",
      "patient_name",
      "paciente",
      "paciente_id",
      "paciente_nome",
      "full_name",
      "phone",
      "phone_number",
      "telefone",
      "email",
      "cpf",
      "document",
    ]);
    return Object.entries(value).some(([childKey, childValue]) => {
      if (forbiddenKeys.has(childKey.toLocaleLowerCase("pt-BR"))) {
        return true;
      }
      return containsPii(childValue, childKey);
    });
  }
  return false;
}

function metricMap(results: AdapterResult[]): Record<string, DashboardMetric> {
  const metrics: Record<string, DashboardMetric> = {};
  for (const result of results) {
    for (const item of result.metrics) {
      if (metrics[item.id]) {
        throw new Error(`Metrica duplicada: ${item.id}`);
      }
      metrics[item.id] = item;
    }
  }
  return metrics;
}

interface SnapshotBase {
  version: "1.0.0";
  importId: string;
  generatedAt: string;
  primaryPeriod: string;
  sources: DashboardSnapshot["sources"];
  metrics: DashboardSnapshot["metrics"];
  breakdowns: DashboardSnapshot["breakdowns"];
}

function crossValidate(snapshot: SnapshotBase): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const marketingAttended =
    snapshot.metrics["marketing.commercial.attended.current"]?.value;
  const closerAttended =
    snapshot.metrics["commercial.attended.current"]?.value;

  if (
    marketingAttended !== null &&
    marketingAttended !== undefined &&
    closerAttended !== null &&
    closerAttended !== undefined &&
    Math.abs(marketingAttended - closerAttended) > 0.01
  ) {
    issues.push({
      severity: "CRITICAL",
      code: "MARKETING_CLOSER_ATTENDED_MISMATCH",
      message:
        "O consolidado de Marketing diverge da Closer em atendimentos comerciais.",
      details: { marketingAttended, closerAttended },
    });
  }

  // A planilha semanal cobre um recorte contido no mes da Closer. Ela pode ter
  // menos atendimentos que a Closer; ter MAIS e impossivel e indica recorte
  // errado, arquivo de outro mes ou o detector de fim-de-bloco tendo lido o
  // pivo como se fosse detalhe.
  const weeklyAttended = snapshot.metrics["weekly.attended.current"]?.value;
  if (
    typeof weeklyAttended === "number" &&
    typeof closerAttended === "number" &&
    weeklyAttended > closerAttended + 0.01
  ) {
    issues.push({
      severity: "WARNING",
      code: "WEEKLY_EXCEEDS_CLOSER",
      message:
        "A planilha semanal tem mais atendimentos que a Closer do mes; confira o recorte do arquivo.",
      source: "weekly",
      details: { weeklyAttended, closerAttended },
    });
  }

  const finance = snapshot.sources.find((source) => source.role === "finance");
  if (
    finance &&
    monthDistance(snapshot.primaryPeriod, finance.period) > 1
  ) {
    issues.push({
      severity: "WARNING",
      code: "FINANCE_PERIOD_STALE",
      message: `Financeiro em ${finance.period}, defasado do painel principal ${snapshot.primaryPeriod}.`,
      source: "finance",
    });
  }

  return issues;
}

export function processWorkbooks(
  workbooks: WorkbookInput[],
): PipelineResult {
  const classified = classifyWorkbooks(workbooks);
  const marketingInput = classified.inputs.get("marketing");

  if (
    classified.issues.some((issue) => issue.severity === "CRITICAL") ||
    !marketingInput
  ) {
    throw new PipelineRejectedError(classified.issues);
  }

  const marketing = adaptMarketing(marketingInput);
  const primaryPeriod = marketing.source.period;
  const results: AdapterResult[] = [marketing];
  const adapters: Array<[SourceRole, () => AdapterResult]> = [
    [
      "closer",
      () => adaptCloser(classified.inputs.get("closer")!, primaryPeriod),
    ],
    [
      "appointments",
      () => adaptAppointments(classified.inputs.get("appointments")!),
    ],
    ["form", () => adaptForm(classified.inputs.get("form")!, primaryPeriod)],
    ["finance", () => adaptFinance(classified.inputs.get("finance")!)],
    [
      "weekly",
      () => adaptWeekly(classified.inputs.get("weekly")!, primaryPeriod),
    ],
  ];

  for (const [role, adapter] of adapters) {
    if (classified.inputs.has(role)) {
      results.push(adapter());
    }
  }

  const generatedAt = new Date().toISOString();
  const metrics = metricMap(results);
  const breakdowns = Object.assign(
    {},
    ...results.map((result) => result.breakdowns),
  );
  const baseSnapshot: SnapshotBase = {
    version: "1.0.0",
    importId: classified.importId,
    generatedAt,
    primaryPeriod,
    sources: results.map((result) => result.source),
    metrics,
    breakdowns,
  };
  const issues = [
    ...classified.issues,
    ...results.flatMap((result) => result.issues),
    ...crossValidate(baseSnapshot),
  ];

  if (containsPii(baseSnapshot)) {
    issues.push({
      severity: "CRITICAL",
      code: "PII_IN_PUBLIC_SNAPSHOT",
      message: "Padrao de e-mail ou telefone detectado no snapshot agregado.",
    });
  }

  let snapshot = dashboardSnapshotSchema.parse({
    ...baseSnapshot,
    validation: {
      status: issues.some((issue) => issue.severity === "CRITICAL")
        ? "REJECTED"
        : "APPROVED",
      issues,
    },
  });

  if (snapshot.validation.status === "REJECTED") {
    throw new PipelineRejectedError(snapshot.validation.issues, snapshot);
  }

  const analysis = analysisPackageSchema.parse(buildAnalysis(snapshot));
  const analysisIssues = validateAnalysisEvidence(snapshot, analysis);
  if (containsPii(analysis)) {
    analysisIssues.push({
      severity: "CRITICAL",
      code: "PII_IN_PUBLIC_ANALYSIS",
      message: "Padrao de dado pessoal detectado no pacote de analise.",
    });
  }
  if (analysisIssues.length) {
    snapshot = dashboardSnapshotSchema.parse({
      ...snapshot,
      validation: {
        status: "REJECTED",
        issues: [...snapshot.validation.issues, ...analysisIssues],
      },
    });
    throw new PipelineRejectedError(snapshot.validation.issues, snapshot);
  }

  return { snapshot, analysis };
}

export class PipelineRejectedError extends Error {
  constructor(
    readonly issues: ValidationIssue[],
    readonly snapshot?: DashboardSnapshot,
  ) {
    super("Importacao rejeitada pelos gates de qualidade.");
    this.name = "PipelineRejectedError";
  }
}
