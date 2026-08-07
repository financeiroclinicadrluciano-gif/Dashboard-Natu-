import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  dashboardSnapshotSchema,
  type DashboardMetric,
  type DashboardSnapshot,
} from "../src/data-pipeline/model";

/**
 * Regressao do fechamento aprovado.
 *
 * O snapshot publicado e substituido a cada atualizacao, entao ate 2026-08-07 a
 * unica prova de que ele continuava certo era alguem reconferir a mao. Estes
 * testes trocam isso por um gate: enquanto o painel estiver no periodo do
 * baseline, os 30 numeros aprovados tem que bater; passando o periodo, a
 * cobertura ainda nao pode regredir.
 *
 * Numero que muda porque a fonte mudou exige NOVO fechamento aprovado e edicao
 * explicita do baseline. Editar o baseline para o teste passar inverte o
 * proposito do gate.
 */

interface Baseline {
  period: string;
  coverage: string;
  source: string;
  tolerance: Record<string, number>;
  metrics: Record<string, { value: number; unit: string }>;
}

const BASELINE_PATH = "tests/baselines/fechamento-2026-07.json";
const SNAPSHOT_PATH = "public/data/dashboard-snapshot.json";

async function readJson<T>(relativePath: string): Promise<T> {
  return JSON.parse(
    await fs.readFile(path.resolve(relativePath), "utf8"),
  ) as T;
}

const baseline = await readJson<Baseline>(BASELINE_PATH);
const snapshot = dashboardSnapshotSchema.parse(
  await readJson<unknown>(SNAPSHOT_PATH),
) as DashboardSnapshot;

function metricOf(id: string): DashboardMetric {
  const found = snapshot.metrics[id];
  assert.ok(found, `Metrica do fechamento ausente do snapshot: ${id}`);
  return found;
}

test("o baseline cobre exatamente as 30 metricas do fechamento aprovado", () => {
  assert.equal(Object.keys(baseline.metrics).length, 30);
});

test("toda metrica do baseline existe no snapshot publicado", () => {
  for (const id of Object.keys(baseline.metrics)) {
    metricOf(id);
  }
});

test("nenhuma metrica do fechamento regride para SEM_BASE", () => {
  const regressed = Object.keys(baseline.metrics).filter(
    (id) => metricOf(id).status === "SEM_BASE" || metricOf(id).value === null,
  );

  assert.deepEqual(
    regressed,
    [],
    "metricas que ja tinham fonte auditavel nao podem voltar a SEM_BASE",
  );
});

test("as unidades declaradas no fechamento nao mudam sem decisao", () => {
  for (const [id, expected] of Object.entries(baseline.metrics)) {
    assert.equal(
      metricOf(id).unit,
      expected.unit,
      `unidade divergente em ${id}`,
    );
  }
});

test("toda metrica do fechamento carrega proveniencia", () => {
  for (const id of Object.keys(baseline.metrics)) {
    const item = metricOf(id);
    assert.ok(item.source, `${id} sem fonte declarada`);
    assert.ok(item.sheet, `${id} sem aba de origem`);
    assert.equal(
      item.period.length,
      7,
      `${id} sem competencia no formato AAAA-MM`,
    );
  }
});

test("no periodo do baseline, os 30 numeros aprovados batem", (t) => {
  if (snapshot.primaryPeriod !== baseline.period) {
    t.skip(
      `Painel em ${snapshot.primaryPeriod}; baseline e de ${baseline.period}. ` +
        "Os testes de existencia, unidade e nao-regressao continuam valendo.",
    );
    return;
  }

  const failures: string[] = [];
  for (const [id, expected] of Object.entries(baseline.metrics)) {
    const item = metricOf(id);
    const tolerance = baseline.tolerance[expected.unit] ?? 0;
    const delta = Math.abs((item.value ?? Number.NaN) - expected.value);
    if (!(delta <= tolerance)) {
      failures.push(
        `${id}: snapshot ${item.value} x fechamento ${expected.value} (delta ${delta.toFixed(4)}, tolerancia ${tolerance})`,
      );
    }
  }

  assert.deepEqual(
    failures,
    [],
    `Divergencias contra ${baseline.source} (${baseline.coverage})`,
  );
});

test("o snapshot publicado nao esta reprovado pelos gates", () => {
  assert.equal(snapshot.validation.status, "APPROVED");
  assert.deepEqual(
    snapshot.validation.issues.filter(
      (issue) => issue.severity === "CRITICAL",
    ),
    [],
  );
});

test("as cinco fontes obrigatorias continuam presentes no snapshot", () => {
  const roles = new Set(snapshot.sources.map((source) => source.role));
  for (const role of ["marketing", "closer", "appointments", "form", "finance"]) {
    assert.ok(roles.has(role as never), `fonte obrigatoria ausente: ${role}`);
  }
});
