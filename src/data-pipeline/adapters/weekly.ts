import {
  ACQUISITION_CHANNELS,
  CHANNEL_LABELS,
  CHANNELS,
  classifyChannel,
  type Channel,
} from "../channels";
import type { DashboardMetric, ValidationIssue } from "../model";
import {
  finiteNumber,
  normalizeText,
  sheetRows,
  type SheetRows,
  type WorkbookInput,
} from "../workbooks";
import { metric, sourceSummary, type AdapterResult } from "./common";

/** Tolerancia absoluta em BRL/contagem para a reconciliacao detalhe x pivo. */
export const RECONCILIATION_TOLERANCE = 0.01;

/**
 * Categorias de pacote vendidas. "Ginecologicos" foi confirmada como 6a categoria
 * em 2026-08-07; ela existia na planilha e estava ausente do dashboard.
 */
export const CATEGORIES = [
  { id: "medico", label: "Pacote medico", unit: ["PACOTE MED"], revenue: ["$ PACOTE MED"] },
  { id: "nutricional", label: "Pacote nutricional", unit: ["PACOTE NUTRI"], revenue: ["$ PACOTE NUTRI"] },
  { id: "treino", label: "Pacote de treino", unit: ["PACOTE TREINO"], revenue: ["$ PACOTE TREINO"] },
  { id: "implantes", label: "Implantes", unit: ["IMPLANTE"], revenue: ["$ IMPLANTE"] },
  {
    id: "injetaveis",
    label: "Injetaveis e soroterapia",
    // O detalhe abrevia "PACOTE INJET" e o pivo escreve "PACOTE INJETAVEL".
    unit: ["PACOTE INJET", "PACOTE INJETAVEL"],
    revenue: ["$ PACOTE INJET", "$ PACOTE INJETAVEL"],
  },
  { id: "ginecologicos", label: "Ginecologicos", unit: ["GINECOLOGICOS"], revenue: ["$ GINECOLOGICOS"] },
] as const;

/**
 * Rotulos que encerram o bloco de detalhe. A planilha semanal cola a tabela pivo
 * abaixo dos pacientes, na mesma aba: em 2026-08 um leitor ingenuo veria 34
 * "pacientes" em vez de 23, somando TOTAL GERAL e linhas de % aos valores reais.
 */
const BLOCK_TERMINATORS =
  /^(TOTAL|TOTAL GERAL|SUBTOTAL|%|MEDIA|MEDIA GERAL|SOMA|PROFISSIONAL|RESUMO|CONSOLIDADO)$/;

interface DetailRow {
  professional: string;
  status: string;
  value: number;
  channel: Channel | null;
  campaign: string | null;
  rawChannel: string;
  units: Record<string, number>;
  revenue: Record<string, number>;
}

interface HeaderIndex {
  /** Indice da coluna por cabecalho normalizado. */
  byName: Map<string, number>;
  rowIndex: number;
}

function indexHeaders(rows: SheetRows, rowIndex: number): HeaderIndex {
  const byName = new Map<string, number>();
  const header = rows[rowIndex] ?? [];
  for (const [index, cell] of header.entries()) {
    const name = normalizeText(cell);
    if (name && !byName.has(name)) {
      byName.set(name, index);
    }
  }
  return { byName, rowIndex };
}

function column(headers: HeaderIndex, ...candidates: string[]): number | null {
  for (const candidate of candidates) {
    const hit = headers.byName.get(normalizeText(candidate));
    if (hit !== undefined) {
      return hit;
    }
  }
  return null;
}

function cellNumber(row: SheetRows[number], index: number | null): number {
  return index === null ? 0 : (finiteNumber(row[index]) ?? 0);
}

function isEmptyRow(row: SheetRows[number] | undefined): boolean {
  return !row || row.every((cell) => normalizeText(cell) === "");
}

/**
 * Devolve o indice da primeira linha DEPOIS do bloco de detalhe.
 *
 * Para a linha ser detalhe ela precisa: nao ser vazia, ter primeira celula
 * preenchida e essa celula nao pode ser um terminador de bloco. A primeira linha
 * que falhar encerra o bloco — nao ha "pular a linha ruim e continuar", porque
 * era exatamente isso que fazia o pivo entrar no detalhe.
 */
export function detectBlockEnd(rows: SheetRows, startIndex: number): number {
  for (let index = startIndex; index < rows.length; index += 1) {
    const row = rows[index];
    if (isEmptyRow(row)) {
      return index;
    }
    const first = normalizeText(row[0]);
    if (!first || BLOCK_TERMINATORS.test(first)) {
      return index;
    }
  }
  return rows.length;
}

/** Localiza o cabecalho do bloco pivo depois do detalhe, se existir. */
export function findPivotHeader(
  rows: SheetRows,
  fromIndex: number,
): number | null {
  for (let index = fromIndex; index < rows.length; index += 1) {
    const cells = (rows[index] ?? []).map(normalizeText);
    if (
      cells[0] === "PROFISSIONAL" &&
      cells.some((cell) => cell.startsWith("TOTAL AGEND"))
    ) {
      return index;
    }
  }
  return null;
}

interface Battery {
  key: string;
  label: string;
  detail: number;
  pivot: number;
}

export function adaptWeekly(
  input: WorkbookInput,
  periodHint: string,
): AdapterResult {
  const issues: ValidationIssue[] = [];
  const sheetName = input.workbook.SheetNames[0];
  const rows = sheetRows(input.workbook, sheetName);
  const headers = indexHeaders(rows, 0);

  const nameColumn = column(headers, "NOME", "PACIENTE");
  const professionalColumn = column(headers, "PROFISSIONAL");
  const statusColumn = column(headers, "STATUS");
  const valueColumn = column(headers, "VALOR");
  // A coluna rotulada PRESENCA guarda canal de origem, nao presenca. A presenca
  // real so existe no pivo (COMPARECIDOS/FALTAS). O alias evita que a proxima
  // versao da planilha, ja com o rotulo corrigido, quebre o adaptador.
  const channelColumn = column(headers, "PRESENCA", "ORIGEM", "CANAL");

  if (nameColumn === null || valueColumn === null) {
    issues.push({
      severity: "CRITICAL",
      code: "WEEKLY_HEADER_MISSING",
      message:
        "A planilha semanal perdeu as colunas obrigatorias NOME e/ou VALOR.",
      source: "weekly",
    });
    return {
      source: sourceSummary("weekly", input, periodHint, 0),
      metrics: [],
      breakdowns: {},
      issues,
    };
  }

  // Nem toda categoria tem coluna de receita. Em 2026-08 "Ginecologicos" tinha
  // contagem de pacote e nenhuma coluna "$": a receita dela nao e zero, e
  // desconhecida. Zero seria um numero inventado com aparencia de medido.
  const revenueColumnPresent = new Map<string, boolean>(
    CATEGORIES.map((category) => [
      category.id,
      column(headers, ...category.revenue) !== null,
    ]),
  );
  const missingRevenueColumns = CATEGORIES.filter(
    (category) => !revenueColumnPresent.get(category.id),
  );

  if (missingRevenueColumns.length) {
    issues.push({
      severity: "WARNING",
      code: "WEEKLY_CATEGORY_REVENUE_ABSENT",
      message:
        "Ha categorias sem coluna de receita na planilha; o faturamento delas fica SEM_BASE.",
      source: "weekly",
      details: {
        categories: missingRevenueColumns.map((item) => item.id).join(" | "),
      },
    });
  }

  const detailEnd = detectBlockEnd(rows, 1);
  const detail: DetailRow[] = [];
  const unknownChannels = new Set<string>();

  for (const row of rows.slice(1, detailEnd)) {
    const classification = classifyChannel(row[channelColumn ?? -1]);
    if (channelColumn !== null && classification.raw && !classification.channel) {
      unknownChannels.add(classification.raw);
    }

    const units: Record<string, number> = {};
    const revenue: Record<string, number> = {};
    for (const category of CATEGORIES) {
      units[category.id] = cellNumber(row, column(headers, ...category.unit));
      revenue[category.id] = cellNumber(
        row,
        column(headers, ...category.revenue),
      );
    }

    detail.push({
      professional: normalizeText(row[professionalColumn ?? -1]),
      status: normalizeText(row[statusColumn ?? -1]),
      value: cellNumber(row, valueColumn),
      channel: classification.channel,
      campaign: classification.campaign,
      rawChannel: classification.raw,
      units,
      revenue,
    });
  }

  if (!detail.length) {
    issues.push({
      severity: "CRITICAL",
      code: "WEEKLY_EMPTY_DETAIL",
      message: "A planilha semanal nao possui nenhuma linha de paciente.",
      source: "weekly",
    });
  }

  if (unknownChannels.size) {
    issues.push({
      severity: "WARNING",
      code: "WEEKLY_CHANNEL_UNMAPPED",
      message:
        "Ha canais de origem fora da taxonomia; eles ficam fora dos recortes por canal.",
      source: "weekly",
      details: {
        records: unknownChannels.size,
        samples: [...unknownChannels].slice(0, 5).join(" | "),
      },
    });
  }

  const totalRevenue = detail.reduce((sum, row) => sum + row.value, 0);
  const attended = detail.length;

  // ---------------------------------------------------------------------------
  // Reconciliacao detalhe x pivo. O pivo e opcional; quando existe, ele e a
  // prova de que o detector de fim-de-bloco leu o bloco certo. Divergencia e
  // CRITICAL: publicar numero que nao fecha com o proprio arquivo e pior do que
  // nao publicar.
  // ---------------------------------------------------------------------------
  const pivotHeaderIndex = findPivotHeader(rows, detailEnd);
  let attendanceRate: number | null = null;
  let noShowRate: number | null = null;
  let confirmed: number | null = null;
  let absent: number | null = null;
  const batteries: Battery[] = [];

  if (pivotHeaderIndex === null) {
    issues.push({
      severity: "WARNING",
      code: "WEEKLY_PIVOT_ABSENT",
      message:
        "A planilha semanal nao traz o bloco de totais; a reconciliacao nao foi executada.",
      source: "weekly",
    });
  } else {
    const pivotHeaders = indexHeaders(rows, pivotHeaderIndex);
    const totalRow = rows
      .slice(pivotHeaderIndex + 1)
      .find((row) => /^TOTAL( GERAL)?$/.test(normalizeText(row[0])));

    if (!totalRow) {
      issues.push({
        severity: "CRITICAL",
        code: "WEEKLY_PIVOT_TOTAL_MISSING",
        message:
          "O bloco de totais existe mas nao possui a linha TOTAL GERAL para reconciliar.",
        source: "weekly",
      });
    } else {
      confirmed = cellNumber(totalRow, column(pivotHeaders, "COMPARECIDOS"));
      absent = cellNumber(totalRow, column(pivotHeaders, "FALTAS"));

      batteries.push(
        {
          key: "attended",
          label: "Atendimentos",
          detail: attended,
          pivot: cellNumber(totalRow, column(pivotHeaders, "TOTAL AGEND.", "TOTAL AGEND")),
        },
        {
          key: "revenue",
          label: "Faturamento total",
          detail: totalRevenue,
          pivot: cellNumber(
            totalRow,
            column(pivotHeaders, "TOTAL FATURADO 1A CONS.", "TOTAL FATURADO 1A CONS", "TOTAL FATURADO"),
          ),
        },
      );

      for (const category of CATEGORIES) {
        batteries.push({
          key: `units.${category.id}`,
          label: `${category.label} — unidades`,
          detail: detail.reduce((sum, row) => sum + row.units[category.id], 0),
          pivot: cellNumber(totalRow, column(pivotHeaders, ...category.unit)),
        });
        // Categoria sem coluna de receita nao gera bateria: reconciliar duas
        // ausencias daria 0 = 0 e o gate passaria sem ter verificado nada.
        if (revenueColumnPresent.get(category.id)) {
          batteries.push({
            key: `revenue.${category.id}`,
            label: `${category.label} — receita`,
            detail: detail.reduce(
              (sum, row) => sum + row.revenue[category.id],
              0,
            ),
            pivot: cellNumber(totalRow, column(pivotHeaders, ...category.revenue)),
          });
        }
      }

      const failed = batteries.filter(
        (battery) =>
          Math.abs(battery.detail - battery.pivot) > RECONCILIATION_TOLERANCE,
      );

      for (const battery of failed) {
        issues.push({
          severity: "CRITICAL",
          code: "WEEKLY_RECONCILIATION_FAILED",
          message: `Bateria ${battery.label}: detalhe e totais da planilha nao fecham.`,
          source: "weekly",
          details: {
            battery: battery.key,
            detail: battery.detail,
            pivot: battery.pivot,
            delta: Number((battery.detail - battery.pivot).toFixed(2)),
          },
        });
      }

      if (confirmed + absent > 0) {
        attendanceRate = confirmed / (confirmed + absent);
        noShowRate = absent / (confirmed + absent);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Metricas
  // ---------------------------------------------------------------------------
  const metrics: DashboardMetric[] = [
    metric({
      id: "weekly.attended.current",
      label: "Atendimentos da semana",
      value: attended,
      unit: "COUNT",
      period: periodHint,
      source: "weekly",
      sheet: sheetName,
    }),
    metric({
      id: "weekly.revenue.current",
      label: "Faturamento das primeiras consultas",
      value: totalRevenue,
      unit: "BRL",
      period: periodHint,
      source: "weekly",
      sheet: sheetName,
    }),
    metric({
      id: "weekly.ticket_average.current",
      label: "Ticket medio por atendido",
      value: attended ? totalRevenue / attended : null,
      unit: "BRL",
      period: periodHint,
      source: "weekly",
      sheet: sheetName,
      formula: "weekly.revenue.current / weekly.attended.current",
      dependencies: ["weekly.revenue.current", "weekly.attended.current"],
      note: attended ? null : "Sem atendimentos no periodo; denominador zero.",
    }),
    metric({
      id: "weekly.attendance_rate.current",
      label: "Taxa de comparecimento",
      value: attendanceRate,
      unit: "PERCENT",
      period: periodHint,
      source: "weekly",
      sheet: sheetName,
      formula: "comparecidos / (comparecidos + faltas)",
      note:
        attendanceRate === null
          ? "O bloco de totais nao trouxe comparecidos/faltas auditaveis."
          : null,
    }),
    metric({
      id: "weekly.no_show_rate.current",
      label: "Taxa de nao comparecimento",
      value: noShowRate,
      unit: "PERCENT",
      period: periodHint,
      source: "weekly",
      sheet: sheetName,
      formula: "faltas / (comparecidos + faltas)",
      note:
        noShowRate === null
          ? "O bloco de totais nao trouxe comparecidos/faltas auditaveis."
          : null,
    }),
  ];

  for (const category of CATEGORIES) {
    const units = detail.reduce((sum, row) => sum + row.units[category.id], 0);
    const hasRevenue = revenueColumnPresent.get(category.id) ?? false;
    const revenue = hasRevenue
      ? detail.reduce((sum, row) => sum + row.revenue[category.id], 0)
      : null;
    metrics.push(
      metric({
        id: `weekly.category.${category.id}.units`,
        label: `${category.label} — pacotes vendidos`,
        value: units,
        unit: "COUNT",
        period: periodHint,
        source: "weekly",
        sheet: sheetName,
      }),
      metric({
        id: `weekly.category.${category.id}.revenue`,
        label: `${category.label} — faturamento`,
        value: revenue,
        unit: "BRL",
        period: periodHint,
        source: "weekly",
        sheet: sheetName,
        note: hasRevenue
          ? null
          : "A planilha nao possui coluna de receita para esta categoria.",
      }),
      metric({
        id: `weekly.category.${category.id}.adoption_rate`,
        label: `${category.label} — taxa de adesao`,
        value: attended ? units / attended : null,
        unit: "PERCENT",
        period: periodHint,
        source: "weekly",
        sheet: sheetName,
        formula: `weekly.category.${category.id}.units / weekly.attended.current`,
        dependencies: [
          `weekly.category.${category.id}.units`,
          "weekly.attended.current",
        ],
      }),
    );
  }

  const acquisition = detail.filter(
    (row) => row.channel !== null && ACQUISITION_CHANNELS.includes(row.channel),
  );
  metrics.push(
    metric({
      id: "weekly.acquisition.attended.current",
      label: "Atendimentos de aquisicao (exclui recorrencia)",
      value: acquisition.length,
      unit: "COUNT",
      period: periodHint,
      source: "weekly",
      sheet: sheetName,
      note: "Pacientes de recorrencia ficam fora do denominador de aquisicao.",
    }),
    metric({
      id: "weekly.acquisition.revenue.current",
      label: "Faturamento de aquisicao",
      value: acquisition.reduce((sum, row) => sum + row.value, 0),
      unit: "BRL",
      period: periodHint,
      source: "weekly",
      sheet: sheetName,
    }),
  );

  // ---------------------------------------------------------------------------
  // Breakdowns. Nome de paciente e canal em texto livre nunca saem daqui: o
  // snapshot e publico e o gate de PII barraria de qualquer forma.
  // ---------------------------------------------------------------------------
  const channelRows = CHANNELS.map((channel) => {
    const bucket = detail.filter((row) => row.channel === channel);
    const revenue = bucket.reduce((sum, row) => sum + row.value, 0);
    return {
      channel,
      label: CHANNEL_LABELS[channel],
      patients: bucket.length,
      revenue,
      ticket: bucket.length ? revenue / bucket.length : null,
      share: totalRevenue ? revenue / totalRevenue : null,
      // O snapshot publicado so aceita escalares string/number/null. Se um dia
      // um flag booleano entrar aqui, ele vira contrato publico novo — a UI
      // deriva "e aquisicao?" de ACQUISITION_CHANNELS, que ja e exportado.
    };
  }).filter((row) => row.patients > 0);

  const professionalRows = [
    ...new Set(detail.map((row) => row.professional).filter(Boolean)),
  ].map((professional) => {
    const bucket = detail.filter((row) => row.professional === professional);
    const revenue = bucket.reduce((sum, row) => sum + row.value, 0);
    return {
      professional,
      patients: bucket.length,
      revenue,
      ticket: bucket.length ? revenue / bucket.length : null,
      share: totalRevenue ? revenue / totalRevenue : null,
    };
  });

  const categoryRows = CATEGORIES.map((category) => {
    const units = detail.reduce((sum, row) => sum + row.units[category.id], 0);
    return {
      category: category.id,
      label: category.label,
      units,
      revenue: revenueColumnPresent.get(category.id)
        ? detail.reduce((sum, row) => sum + row.revenue[category.id], 0)
        : null,
      adoption: attended ? units / attended : null,
    };
  });

  return {
    source: sourceSummary("weekly", input, periodHint, attended),
    metrics,
    breakdowns: {
      "weekly.channels": channelRows,
      "weekly.professionals": professionalRows,
      "weekly.categories": categoryRows,
      "weekly.reconciliation": batteries.map((battery) => ({
        battery: battery.key,
        label: battery.label,
        detail: battery.detail,
        pivot: battery.pivot,
        delta: Number((battery.detail - battery.pivot).toFixed(2)),
      })),
    },
    issues,
  };
}
