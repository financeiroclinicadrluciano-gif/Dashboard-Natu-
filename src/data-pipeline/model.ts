import { z } from "zod";

export const sourceRoleSchema = z.enum([
  "marketing",
  "closer",
  "appointments",
  "form",
  "finance",
]);

export type SourceRole = z.infer<typeof sourceRoleSchema>;

export const metricStatusSchema = z.enum(["VALIDATED", "WARNING", "SEM_BASE"]);
export type MetricStatus = z.infer<typeof metricStatusSchema>;

export const metricSchema = z.object({
  id: z.string().min(3),
  label: z.string().min(2),
  value: z.number().finite().nullable(),
  unit: z.enum(["COUNT", "BRL", "PERCENT", "RATIO", "DAYS"]),
  status: metricStatusSchema,
  period: z.string().regex(/^\d{4}-\d{2}$/),
  source: sourceRoleSchema,
  sheet: z.string().min(1),
  formula: z.string().nullable(),
  dependencies: z.array(z.string()).default([]),
  note: z.string().nullable(),
});

export type DashboardMetric = z.infer<typeof metricSchema>;

export const validationIssueSchema = z.object({
  severity: z.enum(["CRITICAL", "WARNING", "INFO"]),
  code: z.string().min(3),
  message: z.string().min(5),
  source: sourceRoleSchema.optional(),
  details: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional(),
});

export type ValidationIssue = z.infer<typeof validationIssueSchema>;

export const sourceSummarySchema = z.object({
  role: sourceRoleSchema,
  fileName: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  period: z.string().regex(/^\d{4}-\d{2}$/),
  sheets: z.array(z.string()).min(1),
  records: z.number().int().nonnegative(),
});

export type SourceSummary = z.infer<typeof sourceSummarySchema>;

const scalarSchema = z.union([z.string(), z.number(), z.null()]);

export const dashboardSnapshotSchema = z.object({
  version: z.literal("1.0.0"),
  importId: z.string().min(8),
  generatedAt: z.string().datetime(),
  primaryPeriod: z.string().regex(/^\d{4}-\d{2}$/),
  validation: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    issues: z.array(validationIssueSchema),
  }),
  sources: z.array(sourceSummarySchema).length(5),
  metrics: z.record(z.string(), metricSchema),
  breakdowns: z.record(
    z.string(),
    z.array(z.record(z.string(), scalarSchema)),
  ),
});

export type DashboardSnapshot = z.infer<typeof dashboardSnapshotSchema>;

export const analysisScopeSchema = z.enum([
  "executive",
  "funnel",
  "marketing",
  "organic",
  "commercial",
  "appointments",
  "finance",
  "data_quality",
]);

export type AnalysisScope = z.infer<typeof analysisScopeSchema>;

export const analysisPackageSchema = z.object({
  version: z.literal("1.0.0"),
  importId: z.string().min(8),
  generatedAt: z.string().datetime(),
  skill: z.literal("natua-data-analyst"),
  sections: z
    .array(
      z.object({
        scope: analysisScopeSchema,
        headline: z.string().min(12).max(220),
        confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
        signals: z
          .array(
            z.object({
              type: z.enum([
                "POSITIVE",
                "WARNING",
                "RISK",
                "LIMITATION",
                "HYPOTHESIS",
              ]),
              evidence: z.string().min(8),
              interpretation: z.string().min(8),
              metricIds: z.array(z.string()).default([]),
            }),
          )
          .min(1)
          .max(4),
        decisions: z
          .array(
            z.object({
              priority: z.enum(["P0", "P1", "P2"]),
              action: z.string().min(10),
              owner: z.string().min(2),
              deadline: z.string().min(2),
              successMetric: z.string().min(5),
              metricIds: z.array(z.string()).default([]),
            }),
          )
          .max(3),
        limitations: z.array(z.string().min(5)),
        sourceRefs: z.array(z.string().min(3)).min(1),
      }),
    )
    .length(8),
});

export type AnalysisPackage = z.infer<typeof analysisPackageSchema>;

export interface PipelineResult {
  snapshot: DashboardSnapshot;
  analysis: AnalysisPackage;
}

