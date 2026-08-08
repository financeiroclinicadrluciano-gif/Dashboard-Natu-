import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  PipelineRejectedError,
  processWorkbooks,
} from "../src/data-pipeline/pipeline";
import { createWorkbookInput } from "../src/data-pipeline/workbooks";

/**
 * Teste end-to-end: regenera o snapshot a partir das planilhas brutas e confere
 * o resultado contra o fechamento aprovado.
 *
 * Isto e mais forte do que `regressao-fechamento.test.ts`. La comparamos o
 * artefato ja publicado com o baseline — se o publicador estivesse errado, os
 * dois estariam errados juntos. Aqui o pipeline roda do zero sobre as fontes e
 * precisa CHEGAR nos 30 numeros sozinho.
 *
 * As planilhas contem nome e telefone de paciente e lead, entao nunca entram no
 * repositorio. Coloque-as em `.data/` (ja no .gitignore) e o teste roda; sem a
 * pasta, ele e pulado com aviso em vez de falhar.
 */

const DATA_DIR = process.env.DASHBOARD_E2E_DIR ?? ".data";
const BASELINE_PATH = "tests/baselines/fechamento-2026-07.json";

interface Baseline {
  period: string;
  source: string;
  tolerance: Record<string, number>;
  metrics: Record<string, { value: number; unit: string }>;
}

function workbookPaths(): string[] {
  const dir = path.resolve(DATA_DIR);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => /\.(xlsx|xlsm|xls)$/i.test(name))
    .sort()
    .map((name) => path.join(dir, name));
}

const REQUIRED_SOURCES = [
  "marketing",
  "closer",
  "appointments",
  "form",
  "finance",
] as const;

test("o pipeline regenera o fechamento aprovado a partir das planilhas brutas", (t) => {
  const files = workbookPaths();
  if (files.length < REQUIRED_SOURCES.length) {
    t.skip(
      `Coloque as ${REQUIRED_SOURCES.length} planilhas-fonte em ${DATA_DIR}/ ` +
        "(ou aponte DASHBOARD_E2E_DIR) para rodar a regeneracao end-to-end. " +
        `Encontradas: ${files.length}.`,
    );
    return;
  }

  const baseline = JSON.parse(
    fs.readFileSync(path.resolve(BASELINE_PATH), "utf8"),
  ) as Baseline;

  const inputs = files.map((file) =>
    createWorkbookInput(file, fs.readFileSync(file)),
  );

  let snapshot;
  try {
    snapshot = processWorkbooks(inputs).snapshot;
  } catch (error) {
    if (error instanceof PipelineRejectedError) {
      assert.fail(
        `Pipeline rejeitou as fontes:\n${error.issues
          .map((issue) => `  [${issue.severity}] ${issue.code} — ${issue.message}`)
          .join("\n")}`,
      );
    }
    throw error;
  }

  assert.equal(snapshot.validation.status, "APPROVED");

  const roles = new Set(snapshot.sources.map((source) => source.role));
  for (const role of REQUIRED_SOURCES) {
    assert.ok(roles.has(role), `fonte obrigatoria ausente: ${role}`);
  }

  if (snapshot.primaryPeriod !== baseline.period) {
    t.diagnostic(
      `Fontes em ${snapshot.primaryPeriod}; baseline e de ${baseline.period}. ` +
        "Conferencia de valores pulada; estrutura verificada.",
    );
    return;
  }

  const failures: string[] = [];
  for (const [id, expected] of Object.entries(baseline.metrics)) {
    const actual = snapshot.metrics[id]?.value;
    const tolerance = baseline.tolerance[expected.unit] ?? 0;
    if (
      actual === null ||
      actual === undefined ||
      Math.abs(actual - expected.value) > tolerance
    ) {
      failures.push(`${id}: gerado ${actual} x fechamento ${expected.value}`);
    }
  }

  assert.deepEqual(
    failures,
    [],
    `O pipeline nao reproduziu ${baseline.source} a partir das fontes`,
  );
});

test("a planilha semanal entra como sexta fonte sem alterar as cinco obrigatorias", (t) => {
  const files = workbookPaths();
  if (files.length < REQUIRED_SOURCES.length + 1) {
    t.skip(
      `Precisa das ${REQUIRED_SOURCES.length} fontes + a planilha semanal em ${DATA_DIR}/.`,
    );
    return;
  }

  const inputs = files.map((file) =>
    createWorkbookInput(file, fs.readFileSync(file)),
  );
  const { snapshot } = processWorkbooks(inputs);

  assert.equal(snapshot.validation.status, "APPROVED");
  assert.ok(
    snapshot.sources.some((source) => source.role === "weekly"),
    "a semanal precisa ter sido classificada",
  );
  assert.ok(
    snapshot.metrics["weekly.attended.current"],
    "as metricas semanais precisam chegar ao snapshot",
  );
  // A semanal e um recorte contido no mes; nunca pode ter mais atendimentos.
  assert.ok(
    (snapshot.metrics["weekly.attended.current"]?.value ?? 0) <=
      (snapshot.metrics["commercial.attended.current"]?.value ?? 0),
  );
});
