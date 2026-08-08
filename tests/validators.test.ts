import assert from "node:assert/strict";
import test from "node:test";

import type { DashboardMetric, DashboardSnapshot } from "../src/data-pipeline/model";
import { validateLogic } from "../src/data-pipeline/validators";

/**
 * Cada teste parte de um snapshot COERENTE e quebra exatamente uma coisa.
 * O primeiro teste prova que o coerente passa limpo — sem ele, um validador que
 * reprovasse tudo passaria em todos os outros.
 */

function m(
  id: string,
  value: number | null,
  unit: DashboardMetric["unit"] = "COUNT",
): DashboardMetric {
  return {
    id,
    label: id,
    value,
    unit,
    status: value === null ? "SEM_BASE" : "VALIDATED",
    period: "2026-07",
    source: "marketing",
    sheet: "TESTE",
    formula: null,
    dependencies: [],
    note: null,
  };
}

/** Números reais do fechamento aprovado 01–28/07. */
function coerente() {
  const metrics: Record<string, DashboardMetric> = {};
  const add = (
    id: string,
    value: number | null,
    unit: DashboardMetric["unit"] = "COUNT",
  ) => {
    metrics[id] = m(id, value, unit);
  };

  add("marketing.investment.total.current", 24497.75, "BRL");
  add("marketing.investment.meta.current", 24497.75, "BRL");
  add("marketing.investment.google.current", 0, "BRL");
  add("marketing.investment.leadgen.current", 20550.33, "BRL");
  add("marketing.leads.meta.current", 1441);
  add("marketing.cpl.total.current", 24497.75 / 1441, "BRL");
  add("marketing.forms.valid.current", 1390);
  add("marketing.mql.current", 175);
  add("marketing.rate.mql.current", 175 / 1390, "PERCENT");
  add("marketing.cost.mql.current", 20550.33 / 175, "BRL");
  add("marketing.appointments.marketing.current", 14);
  add("marketing.cac.appointment.current", 24497.75 / 14, "BRL");
  add("appointments.raw.current", 20);
  add("commercial.attended.current", 33);
  add("commercial.closed.current", 26);
  add("commercial.negotiating.current", 5);
  add("commercial.not_closed.current", 1);
  add("commercial.missing_status.current", 1);
  add("commercial.revenue.current", 244512.1, "BRL");
  add("commercial.close_rate.current", 26 / 33, "PERCENT");
  add("commercial.ticket_attended.current", 244512.1 / 33, "BRL");
  add("commercial.ticket_closed.current", 244512.1 / 26, "BRL");
  add("finance.deductions.current", -26135.3, "BRL");
  add("finance.variable_cost.current", -146592.54, "BRL");
  add("finance.fixed_expenses.current", -98981.11, "BRL");

  const breakdowns: DashboardSnapshot["breakdowns"] = {
    "marketing.history": [
      { period: "2026-03", investment: 15639.45, leads: 811, mql: 117, appointments: 18 },
      { period: "2026-04", investment: 18415.14, leads: 1586, mql: 202, appointments: 25 },
      { period: "2026-05", investment: 36532.19, leads: 1481, mql: 160, appointments: 32 },
      { period: "2026-06", investment: 32932.54, leads: 1401, mql: 204, appointments: 19 },
      { period: "2026-07", investment: 24497.75, leads: 1441, mql: 175, appointments: 14 },
    ],
    "weekly.professionals": [
      { professional: "A", revenue: 50810.55, share: 50810.55 / 121523.33 },
      { professional: "B", revenue: 5527.1, share: 5527.1 / 121523.33 },
      { professional: "C", revenue: 34524.79, share: 34524.79 / 121523.33 },
      { professional: "D", revenue: 30660.89, share: 30660.89 / 121523.33 },
    ],
  };

  return { metrics, breakdowns };
}

function codes(snapshot: ReturnType<typeof coerente>): string[] {
  return validateLogic(snapshot).map((issue) => issue.code);
}

// ---------------------------------------------------------------------------

test("um snapshot coerente passa sem nenhuma violacao", () => {
  assert.deepEqual(validateLogic(coerente()), []);
});

test("SABOTAGEM: CPL que nao bate com investimento / leads", () => {
  const s = coerente();
  s.metrics["marketing.cpl.total.current"].value = 42;
  assert.ok(codes(s).includes("LOGIC_IDENTITY_BROKEN"));
});

test("SABOTAGEM: leads alterados quebram CPL e taxa derivada", () => {
  const s = coerente();
  // O erro esta no denominador, nao na metrica derivada — o gate acusa mesmo assim.
  s.metrics["marketing.leads.meta.current"].value = 900;
  assert.ok(codes(s).includes("LOGIC_IDENTITY_BROKEN"));
});

test("SABOTAGEM: taxa acima de 100%", () => {
  const s = coerente();
  s.metrics["marketing.rate.mql.current"].value = 1.4;
  assert.ok(codes(s).includes("LOGIC_RATE_OUT_OF_RANGE"));
});

test("SABOTAGEM: fechados maiores que atendidos", () => {
  const s = coerente();
  s.metrics["commercial.closed.current"].value = 40;
  const found = codes(s);
  assert.ok(found.includes("LOGIC_CONTAINMENT_BROKEN"));
});

test("SABOTAGEM: MQL maior que formularios validos", () => {
  const s = coerente();
  s.metrics["marketing.mql.current"].value = 2000;
  assert.ok(codes(s).includes("LOGIC_CONTAINMENT_BROKEN"));
});

test("SABOTAGEM: Meta + Google nao somam o investimento total", () => {
  const s = coerente();
  s.metrics["marketing.investment.google.current"].value = 5000;
  assert.ok(codes(s).includes("LOGIC_COMPOSITION_BROKEN"));
});

test("SABOTAGEM: um paciente some da decomposicao de status", () => {
  const s = coerente();
  s.metrics["commercial.not_closed.current"].value = 0;
  assert.ok(codes(s).includes("LOGIC_COMPOSITION_BROKEN"));
});

test("SABOTAGEM: um profissional some do breakdown e as participacoes nao fecham 100%", () => {
  const s = coerente();
  s.breakdowns["weekly.professionals"] = s.breakdowns["weekly.professionals"].slice(0, 3);
  assert.ok(codes(s).includes("LOGIC_SHARES_NOT_100"));
});

test("SABOTAGEM: linha de custo do DRE com sinal invertido", () => {
  const s = coerente();
  s.metrics["finance.variable_cost.current"].value = 146592.54;
  assert.ok(codes(s).includes("LOGIC_COST_SIGN_FLIPPED"));
});

test("custo negativo no DRE e a convencao correta e nao gera violacao", () => {
  const s = coerente();
  assert.ok(!codes(s).includes("LOGIC_NEGATIVE_MONEY"));
  assert.ok(!codes(s).includes("LOGIC_COST_SIGN_FLIPPED"));
});

test("SABOTAGEM: receita negativa", () => {
  const s = coerente();
  s.metrics["commercial.revenue.current"].value = -1000;
  assert.ok(codes(s).includes("LOGIC_NEGATIVE_MONEY"));
});

test("SABOTAGEM: periodo repetido na serie historica", () => {
  const s = coerente();
  s.breakdowns["marketing.history"][3].period = "2026-05";
  assert.ok(codes(s).includes("LOGIC_DUPLICATE_PERIOD"));
});

test("SABOTAGEM: coluna trocada gera salto de mais de 10x na serie", () => {
  const s = coerente();
  s.breakdowns["marketing.history"][4].leads = 20;
  assert.ok(codes(s).includes("LOGIC_SERIES_JUMP"));
});

test("salto de serie e WARNING, nunca bloqueia sozinho", () => {
  const s = coerente();
  s.breakdowns["marketing.history"][4].investment = 400000;
  const issues = validateLogic(s).filter(
    (issue) => issue.code === "LOGIC_SERIES_JUMP",
  );
  assert.ok(issues.length > 0);
  assert.ok(issues.every((issue) => issue.severity === "WARNING"));
});

test("contagem fracionaria avisa sem bloquear", () => {
  const s = coerente();
  s.metrics["commercial.attended.current"].value = 33.5;
  const issue = validateLogic(s).find(
    (item) => item.code === "LOGIC_FRACTIONAL_COUNT",
  );
  assert.equal(issue?.severity, "WARNING");
});

test("metrica SEM_BASE nao e tratada como violacao", () => {
  const s = coerente();
  s.metrics["marketing.cpl.total.current"].value = null;
  s.metrics["marketing.mql.current"].value = null;
  assert.deepEqual(
    validateLogic(s).filter((issue) => issue.severity === "CRITICAL"),
    [],
  );
});

test("denominador zero nao vira violacao de identidade", () => {
  const s = coerente();
  s.metrics["marketing.appointments.marketing.current"].value = 0;
  assert.ok(!codes(s).includes("LOGIC_IDENTITY_BROKEN"));
});
