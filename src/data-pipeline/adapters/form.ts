import type { DashboardMetric, ValidationIssue } from "../model";
import {
  finiteNumber,
  inferWorkbookYear,
  normalizeText,
  periodFromSheetName,
  sheetRows,
  type CellValue,
  type SheetRows,
  type WorkbookInput,
} from "../workbooks";
import { classifyMql, tallyMql } from "../mql-classifier";
import { metric, sourceSummary, type AdapterResult } from "./common";

/**
 * Adaptador do formulario / CRM.
 *
 * Ate 2026-08-07 ele contava linhas e olhava `lead_status`. A base bruta e
 * muito mais rica do que isso: cada lead carrega data e HORA de entrada,
 * campanha, conjunto, anuncio, plataforma e a resposta de qualificacao.
 *
 * O que passa a sair daqui:
 * - serie DIARIA de leads — o painel so tinha granularidade mensal;
 * - distribuicao por hora do dia — a unica pista de janela de atendimento que
 *   existe hoje, e ela contradiz o horario comercial;
 * - leads por plataforma (Instagram x Facebook);
 * - atribuicao por campanha, conjunto e anuncio;
 * - deduplicacao por telefone normalizado, auditavel.
 *
 * Nada disso publica dado pessoal: telefone entra so como chave de deduplicacao
 * e sai como contagem. Nome e job_title nunca saem do adaptador.
 */

/** `lead_status` da Meta nao e classificacao de MQL. */
const META_LIFECYCLE_STATUSES = new Set(["CREATED", "VAZIO", "SEM CAMPO"]);

interface Column {
  index: number;
  name: string;
}

function findColumn(headers: string[], ...candidates: string[]): Column | null {
  for (const candidate of candidates) {
    const wanted = normalizeText(candidate);
    const index = headers.findIndex((header) => header === wanted);
    if (index >= 0) {
      return { index, name: candidate };
    }
  }
  return null;
}

/**
 * Os cabecalhos do export da Meta usam underscore no lugar de espaco
 * (`qual_e_o_seu_principal_objetivo`). Comparar sem achatar os dois separadores
 * fazia a coluna de qualificacao nunca casar — e ela voltava vazia em silencio.
 */
const flatten = (value: string): string =>
  normalizeText(value).replace(/[_\s]+/g, " ").trim();

function findColumnStartingWith(
  headers: string[],
  prefix: string,
): Column | null {
  const wanted = flatten(prefix);
  const index = headers.findIndex((header) => flatten(header).startsWith(wanted));
  return index >= 0 ? { index, name: prefix } : null;
}

function cell(row: SheetRows[number], column: Column | null): CellValue {
  return column ? (row[column.index] ?? null) : null;
}

function text(row: SheetRows[number], column: Column | null): string {
  const value = cell(row, column);
  return value === null ? "" : String(value).trim();
}

/**
 * `created_time` chega ora como Date, ora como texto ISO, ora como serial do
 * Excel. Serial e dia desde 1899-12-30; ignorar isso transformaria a data em um
 * numero de cinco digitos e a serie diaria inteira em lixo.
 */
function toDate(value: CellValue): Date | null {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }
  const numeric = typeof value === "number" ? value : null;
  if (numeric !== null && numeric > 20000 && numeric < 80000) {
    return new Date(Math.round((numeric - 25569) * 86400 * 1000));
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value.trim());
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }
  return null;
}

function tally(entries: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of entries) {
    map.set(entry, (map.get(entry) ?? 0) + 1);
  }
  return map;
}

/**
 * Ranking TOP-N. O campo se chama `shareOfTotal`, nao `share`: um top-10 nao e
 * uma decomposicao completa e nao soma 100%. Chamar de `share` fazia o gate de
 * composicao reprovar com razao — um ranking truncado nao e um todo.
 */
function rank(
  map: Map<string, number>,
  key: string,
  limit: number,
  total: number,
): Array<Record<string, string | number | null>> {
  return [...map]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({
      [key]: name,
      leads: count,
      shareOfTotal: total ? count / total : null,
    }));
}

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
  const headers = (rows[0] ?? []).map(normalizeText);
  const idColumn = findColumn(headers, "id", "ID DO LEAD");
  const statusColumn = findColumn(headers, "lead_status");
  const createdColumn = findColumn(headers, "created_time", "DATA_ENTRADA");
  const platformColumn = findColumn(headers, "platform");
  const organicColumn = findColumn(headers, "is_organic");
  const campaignColumn = findColumn(headers, "campaign_name", "CAMPANHA");
  const adsetColumn = findColumn(headers, "adset_name", "CONJUNTO");
  const adColumn = findColumn(headers, "ad_name", "ANUNCIO");
  const phoneColumn = findColumn(headers, "phone_number", "TELEFONE");
  const jobColumn = findColumn(headers, "job_title", "CARGO", "cargo");
  const objectiveColumn =
    findColumnStartingWith(headers, "qual e o seu principal objetivo") ??
    findColumnStartingWith(headers, "qual resultado voce mais quer");

  const records = rows.slice(1).filter((row) =>
    idColumn ? Boolean(row[idColumn.index]) : row.some(Boolean),
  );
  const total = records.length;

  // -------------------------------------------------------------------------
  // Deduplicacao. Telefone e usado como chave e descartado em seguida: ele
  // nunca entra em metrica, breakdown ou issue.
  // -------------------------------------------------------------------------
  const phoneCounts = new Map<string, number>();
  for (const row of records) {
    const digits = text(row, phoneColumn).replace(/\D/g, "");
    if (digits.length >= 10) {
      phoneCounts.set(digits, (phoneCounts.get(digits) ?? 0) + 1);
    }
  }
  const uniquePeople = phoneCounts.size;
  const repeatedPeople = [...phoneCounts.values()].filter(
    (count) => count > 1,
  ).length;
  const excessSubmissions = [...phoneCounts.values()].reduce(
    (sum, count) => sum + count - 1,
    0,
  );

  // -------------------------------------------------------------------------
  // Serie diaria e hora do dia.
  // -------------------------------------------------------------------------
  const dates = records
    .map((row) => toDate(cell(row, createdColumn)))
    .filter((date): date is Date => date !== null);
  const byDay = new Map<string, number>();
  const byHour = new Map<number, number>();
  for (const date of dates) {
    const day = date.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
    const hour = date.getUTCHours();
    byHour.set(hour, (byHour.get(hour) ?? 0) + 1);
  }
  const sortedDays = [...byDay.keys()].sort();
  const firstDay = sortedDays[0] ?? null;
  const lastDay = sortedDays.at(-1) ?? null;

  if (dates.length && dates.length < total) {
    issues.push({
      severity: "WARNING",
      code: "FORM_MISSING_TIMESTAMP",
      message: "Ha submissoes sem data de entrada; elas ficam fora da serie diaria.",
      source: "form",
      details: { semData: total - dates.length, total },
    });
  }

  // A aba pode cobrir mais dias do que a competencia do painel. Isso nao e erro:
  // e a fonte estando na frente. Mas precisa ficar visivel, porque somar a aba
  // inteira como se fosse o mes inflaria o volume.
  const outsidePeriod = sortedDays.filter(
    (day) => day.slice(0, 7) !== periodHint,
  );
  if (outsidePeriod.length) {
    const outsideCount = outsidePeriod.reduce(
      (sum, day) => sum + (byDay.get(day) ?? 0),
      0,
    );
    issues.push({
      severity: "WARNING",
      code: "FORM_PERIOD_OVERFLOW",
      message: `A aba cobre dias fora de ${periodHint}; a serie diaria mostra tudo, os totais do painel nao.`,
      source: "form",
      details: {
        diasFora: outsidePeriod.length,
        submissoesFora: outsideCount,
        primeiroDia: firstDay ?? "",
        ultimoDia: lastDay ?? "",
      },
    });
  }

  // -------------------------------------------------------------------------
  // Mes corrente parcial.
  //
  // A base de formulario chega antes das outras: em 2026-08-07 ela ja tinha 7
  // dias de agosto enquanto marketing, closer e agenda paravam em 28/07. Isso
  // permite ler o mes que esta acontecendo — desde que fique explicito que so
  // existe LEAD, e nao investimento, MQL ou receita.
  //
  // A comparacao e feita contra o MESMO recorte de dias do periodo do painel,
  // nunca contra o mes fechado inteiro: 7 dias contra 30 nao e queda, e
  // aritmetica errada.
  // -------------------------------------------------------------------------
  const overflowDays = sortedDays.filter(
    (day) => day.slice(0, 7) !== periodHint,
  );
  const currentMonth = overflowDays.length
    ? overflowDays[overflowDays.length - 1].slice(0, 7)
    : null;
  const currentMonthDays = currentMonth
    ? sortedDays.filter((day) => day.slice(0, 7) === currentMonth)
    : [];
  const currentMonthLeads = currentMonthDays.reduce(
    (sum, day) => sum + (byDay.get(day) ?? 0),
    0,
  );
  // Mesmo numero de dias corridos no periodo de referencia, a partir do dia 1.
  const baselineDays = sortedDays
    .filter((day) => day.slice(0, 7) === periodHint)
    .slice(0, currentMonthDays.length);
  const baselineLeads = baselineDays.reduce(
    (sum, day) => sum + (byDay.get(day) ?? 0),
    0,
  );

  // -------------------------------------------------------------------------
  // MQL automatico por cargo.
  //
  // A Meta conta lead; a classificacao de MQL era manual (abas BASE MQL). O
  // classificador aplica a regua do guardrail (cargo/profissao/autonomia) a cada
  // lead, entao o MQL sai sozinho toda semana. Validado contra a auditoria CRM
  // de julho: 184 automatico vs 175 auditado (dentro de 5%). Cada lead e
  // classificado dentro do SEU mes, para julho e o mes corrente saírem separados.
  // -------------------------------------------------------------------------
  const jobsByMonth = new Map<string, unknown[]>();
  if (jobColumn) {
    for (const row of records) {
      const date = toDate(cell(row, createdColumn));
      if (!date) {
        continue;
      }
      const month = date.toISOString().slice(0, 7);
      const bucket = jobsByMonth.get(month) ?? [];
      bucket.push(cell(row, jobColumn));
      jobsByMonth.set(month, bucket);
    }
  }
  const periodMql = tallyMql(jobsByMonth.get(periodHint) ?? []);
  const currentMonthMql =
    currentMonth !== null ? tallyMql(jobsByMonth.get(currentMonth) ?? []) : null;

  const statuses = tally(
    records.map((row) =>
      statusColumn ? normalizeText(row[statusColumn.index]) || "VAZIO" : "SEM CAMPO",
    ),
  );
  const hasRealMql = [...statuses.keys()].some(
    (status) => !META_LIFECYCLE_STATUSES.has(status),
  );
  if (!hasRealMql) {
    issues.push({
      severity: "INFO",
      code: "FORM_MQL_CLASSIFICATION_EXTERNAL",
      message:
        "A aba mensal de formulario nao contem classificacao MQL final; o consolidado auditado permanece na fonte Marketing.",
      source: "form",
    });
  }

  const platforms = tally(
    records
      .map((row) => text(row, platformColumn).toLowerCase())
      .filter(Boolean)
      .map((value) =>
        value === "ig" ? "Instagram" : value === "fb" ? "Facebook" : value,
      ),
  );
  const organicCount = records.filter(
    (row) => text(row, organicColumn).toLowerCase() === "true",
  ).length;

  const campaigns = tally(
    records.map((row) => text(row, campaignColumn)).filter(Boolean),
  );
  const adsets = tally(
    records.map((row) => text(row, adsetColumn)).filter(Boolean),
  );
  const ads = tally(records.map((row) => text(row, adColumn)).filter(Boolean));
  const objectives = tally(
    records.map((row) => text(row, objectiveColumn)).filter(Boolean),
  );

  const metrics: DashboardMetric[] = [
    metric({
      id: "form.submissions.raw.current",
      label: "Submissoes brutas da aba mensal",
      value: total,
      unit: "COUNT",
      period: periodHint,
      source: "form",
      sheet: sheetName,
    }),
    metric({
      id: "form.mql.current",
      label: "MQL na aba mensal",
      value: hasRealMql ? (statuses.get("MQL") ?? null) : null,
      unit: "COUNT",
      status: hasRealMql && statuses.has("MQL") ? "VALIDATED" : "SEM_BASE",
      period: periodHint,
      source: "form",
      sheet: sheetName,
      note:
        hasRealMql && statuses.has("MQL")
          ? null
          : "A coluna lead_status traz o ciclo de vida da Meta, nao a classificacao de MQL. A validada esta no consolidado de Marketing.",
    }),
    metric({
      id: "form.people.unique.current",
      label: "Pessoas unicas (telefone normalizado)",
      value: uniquePeople || null,
      unit: "COUNT",
      period: periodHint,
      source: "form",
      sheet: sheetName,
      note: uniquePeople
        ? null
        : "A aba nao possui coluna de telefone utilizavel para deduplicacao.",
    }),
    metric({
      id: "form.people.repeated.current",
      label: "Pessoas com mais de uma submissao",
      value: uniquePeople ? repeatedPeople : null,
      unit: "COUNT",
      period: periodHint,
      source: "form",
      sheet: sheetName,
    }),
    metric({
      id: "form.submissions.excess.current",
      label: "Envios excedentes",
      value: uniquePeople ? excessSubmissions : null,
      unit: "COUNT",
      period: periodHint,
      source: "form",
      sheet: sheetName,
      formula: "soma(envios por pessoa - 1)",
    }),
    metric({
      id: "form.coverage.days.current",
      label: "Dias com submissao na aba",
      value: byDay.size || null,
      unit: "COUNT",
      period: periodHint,
      source: "form",
      sheet: sheetName,
      note: firstDay && lastDay ? `Janela ${firstDay} a ${lastDay}.` : null,
    }),
    metric({
      id: "form.daily_average.current",
      label: "Media de submissoes por dia",
      value: byDay.size ? dates.length / byDay.size : null,
      unit: "COUNT",
      period: periodHint,
      source: "form",
      sheet: sheetName,
      formula: "submissoes com data / dias com submissao",
      dependencies: ["form.coverage.days.current"],
    }),
    metric({
      id: "form.organic.current",
      label: "Submissoes marcadas como organicas",
      value: organicColumn ? organicCount : null,
      unit: "COUNT",
      period: periodHint,
      source: "form",
      sheet: sheetName,
    }),
  ];

  // MQL automatico da competencia do painel (julho). Fica separado do MQL
  // auditado da CRM: e um segundo metodo, para cruzar, nao para substituir.
  if (jobColumn && periodMql.total > 0) {
    metrics.push(
      metric({
        id: "form.mql_auto.current",
        label: "MQL automatico por cargo",
        value: periodMql.mql,
        unit: "COUNT",
        period: periodHint,
        source: "form",
        sheet: sheetName,
        note: "Classificacao automatica pela regua de cargo do guardrail; cruzar com o MQL auditado da CRM.",
      }),
      metric({
        id: "form.mql_auto.rate.current",
        label: "Taxa de MQL automatico",
        value: periodMql.total ? periodMql.mql / periodMql.total : null,
        unit: "PERCENT",
        period: periodHint,
        source: "form",
        sheet: sheetName,
        formula: "form.mql_auto.current / leads classificados",
        dependencies: ["form.mql_auto.current"],
      }),
    );
  }

  if (currentMonth && currentMonthMql && jobColumn) {
    metrics.push(
      metric({
        id: "form.current_month.mql_auto.current",
        label: `MQL automatico do mes corrente (${currentMonth})`,
        value: currentMonthMql.mql,
        unit: "COUNT",
        period: currentMonth,
        source: "form",
        sheet: sheetName,
        note: "Classificacao automatica por cargo; o mes corrente ainda nao tem MQL auditado da CRM.",
      }),
      metric({
        id: "form.current_month.mql_auto.rate.current",
        label: "Taxa de MQL automatico do mes corrente",
        value: currentMonthMql.total
          ? currentMonthMql.mql / currentMonthMql.total
          : null,
        unit: "PERCENT",
        period: currentMonth,
        source: "form",
        sheet: sheetName,
        formula: "form.current_month.mql_auto.current / leads do mes",
        dependencies: ["form.current_month.mql_auto.current"],
      }),
    );
  }

  if (currentMonth) {
    metrics.push(
      metric({
        id: "form.current_month.leads.current",
        label: `Leads do mes corrente (${currentMonth}, parcial)`,
        value: currentMonthLeads,
        unit: "COUNT",
        period: currentMonth,
        source: "form",
        sheet: sheetName,
        note: `Parcial de ${currentMonthDays.length} dia(s). So existe lead: investimento, MQL e receita de ${currentMonth} ainda nao tem fonte.`,
      }),
      metric({
        id: "form.current_month.days.current",
        label: "Dias corridos do mes corrente",
        value: currentMonthDays.length,
        unit: "COUNT",
        period: currentMonth,
        source: "form",
        sheet: sheetName,
      }),
      metric({
        id: "form.current_month.daily_average.current",
        label: "Media diaria do mes corrente",
        value: currentMonthDays.length
          ? currentMonthLeads / currentMonthDays.length
          : null,
        unit: "COUNT",
        period: currentMonth,
        source: "form",
        sheet: sheetName,
        formula:
          "form.current_month.leads.current / form.current_month.days.current",
        dependencies: [
          "form.current_month.leads.current",
          "form.current_month.days.current",
        ],
      }),
      metric({
        id: "form.current_month.baseline_leads.current",
        label: `Leads nos mesmos ${currentMonthDays.length} dias de ${periodHint}`,
        value: baselineDays.length ? baselineLeads : null,
        unit: "COUNT",
        period: periodHint,
        source: "form",
        sheet: sheetName,
        note: baselineDays.length
          ? "Mesmo numero de dias corridos, para a comparacao ser justa."
          : "O periodo de referencia nao tem dias suficientes para comparar.",
      }),
      metric({
        id: "form.current_month.pace.current",
        label: "Ritmo do mes corrente vs mesmo recorte anterior",
        value: baselineLeads ? currentMonthLeads / baselineLeads - 1 : null,
        unit: "PERCENT",
        period: currentMonth,
        source: "form",
        sheet: sheetName,
        formula:
          "form.current_month.leads.current / form.current_month.baseline_leads.current - 1",
        dependencies: [
          "form.current_month.leads.current",
          "form.current_month.baseline_leads.current",
        ],
        note: "Variacao pode ser negativa; nao e uma taxa de 0 a 100%.",
      }),
    );
  }

  for (const [platform, count] of platforms) {
    metrics.push(
      metric({
        id: `form.platform.${normalizeText(platform).toLowerCase()}.current`,
        label: `Leads via ${platform}`,
        value: count,
        unit: "COUNT",
        period: periodHint,
        source: "form",
        sheet: sheetName,
      }),
    );
  }

  return {
    source: sourceSummary("form", input, periodHint, total),
    metrics,
    breakdowns: {
      "form.statuses": [...statuses].map(([status, count]) => ({
        status,
        count,
      })),
      "form.daily": sortedDays.map((day) => ({
        day,
        leads: byDay.get(day) ?? 0,
        inPeriod: day.slice(0, 7) === periodHint ? 1 : 0,
      })),
      "form.hourly": Array.from({ length: 24 }, (_, hour) => ({
        hour,
        leads: byHour.get(hour) ?? 0,
        share: dates.length ? (byHour.get(hour) ?? 0) / dates.length : null,
      })),
      "form.platforms": [...platforms].map(([platform, count]) => ({
        platform,
        leads: count,
        share: total ? count / total : null,
      })),
      // Quais cargos viraram MQL, para a classificacao ser auditavel na tela.
      "form.mql_by_role": Object.entries(periodMql.byMatch)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([role, count]) => ({ role, leads: count })),
      "form.campaigns": rank(campaigns, "campaign", 10, total),
      "form.adsets": rank(adsets, "adset", 10, total),
      "form.ads": rank(ads, "ad", 12, total),
      "form.objectives": rank(objectives, "objective", 8, total),
    },
    issues,
  };
}
