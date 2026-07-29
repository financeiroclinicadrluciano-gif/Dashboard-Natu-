import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import * as XLSX from "xlsx";

import {
  buildAnalysis,
  validateAnalysisEvidence,
} from "../src/data-pipeline/analysis";
import {
  adaptCloser,
  adaptFinance,
} from "../src/data-pipeline/adapters";
import {
  dashboardSnapshotSchema,
  type DashboardMetric,
  type DashboardSnapshot,
} from "../src/data-pipeline/model";
import {
  createWorkbookInput,
  detectWorkbookRole,
} from "../src/data-pipeline/workbooks";

function workbookBuffer(sheets: Record<string, unknown[][]>): Buffer {
  const workbook = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(rows),
      name,
    );
  }
  return Buffer.from(
    XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
  );
}

test("classifica a Closer por assinatura, nao pelo nome do arquivo", () => {
  const input = createWorkbookInput(
    "arquivo-sem-padrao.xlsx",
    workbookBuffer({
      "Dr Teste": [
        [
          "1A CONSULTA",
          "JORNADA",
          "CONSULTA",
          "TRATAMENTO",
          "FECHOU/NÃO FECHOU/NEGOCIAÇÃO",
        ],
      ],
      DASHBOARD: [["KPI", "Resultado"]],
    }),
  );

  assert.equal(detectWorkbookRole(input), "closer");
});

test("reconcilia linhas elegiveis da Closer com seu dashboard", () => {
  const input = createWorkbookInput(
    "closer.xlsx",
    workbookBuffer({
      "Dr Teste": [
        [
          "1A CONSULTA",
          "JORNADA",
          "CONSULTA",
          "TRATAMENTO",
          "FECHOU/NÃO FECHOU/NEGOCIAÇÃO",
          "NOVA PROPOSTA",
        ],
        ["Paciente A", "1A", 500, 5000, "FECHOU", null],
        ["Paciente B", "2A", 300, null, "NEGOCIAÇÃO", 2500],
        [
          "TOTAL",
          "JORNADA",
          800,
          5000,
          "FECHOU/NÃO FECHOU/NEGOCIAÇÃO",
          null,
        ],
      ],
      DASHBOARD: [
        ["KPI", "Resultado"],
        ["Pacientes atendidos", 2],
        ["Pacientes fechados", 1],
        ["Pacientes em negociação", 1],
        ["Conversão Geral", 0.5],
        ["Receita Fechada", 5800],
        ["Pipeline Aberto", 2500],
        ["Ticket Médio Geral", 2900],
      ],
    }),
  );

  const result = adaptCloser(input, "2026-07");
  assert.equal(
    result.issues.filter((issue) => issue.severity === "CRITICAL").length,
    0,
  );
  assert.equal(
    result.metrics.find(
      (item) => item.id === "commercial.attended.current",
    )?.value,
    2,
  );
  assert.equal(
    result.metrics.find(
      (item) => item.id === "commercial.revenue.current",
    )?.value,
    5800,
  );
});

test("financeiro preserva o primeiro bloco valido da DRE e agrega caixa", () => {
  const input = createWorkbookInput(
    "financeiro.xlsx",
    workbookBuffer({
      DASHBOARD: [[new Date(2026, 4, 1)]],
      BASE: [
        ["RELATORIO"],
        [
          "COD_PC_FINAL",
          "VALOR_FINAL",
          "MES_COMP",
          "Status",
          "TIPO",
          "GRUPO_PC",
        ],
        ["1", 300000, new Date(2026, 4, 1), "QUITADO", "ENTRADA", "VENDAS"],
        ["2", -120000, new Date(2026, 4, 1), "QUITADO", "SAIDA", "PRODUTOS"],
        ["3", 50000, new Date(2026, 5, 1), "A VENCER", "ENTRADA", "VENDAS"],
        ["4", -10000, new Date(2026, 5, 1), "VENCIDO", "SAIDA", "IMPOSTOS"],
      ],
      "REL DRE": [
        [null, "VENDAS OPERACIONAIS", null, 300000],
        [null, "DEDUCOES DAS RECEITAS", null, -20000],
        [null, "CUSTO VARIAVEL", null, -150000],
        [null, "LUCRO BRUTO", null, 130000],
        [null, "DESPESAS FIXAS", null, -100000],
        [null, "VENDAS OPERACIONAIS", null, 0],
        [null, "LUCRO BRUTO", null, 0],
      ],
    }),
  );

  const result = adaptFinance(input);
  const byId = new Map(result.metrics.map((item) => [item.id, item.value]));
  assert.equal(byId.get("finance.sales.current"), 300000);
  assert.equal(byId.get("finance.result.current"), 30000);
  assert.equal(byId.get("finance.cash_in.current"), 50000);
  assert.equal(byId.get("finance.cash_out.current"), 10000);
  assert.equal(byId.get("finance.due.current"), 50000);
  assert.equal(byId.get("finance.overdue.current"), 10000);
  assert.equal(result.breakdowns["finance.monthly_cash_flow"].length, 2);
});

function metric(
  id: string,
  metricValue: number | null,
  unit: DashboardMetric["unit"] = "COUNT",
  source: DashboardMetric["source"] = "marketing",
  period = "2026-07",
): DashboardMetric {
  return {
    id,
    label: id,
    value: metricValue,
    unit,
    status: metricValue === null ? "SEM_BASE" : "VALIDATED",
    period,
    source,
    sheet: "TESTE",
    formula: null,
    dependencies: [],
    note: null,
  };
}

test("a Skill gera exatamente uma analise para cada tela", () => {
  const values: Array<
    [
      string,
      number | null,
      DashboardMetric["unit"]?,
      DashboardMetric["source"]?,
      string?,
    ]
  > = [
    ["marketing.investment.total.current", 10000, "BRL"],
    [
      "marketing.investment.total.previous",
      12000,
      "BRL",
      "marketing",
      "2026-06",
    ],
    ["marketing.leads.meta.current", 1000],
    [
      "marketing.leads.meta.previous",
      900,
      "COUNT",
      "marketing",
      "2026-06",
    ],
    ["marketing.mql.current", 100],
    ["marketing.mql.previous", 120, "COUNT", "marketing", "2026-06"],
    ["marketing.rate.mql.current", 0.1, "PERCENT"],
    [
      "marketing.rate.mql.previous",
      0.12,
      "PERCENT",
      "marketing",
      "2026-06",
    ],
    ["marketing.forms.valid.current", 1000],
    ["marketing.appointments.marketing.current", 20],
    ["marketing.cpl.total.current", 10, "BRL"],
    [
      "marketing.cpl.total.previous",
      13.33,
      "BRL",
      "marketing",
      "2026-06",
    ],
    ["marketing.cost.mql.current", 100, "BRL"],
    ["commercial.attended.current", 30, "COUNT", "closer"],
    ["commercial.closed.current", 20, "COUNT", "closer"],
    [
      "commercial.close_rate.current",
      2 / 3,
      "PERCENT",
      "closer",
    ],
    ["commercial.revenue.current", 200000, "BRL", "closer"],
    ["commercial.pipeline.current", 30000, "BRL", "closer"],
    ["commercial.missing_status.current", 1, "COUNT", "closer"],
    ["appointments.raw.current", 20, "COUNT", "appointments"],
    [
      "appointments.missing_consultation_date.current",
      6,
      "COUNT",
      "appointments",
    ],
    [
      "appointments.missing_owner.current",
      2,
      "COUNT",
      "appointments",
    ],
    [
      "appointments.confirmed.current",
      null,
      "COUNT",
      "appointments",
    ],
    ["appointments.no_show.current", null, "COUNT", "appointments"],
    ["finance.result.current", 30000, "BRL", "finance", "2026-05"],
    ["finance.sales.current", 300000, "BRL", "finance", "2026-05"],
    ["organic.doctor.reach.current", 200000],
    ["organic.doctor.bio_clicks.current", 800],
    ["organic.natua.reach.current", 70000],
    ["organic.natua.bio_clicks.current", 50],
    ["organic.doctor.visit_rate.current", 0.05, "PERCENT"],
    ["organic.natua.visit_rate.current", 0.01, "PERCENT"],
    ["organic.natua.bio_click_rate.current", 0.08, "PERCENT"],
  ];
  const metrics = Object.fromEntries(
    values.map(([id, metricValue, unit, source, period]) => [
      id,
      metric(id, metricValue, unit, source, period),
    ]),
  );
  const sources = [
    ["marketing", "2026-07"],
    ["closer", "2026-07"],
    ["appointments", "2026-07"],
    ["form", "2026-07"],
    ["finance", "2026-05"],
  ] as const;
  const snapshot = dashboardSnapshotSchema.parse({
    version: "1.0.0",
    importId: "2026-07-29-test-import",
    generatedAt: new Date().toISOString(),
    primaryPeriod: "2026-07",
    validation: { status: "APPROVED", issues: [] },
    sources: sources.map(([role, period]) => ({
      role,
      fileName: `${role}.xlsx`,
      sha256: "a".repeat(64),
      period,
      sheets: ["TESTE"],
      records: 1,
    })),
    metrics,
    breakdowns: {},
  }) as DashboardSnapshot;

  const analysis = buildAnalysis(snapshot);
  assert.equal(analysis.sections.length, 8);
  assert.equal(new Set(analysis.sections.map((item) => item.scope)).size, 8);
  assert.deepEqual(validateAnalysisEvidence(snapshot, analysis), []);
});

test("artefatos publicos nao expoem campos ou padroes de PII", async () => {
  const files = [
    "public/data/dashboard-snapshot.json",
    "public/data/analysis-package.json",
  ];
  const forbiddenKey =
    /^(patient|patient_id|patient_name|paciente|paciente_id|paciente_nome|full_?name|phone(_number)?|telefone|email|e-mail|cpf|document)$/i;
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const brazilianPhone =
    /(?:\+?55\s*)?\(?\d{2}\)?[\s.-]*9?\d{4}[\s.-]*\d{4}/;
  const metadataKeys = new Set([
    "sha256",
    "importId",
    "generatedAt",
    "period",
    "primaryPeriod",
    "fileName",
  ]);

  const visit = (value: unknown, location: string): void => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${location}[${index}]`));
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        assert.doesNotMatch(key, forbiddenKey, `Campo proibido em ${location}`);
        if (metadataKeys.has(key)) {
          continue;
        }
        visit(child, `${location}.${key}`);
      }
      return;
    }
    if (typeof value === "string") {
      assert.doesNotMatch(value, email, `E-mail detectado em ${location}`);
      assert.doesNotMatch(
        value,
        brazilianPhone,
        `Telefone detectado em ${location}`,
      );
    }
  };

  for (const file of files) {
    const payload = JSON.parse(
      await fs.readFile(path.resolve(file), "utf8"),
    ) as unknown;
    visit(payload, file);
  }
});
