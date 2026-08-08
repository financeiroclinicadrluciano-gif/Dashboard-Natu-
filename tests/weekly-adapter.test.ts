import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "xlsx";

import { adaptWeekly, detectBlockEnd } from "../src/data-pipeline/adapters";
import { classifyChannel } from "../src/data-pipeline/channels";
import {
  createWorkbookInput,
  detectWorkbookRole,
  sheetRows,
  type SheetRows,
} from "../src/data-pipeline/workbooks";

/**
 * Fixture com os NUMEROS REAIS da planilha semanal de 2026-08 e nomes de
 * paciente anonimizados. Os valores nao podem ser arredondados: metade das
 * baterias existe justamente para pegar erro de centavo na leitura.
 */
const HEADER = [
  "NOME", "PROFISSIONAL", "STATUS", "VALOR", "PRESENÇA",
  "PACOTE MED", "PACOTE NUTRI", "PACOTE TREINO", "IMPLANTE", "PACOTE INJET", "GINECOLÓGICOS",
  "$ PACOTE MED", "$ PACOTE NUTRI", "$ PACOTE TREINO", "$ IMPLANTE", "$ PACOTE INJET",
];

const DETAIL: unknown[][] = [
  ["Paciente 01", "Dr Luciano", "Atendido", 12594.83, "formulario - trat obesidade", 1, 1, 1, 0, 0, 0, 1600, 900, 4000, 0, 7294.83],
  ["Paciente 02", "Dr Luciano", "Atendido", 8237.7, "indicação", 1, 0, 0, 0, 1, 0, 1600, 0, 0, 0, 5537.7],
  ["Paciente 03", "Dr Luciano", "Atendido", 1200, "indicação", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ["Paciente 04", "Dr Luciano", "Atendido", 350, "campanha mkt", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ["Paciente 05", "Dr Luciano", "Atendido", 10989.15, "indicação", 0, 0, 0, 1, 1, 0, 0, 0, 0, 5309.33, 4479.82],
  ["Paciente 06", "Dr Luciano", "Atendido", 16788.87, "formulario", 1, 1, 0, 0, 1, 0, 1600, 900, 0, 0, 13088.87],
  ["Paciente 07", "Dr Luciano", "Atendido", 0, "indicação", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ["Paciente 08", "Dr Luciano", "Atendido", 650, "formulario - mounjaro", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ["Paciente 09", "Gislaine", "Atendido", 650, "formulario - trat obesidade", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ["Paciente 10", "Gislaine", "Atendido", 4227.1, "formulario - mounjaro", 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 3577.1],
  ["Paciente 11", "Gislaine", "Atendido", 650, "formulario - mounjaro", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ["Paciente 12", "Dr Luca", "Atendido", 5302.81, "formulario - mounjaro", 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 4652.81],
  ["Paciente 13", "Dr Luca", "Atendido", 12588.72, "formulario - trat obesidade", 1, 1, 0, 0, 1, 0, 1100, 900, 0, 0, 9938.72],
  ["Paciente 14", "Dr Luca", "Atendido", 9345.56, "organico", 1, 1, 0, 0, 1, 0, 1100, 900, 0, 0, 6695.56],
  ["Paciente 15", "Dr Luca", "Atendido", 7287.7, "depoimento - mkt", 1, 0, 0, 0, 1, 0, 1100, 0, 0, 0, 5537.7],
  ["Paciente 16", "Dra Vivian", "Atendido", 6525, "indicação dra vivian", 1, 0, 0, 0, 1, 0, 1100, 0, 0, 0, 4775],
  ["Paciente 17", "Dra Vivian", "Atendido", 3325, "paciente antigo", 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3250],
  ["Paciente 18", "Dra Vivian", "Atendido", 7034.38, "link da bio", 1, 1, 0, 0, 1, 0, 1100, 900, 0, 0, 4384.38],
  ["Paciente 19", "Dra Vivian", "Atendido", 750, "paciente antigo", 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 824.67],
  ["Paciente 20", "Dra Vivian", "Atendido", 650, "organico perfil natua", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ["Paciente 21", "Dra Vivian", "Atendido", 11176.51, "organico", 1, 1, 0, 0, 0, 0, 1100, 400, 0, 0, 9027.65],
  ["Paciente 22", "Dra Vivian", "Atendido", 650, "link da bio", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ["Paciente 23", "Dra Vivian", "Atendido", 550, "organico", 0, 0, 0, 0, 0, 0, 550, 0, 0, 0, 0],
];

const PIVOT: unknown[][] = [
  ["PROFISSIONAL", "TOTAL AGEND.", "COMPARECIDOS", "FALTAS", "PACOTE MED", "PACOTE NUTRI", "PACOTE TREINO", "IMPLANTE", "PACOTE INJETÁVEL", "GINECOLÓGICOS", "TOTAL FATURADO 1ª CONS.", "$ PACOTE MED", "$ PACOTE NUTRI", "$ PACOTE TREINO", "$ IMPLANTE", "$ PACOTE INJETÁVEL"],
  ["TOTAL GERAL", 23, 23, 0, 9, 6, 1, 1, 11, 1, 121523.33, 11950, 4900, 4000, 5309.33, 83064.81],
  ["%", 1, 1, 0, 0.391304347826087, 0.2608695652173913, 0.043478260869565216, 0.043478260869565216, 0.4782608695652174, 0.043478260869565216, 1, 0.09833502752105297, 0.04032147571992967, 0.032915490383616054, 0.04368980013961106, 0.6835297386929735],
  ["DR. LUCIANO", 8, 8, 0, 3, 2, 1, 1, 3, 0, 50810.55, 4800, 1800, 4000, 5309.33, 30401.22],
  ["%", 1, 1, 0, 0.375, 0.25, 0.125, 0.125, 0.375, 0, 0.4181135424778107, 0.09446857001154288, 0.035425713754328576, 0.0787238083429524, 0.10449266933737186, 0.5983249541679828],
  ["GISLAINE", 3, 3, 0, 0, 0, 0, 0, 1, 0, 5527.1, 0, 0, 0, 0, 3577.1],
  ["%", 1, 1, 0, 0, 0, 0, 0, 0.3333333333333333, 0, 0.04548180172482108, 0, 0, 0, 0, 0.6471929221472381],
  ["DR. LUCA", 4, 4, 0, 3, 2, 0, 0, 4, 0, 34524.79, 3300, 1800, 0, 0, 26824.79],
  ["%", 1, 1, 0, 0.75, 0.5, 0, 0, 1, 0, 0.2841000983103409, 0.0955834923253697, 0.05213645035929256, 0, 0, 0.7769718512408043],
  ["DRA. VIVIAN", 8, 8, 0, 3, 2, 0, 0, 3, 1, 30660.89, 3850, 1300, 0, 0, 22261.7],
  ["%", 1, 1, 0, 0.375, 0.25, 0, 0, 0.375, 0.125, 0.2523045574870274, 0.12556713128679567, 0.042399291083853076, 0, 0, 0.7260617679395478],
];

const BLANK = new Array(16).fill(null);

function weeklyBuffer(rows: unknown[][]): Buffer {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(rows),
    "Planilha1",
  );
  return Buffer.from(
    XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
  );
}

function weeklyInput(rows: unknown[][] = [HEADER, ...DETAIL, BLANK, BLANK, BLANK, ...PIVOT]) {
  return createWorkbookInput("planilha-semanal.xlsx", weeklyBuffer(rows));
}

function byId(result: ReturnType<typeof adaptWeekly>) {
  return new Map(result.metrics.map((item) => [item.id, item]));
}

function critical(result: ReturnType<typeof adaptWeekly>) {
  return result.issues.filter((issue) => issue.severity === "CRITICAL");
}

/**
 * Soma de float em BRL nao devolve o decimal exato (121523.32999999999). A
 * comparacao aqui usa meio centavo, a mesma ordem de grandeza da tolerancia do
 * adaptador — comparar por igualdade estrita testaria o IEEE 754, nao o codigo.
 */
function closeTo(actual: unknown, expected: number, message: string): void {
  assert.ok(
    Math.abs(Number(actual) - expected) < 0.005,
    `${message}: recebido ${actual}, esperado ${expected}`,
  );
}

// ---------------------------------------------------------------------------
// Classificacao do arquivo
// ---------------------------------------------------------------------------

test("classifica a planilha semanal por assinatura de cabecalho", () => {
  assert.equal(detectWorkbookRole(weeklyInput()), "weekly");
});

// ---------------------------------------------------------------------------
// Detector de fim de bloco
// ---------------------------------------------------------------------------

test("detector de fim de bloco separa detalhe do pivo colado abaixo", () => {
  const input = weeklyInput();
  const rows = sheetRows(input.workbook, "Planilha1") as SheetRows;

  // Sem detector, um leitor ingenuo veria 34 "pacientes": 23 reais + o
  // cabecalho do pivo + TOTAL GERAL + 4 profissionais + 5 linhas de %.
  const naive = rows.slice(1).filter((row) =>
    row.some((cell) => cell !== null && String(cell).trim() !== ""),
  ).length;
  assert.equal(naive, 34, "o fixture precisa reproduzir a armadilha real");

  assert.equal(detectBlockEnd(rows, 1), 24);
  assert.equal(adaptWeekly(input, "2026-08").source.records, 23);
});

test("SABOTAGEM: pivo colado sem linha em branco ainda e barrado", () => {
  // Remove o separador. Um detector que dependesse so de linha vazia leria o
  // cabecalho do pivo como se fosse paciente.
  const input = weeklyInput([HEADER, ...DETAIL, ...PIVOT]);
  const result = adaptWeekly(input, "2026-08");

  assert.equal(result.source.records, 23);
  assert.equal(byId(result).get("weekly.attended.current")?.value, 23);
  assert.equal(critical(result).length, 0);
});

test("SABOTAGEM: linha TOTAL no meio do detalhe encerra o bloco", () => {
  const input = weeklyInput([
    HEADER,
    ...DETAIL.slice(0, 5),
    ["TOTAL", null, null, 99999, null],
    ...DETAIL.slice(5),
  ]);

  assert.equal(adaptWeekly(input, "2026-08").source.records, 5);
});

// ---------------------------------------------------------------------------
// Normalizacao de canal
// ---------------------------------------------------------------------------

test("as 11 grafias reais colapsam nos 6 canais canonicos", () => {
  const cases: Array<[string, string, string | null]> = [
    ["formulario", "FORMULARIO", null],
    ["formulario - mounjaro", "FORMULARIO", "MOUNJARO"],
    ["formulario - trat obesidade", "FORMULARIO", "TRAT OBESIDADE"],
    ["organico", "ORGANICO", null],
    ["organico perfil natua", "ORGANICO", null],
    ["indicação", "INDICACAO", null],
    ["indicação dra vivian", "INDICACAO", null],
    ["link da bio", "BIO", null],
    ["campanha mkt", "TRAFEGO_PAGO", null],
    ["depoimento - mkt", "TRAFEGO_PAGO", "DEPOIMENTO"],
    ["paciente antigo", "RECORRENCIA", null],
  ];

  for (const [raw, channel, campaign] of cases) {
    const result = classifyChannel(raw);
    assert.equal(result.channel, channel, `canal de "${raw}"`);
    assert.equal(result.campaign, campaign, `campanha de "${raw}"`);
  }
});

test("canal desconhecido nunca vira bucket 'outros'", () => {
  assert.equal(classifyChannel("veio de marte").channel, null);

  const input = weeklyInput([
    HEADER,
    [...DETAIL[0].slice(0, 4), "veio de marte", ...DETAIL[0].slice(5)],
    ...DETAIL.slice(1),
    BLANK,
    ...PIVOT,
  ]);
  const result = adaptWeekly(input, "2026-08");
  const warning = result.issues.find(
    (issue) => issue.code === "WEEKLY_CHANNEL_UNMAPPED",
  );

  assert.ok(warning, "canal fora da taxonomia precisa gerar issue explicita");
  const channels = result.breakdowns["weekly.channels"];
  assert.ok(
    channels.every((row) => row.channel !== "OUTROS"),
    "nenhum bucket generico pode existir",
  );
  // O paciente sai dos recortes por canal, mas continua no total.
  assert.equal(
    channels.reduce((sum, row) => sum + Number(row.patients ?? 0), 0),
    22,
  );
  assert.equal(byId(result).get("weekly.attended.current")?.value, 23);
});

test("recorrencia fica fora do denominador de aquisicao", () => {
  const metrics = byId(adaptWeekly(weeklyInput(), "2026-08"));
  // 23 atendidos, 2 pacientes antigos -> 21 de aquisicao.
  assert.equal(metrics.get("weekly.acquisition.attended.current")?.value, 21);
  closeTo(
    metrics.get("weekly.acquisition.revenue.current")?.value,
    121523.33 - 3325 - 750,
    "faturamento de aquisicao",
  );
});

// ---------------------------------------------------------------------------
// As 13 baterias de reconciliacao
// ---------------------------------------------------------------------------

test("as 13 baterias de reconciliacao fecham com delta zero", () => {
  const result = adaptWeekly(weeklyInput(), "2026-08");
  const batteries = result.breakdowns["weekly.reconciliation"];

  assert.equal(batteries.length, 13, "o contrato sao 13 baterias");
  for (const battery of batteries) {
    closeTo(
      battery.delta,
      0,
      `bateria ${battery.battery} (detalhe ${battery.detail} x pivo ${battery.pivot})`,
    );
  }
  assert.equal(critical(result).length, 0);
});

test("SABOTAGEM: um centavo alterado no pivo bloqueia a publicacao", () => {
  const sabotado = PIVOT.map((row) =>
    String(row[0]) === "TOTAL GERAL"
      ? [...row.slice(0, 10), 121523.34, ...row.slice(11)]
      : row,
  );
  const result = adaptWeekly(
    weeklyInput([HEADER, ...DETAIL, BLANK, ...sabotado]),
    "2026-08",
  );
  const failure = critical(result).find(
    (issue) => issue.code === "WEEKLY_RECONCILIATION_FAILED",
  );

  assert.ok(failure, "divergencia de centavo tem que ser CRITICAL");
  assert.equal(failure?.details?.battery, "revenue");
});

test("SABOTAGEM: contagem de pacote trocada no pivo bloqueia a publicacao", () => {
  const sabotado = PIVOT.map((row) =>
    String(row[0]) === "TOTAL GERAL"
      ? [...row.slice(0, 4), 8, ...row.slice(5)]
      : row,
  );
  const failures = critical(
    adaptWeekly(weeklyInput([HEADER, ...DETAIL, BLANK, ...sabotado]), "2026-08"),
  );

  assert.equal(failures.length, 1);
  assert.equal(failures[0].details?.battery, "units.medico");
  assert.equal(failures[0].details?.delta, 1);
});

test("planilha sem bloco de totais avisa em vez de fingir reconciliacao", () => {
  const result = adaptWeekly(weeklyInput([HEADER, ...DETAIL]), "2026-08");

  assert.equal(result.breakdowns["weekly.reconciliation"].length, 0);
  assert.ok(
    result.issues.some((issue) => issue.code === "WEEKLY_PIVOT_ABSENT"),
  );
  assert.equal(critical(result).length, 0);
});

// ---------------------------------------------------------------------------
// Metricas derivadas
// ---------------------------------------------------------------------------

test("comparecimento sai do pivo, nao da coluna PRESENCA", () => {
  const metrics = byId(adaptWeekly(weeklyInput(), "2026-08"));

  assert.equal(metrics.get("weekly.attendance_rate.current")?.value, 1);
  assert.equal(metrics.get("weekly.no_show_rate.current")?.value, 0);
  assert.equal(metrics.get("weekly.attendance_rate.current")?.status, "VALIDATED");
});

test("sem pivo, comparecimento fica SEM_BASE em vez de 100%", () => {
  const metrics = byId(adaptWeekly(weeklyInput([HEADER, ...DETAIL]), "2026-08"));
  const rate = metrics.get("weekly.attendance_rate.current");

  assert.equal(rate?.value, null);
  assert.equal(rate?.status, "SEM_BASE");
});

test("categoria sem coluna de receita fica SEM_BASE, nunca zero", () => {
  const result = adaptWeekly(weeklyInput(), "2026-08");
  const metrics = byId(result);
  const gineco = metrics.get("weekly.category.ginecologicos.revenue");

  assert.equal(gineco?.value, null);
  assert.equal(gineco?.status, "SEM_BASE");
  assert.equal(metrics.get("weekly.category.ginecologicos.units")?.value, 1);
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "WEEKLY_CATEGORY_REVENUE_ABSENT",
    ),
  );
});

test("as 6 categorias saem com unidades e adesao auditaveis", () => {
  const metrics = byId(adaptWeekly(weeklyInput(), "2026-08"));
  const esperado: Array<[string, number, number | null]> = [
    ["medico", 9, 11950],
    ["nutricional", 6, 4900],
    ["treino", 1, 4000],
    ["implantes", 1, 5309.33],
    ["injetaveis", 11, 83064.81],
    ["ginecologicos", 1, null],
  ];

  for (const [id, units, revenue] of esperado) {
    assert.equal(metrics.get(`weekly.category.${id}.units`)?.value, units, id);
    const actual = metrics.get(`weekly.category.${id}.revenue`)?.value;
    if (revenue === null) {
      assert.equal(actual, null, `${id} deveria ser SEM_BASE`);
    } else {
      closeTo(actual, revenue, `receita de ${id}`);
    }
    assert.equal(
      metrics.get(`weekly.category.${id}.adoption_rate`)?.value,
      units / 23,
      id,
    );
  }
});

test("faturamento por profissional bate com o pivo linha a linha", () => {
  const rows = adaptWeekly(weeklyInput(), "2026-08").breakdowns[
    "weekly.professionals"
  ];
  const esperado: Array<[string, number, number]> = [
    ["DR LUCIANO", 8, 50810.55],
    ["GISLAINE", 3, 5527.1],
    ["DR LUCA", 4, 34524.79],
    ["DRA VIVIAN", 8, 30660.89],
  ];

  for (const [professional, patients, revenue] of esperado) {
    const row = rows.find((item) => item.professional === professional);
    assert.ok(row, `profissional ausente: ${professional}`);
    assert.equal(row?.patients, patients);
    assert.equal(Number(row?.revenue).toFixed(2), revenue.toFixed(2));
  }

  const share = rows.reduce((sum, row) => sum + Number(row.share ?? 0), 0);
  assert.ok(Math.abs(share - 1) < 1e-9, "participacoes precisam somar 100%");
});

test("breakdown por canal nao vaza texto livre nem nome de paciente", () => {
  const rows = adaptWeekly(weeklyInput(), "2026-08").breakdowns[
    "weekly.channels"
  ];
  const permitido = new Set([
    "channel",
    "label",
    "patients",
    "revenue",
    "ticket",
    "share",
  ]);

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      assert.ok(permitido.has(key), `campo inesperado no breakdown: ${key}`);
    }
  }

  // 11 grafias -> no maximo 6 canais.
  assert.ok(rows.length <= 6);
  assert.equal(
    rows.reduce((sum, row) => sum + Number(row.patients ?? 0), 0),
    23,
  );
});
