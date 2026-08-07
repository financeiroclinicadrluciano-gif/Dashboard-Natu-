import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "xlsx";

import { adaptForm } from "../src/data-pipeline/adapters";
import { createWorkbookInput } from "../src/data-pipeline/workbooks";

/**
 * O adaptador de formulario le a base bruta de leads. Os testes cobrem o que
 * quebra em silencio: data em tres formatos, deduplicacao, mes corrente
 * parcial e o vazamento de dado pessoal.
 */

const HEADER = [
  "id",
  "created_time",
  "ad_name",
  "adset_name",
  "campaign_name",
  "is_organic",
  "platform",
  "qual_é_o_seu_principal_objetivo_neste_momento?",
  "full_name",
  "phone_number",
  "lead_status",
];

function lead(
  id: number,
  created: unknown,
  options: {
    ad?: string;
    platform?: string;
    phone?: string;
    objective?: string;
  } = {},
): unknown[] {
  return [
    id,
    created,
    options.ad ?? "Anuncio A",
    "Conjunto 1",
    "Campanha X",
    "false",
    options.platform ?? "ig",
    options.objective ?? "emagrecimento_com_acompanhamento_médico",
    `Paciente ${id}`,
    options.phone ?? `4199${String(1000000 + id).slice(-7)}`,
    "CREATED",
  ];
}

function formInput(rows: unknown[][], sheet = "FORM JULHO") {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([HEADER, ...rows]),
    sheet,
  );
  return createWorkbookInput(
    "formulario.xlsx",
    Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })),
  );
}

function byId(result: ReturnType<typeof adaptForm>) {
  return new Map(result.metrics.map((item) => [item.id, item]));
}

// ---------------------------------------------------------------------------

test("created_time e lido como texto ISO, Date e serial do Excel", () => {
  const result = adaptForm(
    formInput([
      lead(1, "2026-07-03T14:00:00"),
      lead(2, new Date(Date.UTC(2026, 6, 4, 14))),
      // 46208 = 2026-07-05 no calendario serial do Excel (dias desde 1899-12-30).
      lead(3, 46208),
    ]),
    "2026-07",
  );

  const days = result.breakdowns["form.daily"].map((row) => row.day);
  assert.deepEqual(days, ["2026-07-03", "2026-07-04", "2026-07-05"]);
});

test("SABOTAGEM: serial do Excel tratado como numero destruiria a serie", () => {
  // Sem a conversao, 46208 viraria o ano 46208 e o dia sairia como "+046208-..".
  const result = adaptForm(formInput([lead(1, 46208)]), "2026-07");
  const day = String(result.breakdowns["form.daily"][0].day);
  assert.match(day, /^2026-07-\d{2}$/);
});

test("deduplica por telefone normalizado, com formatos diferentes", () => {
  const result = adaptForm(
    formInput([
      lead(1, "2026-07-03T10:00:00", { phone: "(41) 99876-5432" }),
      lead(2, "2026-07-04T10:00:00", { phone: "41998765432" }),
      lead(3, "2026-07-05T10:00:00", { phone: "+55 41 99876-5432" }),
      lead(4, "2026-07-06T10:00:00", { phone: "41911112222" }),
    ]),
    "2026-07",
  );
  const metrics = byId(result);

  assert.equal(metrics.get("form.submissions.raw.current")?.value, 4);
  // Tres grafias do mesmo numero + um outro. O prefixo 55 muda os digitos, entao
  // conta como pessoa distinta: deduplicacao conservadora nunca funde na duvida.
  assert.equal(metrics.get("form.people.unique.current")?.value, 3);
  assert.equal(metrics.get("form.people.repeated.current")?.value, 1);
  assert.equal(metrics.get("form.submissions.excess.current")?.value, 1);
});

test("plataforma vira Instagram e Facebook e a decomposicao soma 100%", () => {
  const result = adaptForm(
    formInput([
      lead(1, "2026-07-03T10:00:00", { platform: "ig" }),
      lead(2, "2026-07-03T11:00:00", { platform: "ig" }),
      lead(3, "2026-07-03T12:00:00", { platform: "fb" }),
    ]),
    "2026-07",
  );

  const rows = result.breakdowns["form.platforms"];
  const names = rows.map((row) => row.platform).sort();
  assert.deepEqual(names, ["Facebook", "Instagram"]);
  const total = rows.reduce((sum, row) => sum + Number(row.share ?? 0), 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
});

test("lead_status CREATED nao e confundido com classificacao de MQL", () => {
  const result = adaptForm(formInput([lead(1, "2026-07-03T10:00:00")]), "2026-07");
  const mql = byId(result).get("form.mql.current");

  assert.equal(mql?.value, null);
  assert.equal(mql?.status, "SEM_BASE");
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "FORM_MQL_CLASSIFICATION_EXTERNAL",
    ),
  );
});

// ---------------------------------------------------------------------------
// Mes corrente parcial
// ---------------------------------------------------------------------------

test("mes corrente compara o MESMO numero de dias, nao o mes inteiro", () => {
  const rows: unknown[][] = [];
  let id = 0;
  // Julho: 10 leads/dia nos dias 1 a 20 = 200 no mes, 30 nos tres primeiros dias.
  for (let day = 1; day <= 20; day += 1) {
    for (let n = 0; n < 10; n += 1) {
      id += 1;
      rows.push(lead(id, `2026-07-${String(day).padStart(2, "0")}T10:00:00`));
    }
  }
  // Agosto: 3 dias, 6 leads/dia = 18.
  for (let day = 1; day <= 3; day += 1) {
    for (let n = 0; n < 6; n += 1) {
      id += 1;
      rows.push(lead(id, `2026-08-${String(day).padStart(2, "0")}T10:00:00`));
    }
  }

  const metrics = byId(adaptForm(formInput(rows), "2026-07"));

  assert.equal(metrics.get("form.current_month.leads.current")?.value, 18);
  assert.equal(metrics.get("form.current_month.days.current")?.value, 3);
  assert.equal(metrics.get("form.current_month.daily_average.current")?.value, 6);
  // O comparavel sao os 3 PRIMEIROS dias de julho (30), nao os 200 do mes.
  assert.equal(metrics.get("form.current_month.baseline_leads.current")?.value, 30);
  assert.equal(
    metrics.get("form.current_month.pace.current")?.value,
    18 / 30 - 1,
  );
});

test("SABOTAGEM: comparar contra o mes inteiro daria queda falsa", () => {
  const rows: unknown[][] = [];
  let id = 0;
  for (let day = 1; day <= 20; day += 1) {
    for (let n = 0; n < 10; n += 1) {
      id += 1;
      rows.push(lead(id, `2026-07-${String(day).padStart(2, "0")}T10:00:00`));
    }
  }
  for (let day = 1; day <= 3; day += 1) {
    for (let n = 0; n < 6; n += 1) {
      id += 1;
      rows.push(lead(id, `2026-08-${String(day).padStart(2, "0")}T10:00:00`));
    }
  }

  const metrics = byId(adaptForm(formInput(rows), "2026-07"));
  const pace = metrics.get("form.current_month.pace.current")?.value ?? 0;

  // Contra o mes inteiro a conta seria 18/200-1 = -91%. O correto e -40%.
  assert.ok(Math.abs(pace - (18 / 30 - 1)) < 1e-9);
  assert.ok(pace > -0.5, "o recorte comparavel evita a queda falsa de -91%");
});

test("aba que cobre dias fora da competencia gera aviso explicito", () => {
  const result = adaptForm(
    formInput([
      lead(1, "2026-07-28T10:00:00"),
      lead(2, "2026-08-01T10:00:00"),
      lead(3, "2026-08-02T10:00:00"),
    ]),
    "2026-07",
  );
  const issue = result.issues.find(
    (item) => item.code === "FORM_PERIOD_OVERFLOW",
  );

  assert.ok(issue);
  assert.equal(issue?.severity, "WARNING");
  assert.equal(issue?.details?.submissoesFora, 2);
});

test("sem dias fora da competencia, nao ha metrica de mes corrente", () => {
  const metrics = byId(
    adaptForm(formInput([lead(1, "2026-07-10T10:00:00")]), "2026-07"),
  );
  assert.equal(metrics.get("form.current_month.leads.current"), undefined);
});

// ---------------------------------------------------------------------------
// Privacidade
// ---------------------------------------------------------------------------

test("nenhum breakdown ou metrica carrega nome ou telefone", () => {
  const result = adaptForm(
    formInput([
      lead(1, "2026-07-03T10:00:00", { phone: "(41) 99876-5432" }),
      lead(2, "2026-08-01T10:00:00", { phone: "(41) 91111-2222" }),
    ]),
    "2026-07",
  );

  const payload = JSON.stringify({
    metrics: result.metrics,
    breakdowns: result.breakdowns,
  });

  assert.doesNotMatch(payload, /Paciente \d/, "nome vazou");
  assert.doesNotMatch(payload, /9987654|9111122/, "telefone vazou");
  assert.doesNotMatch(payload, /"(full_?name|phone_?number|telefone)"/i);
});
