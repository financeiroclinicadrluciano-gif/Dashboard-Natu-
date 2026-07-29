import type { DashboardMetric, ValidationIssue } from "../model";
import {
  finiteNumber,
  inferWorkbookYear,
  normalizeText,
  periodFromSheetName,
  previousPeriod,
  sheetRows,
  type WorkbookInput,
} from "../workbooks";
import {
  labelRows,
  metric,
  requiredNumber,
  rowNumber,
  sourceSummary,
  type AdapterResult,
} from "./common";

export function adaptMarketing(input: WorkbookInput): AdapterResult {
  const issues: ValidationIssue[] = [];
  const year = inferWorkbookYear(input);
  const summarySheets = input.workbook.SheetNames.filter((name) =>
    normalizeText(name).startsWith("MARKETING "),
  );
  const periods = summarySheets
    .map((name) => ({ name, period: periodFromSheetName(name, year) }))
    .filter((item): item is { name: string; period: string } =>
      Boolean(item.period),
    )
    .sort((a, b) => a.period.localeCompare(b.period));
  const latest = periods.at(-1);

  if (!latest) {
    return {
      source: sourceSummary("marketing", input, `${year}-01`, 0),
      metrics: [],
      breakdowns: {},
      issues: [
        {
          severity: "CRITICAL",
          code: "MARKETING_SUMMARY_MISSING",
          message: "Nenhuma aba mensal de Marketing foi encontrada.",
          source: "marketing",
        },
      ],
    };
  }

  const currentRows = labelRows(sheetRows(input.workbook, latest.name));
  const currentPeriod = latest.period;
  const priorPeriod = previousPeriod(currentPeriod);
  const required = (
    pattern: RegExp,
    column: number,
    code: string,
    label: string,
  ) =>
    requiredNumber(
      rowNumber(currentRows, pattern, column),
      code,
      `Metrica obrigatoria ausente na aba ${latest.name}: ${label}.`,
      "marketing",
      issues,
    );

  const specs = [
    {
      key: "investment.total",
      label: "Investimento total",
      pattern: /^INVESTIMENTO TOTAL$/,
      unit: "BRL" as const,
    },
    {
      key: "investment.meta",
      label: "Investimento Meta",
      pattern: /^INVESTIMENTO META$/,
      unit: "BRL" as const,
    },
    {
      key: "investment.google",
      label: "Investimento Google",
      pattern: /^INVESTIMENTO GOOGLE$/,
      unit: "BRL" as const,
    },
    {
      key: "leads.meta",
      label: "Leads Meta",
      pattern: /^LEADS META/,
      unit: "COUNT" as const,
    },
    {
      key: "cpl.total",
      label: "Custo total por lead",
      pattern: /^CUSTO TOTAL PAGO/,
      unit: "BRL" as const,
    },
    {
      key: "mql",
      label: "MQL confirmados",
      pattern: /^MQL CONFIRMADOS/,
      unit: "COUNT" as const,
    },
    {
      key: "cost.mql",
      label: "Custo por MQL",
      pattern: /^CUSTO POR MQL/,
      unit: "BRL" as const,
    },
    {
      key: "rate.mql",
      label: "Taxa MQL",
      pattern: /^TAXA MQL/,
      unit: "PERCENT" as const,
    },
    {
      key: "forms.valid",
      label: "Formularios validos",
      pattern: /^FORMULARIOS VALIDOS/,
      unit: "COUNT" as const,
    },
    {
      key: "commercial.attended",
      label: "Atendimentos comerciais",
      pattern: /^ATENDIMENTOS COMERCIAIS REGISTRADOS$/,
      unit: "COUNT" as const,
    },
    {
      key: "appointments.marketing",
      label: "Agendamentos de marketing",
      pattern: /^AGENDAMENTOS MKT$/,
      unit: "COUNT" as const,
    },
    {
      key: "first_consultation.revenue",
      label: "Faturamento de primeira consulta",
      pattern: /^FATURAMENTO TOTAL DE 1A CONSULTA$/,
      unit: "BRL" as const,
    },
    {
      key: "first_patient.treatments",
      label: "Tratamentos fechados de primeiros pacientes",
      pattern: /^TRATAMENTOS FECHADOS EM TODAS AS 1A CONSULTAS$/,
      unit: "BRL" as const,
    },
    {
      key: "roi.consultation",
      label: "ROI de consultas",
      pattern: /^ROI DE 1A CONSULTA/,
      unit: "RATIO" as const,
    },
    {
      key: "roi.treatments",
      label: "ROI de tratamentos de primeiros pacientes",
      pattern: /^ROI TOTAL DE PRIMEIROS PACIENTES/,
      unit: "RATIO" as const,
    },
    {
      key: "cac.appointment",
      label: "CAC por agendamento de marketing",
      pattern: /^CAC POR AGENDAMENTO/,
      unit: "BRL" as const,
    },
  ];

  const metrics: DashboardMetric[] = [];
  for (const spec of specs) {
    const current = required(
      spec.pattern,
      1,
      `MARKETING_${spec.key.replace(/\./g, "_").toUpperCase()}_MISSING`,
      spec.label,
    );
    const previous = rowNumber(currentRows, spec.pattern, 2);

    metrics.push(
      metric({
        id: `marketing.${spec.key}.current`,
        label: spec.label,
        value: current,
        unit: spec.unit,
        period: currentPeriod,
        source: "marketing",
        sheet: latest.name,
      }),
      metric({
        id: `marketing.${spec.key}.previous`,
        label: `${spec.label} no periodo anterior`,
        value: previous,
        unit: spec.unit,
        period: priorPeriod,
        source: "marketing",
        sheet: latest.name,
        note:
          previous === null
            ? "A aba atual nao trouxe a coluna comparativa."
            : "Valor comparativo publicado na aba mensal atual.",
      }),
    );
  }
  const funnelRows = labelRows(sheetRows(input.workbook, latest.name), 6);
  const clicks = requiredNumber(
    rowNumber(funnelRows, /^CLIQUES NO LINK$/, 7),
    "MARKETING_CLICKS_MISSING",
    `Metrica obrigatoria ausente na aba ${latest.name}: cliques no link.`,
    "marketing",
    issues,
  );
  const investment =
    metrics.find(
      (item) => item.id === "marketing.investment.total.current",
    )?.value ?? null;
  const validForms =
    metrics.find((item) => item.id === "marketing.forms.valid.current")
      ?.value ?? null;
  const mql =
    metrics.find((item) => item.id === "marketing.mql.current")?.value ??
    null;
  const marketingAppointments =
    metrics.find(
      (item) => item.id === "marketing.appointments.marketing.current",
    )?.value ?? null;
  metrics.push(
    metric({
      id: "marketing.clicks.link.current",
      label: "Cliques no link",
      value: clicks,
      unit: "COUNT",
      period: currentPeriod,
      source: "marketing",
      sheet: latest.name,
    }),
    metric({
      id: "marketing.cpc.current",
      label: "Custo por clique",
      value: clicks && investment !== null ? investment / clicks : null,
      unit: "BRL",
      period: currentPeriod,
      source: "marketing",
      sheet: latest.name,
      formula: "investimento total / cliques no link",
      dependencies: [
        "marketing.investment.total.current",
        "marketing.clicks.link.current",
      ],
    }),
    metric({
      id: "marketing.click_to_form_rate.current",
      label: "Conversao de clique em formulario valido",
      value: clicks && validForms !== null ? validForms / clicks : null,
      unit: "PERCENT",
      period: currentPeriod,
      source: "marketing",
      sheet: latest.name,
      formula: "formularios validos / cliques no link",
      dependencies: [
        "marketing.forms.valid.current",
        "marketing.clicks.link.current",
      ],
    }),
    metric({
      id: "marketing.cost.form.current",
      label: "Custo por formulario valido",
      value:
        validForms && investment !== null
          ? investment / validForms
          : null,
      unit: "BRL",
      period: currentPeriod,
      source: "marketing",
      sheet: latest.name,
      formula: "investimento total / formularios validos",
      dependencies: [
        "marketing.investment.total.current",
        "marketing.forms.valid.current",
      ],
    }),
    metric({
      id: "marketing.mql_to_appointment_rate.current",
      label: "Conversao de MQL em agendamento de marketing",
      value:
        mql && marketingAppointments !== null
          ? marketingAppointments / mql
          : null,
      unit: "PERCENT",
      period: currentPeriod,
      source: "marketing",
      sheet: latest.name,
      formula: "agendamentos de marketing / MQL confirmados",
      dependencies: [
        "marketing.appointments.marketing.current",
        "marketing.mql.current",
      ],
    }),
    metric({
      id: "marketing.loss.click_to_form.current",
      label: "Perda entre clique e formulario valido",
      value:
        clicks !== null && validForms !== null
          ? clicks - validForms
          : null,
      unit: "COUNT",
      period: currentPeriod,
      source: "marketing",
      sheet: latest.name,
      formula: "cliques no link - formularios validos",
      dependencies: [
        "marketing.clicks.link.current",
        "marketing.forms.valid.current",
      ],
    }),
    metric({
      id: "marketing.loss.form_to_mql.current",
      label: "Perda entre formulario valido e MQL",
      value:
        validForms !== null && mql !== null ? validForms - mql : null,
      unit: "COUNT",
      period: currentPeriod,
      source: "marketing",
      sheet: latest.name,
      formula: "formularios validos - MQL confirmados",
      dependencies: [
        "marketing.forms.valid.current",
        "marketing.mql.current",
      ],
    }),
    metric({
      id: "marketing.loss.mql_to_appointment.current",
      label: "Perda entre MQL e agendamento de marketing",
      value:
        mql !== null && marketingAppointments !== null
          ? mql - marketingAppointments
          : null,
      unit: "COUNT",
      period: currentPeriod,
      source: "marketing",
      sheet: latest.name,
      formula: "MQL confirmados - agendamentos de marketing",
      dependencies: [
        "marketing.mql.current",
        "marketing.appointments.marketing.current",
      ],
    }),
  );
  const marketingHistory = periods.map(({ name, period }) => {
    const rows = labelRows(sheetRows(input.workbook, name));
    const valueFor = (pattern: RegExp): number | null =>
      rowNumber(rows, pattern, 1);
    return {
      period,
      investment: valueFor(/^INVESTIMENTO TOTAL$/),
      leads: valueFor(/^LEADS META/),
      cpl: valueFor(/^CUSTO TOTAL PAGO/),
      mql: valueFor(/^MQL CONFIRMADOS/),
      mqlRate: valueFor(/^TAXA MQL/),
      appointments: valueFor(/^AGENDAMENTOS MKT$/),
    };
  });

  const organicSheet = input.workbook.SheetNames.find(
    (name) =>
      normalizeText(name).startsWith("ORGANICO ") &&
      periodFromSheetName(name, year) === currentPeriod,
  );
  const organicBreakdown: Array<
    Record<string, string | number | null>
  > = [];
  const organicTimeline: Array<
    Record<string, string | number | null>
  > = [];

  if (organicSheet) {
    const rows = sheetRows(input.workbook, organicSheet);
    for (const row of rows.slice(0, 8)) {
      const profile = normalizeText(row[0]);
      if (!["DR. LUCIANO", "DR LUCIANO", "NATUA"].includes(profile)) {
        continue;
      }

      const prefix = profile.includes("LUCIANO") ? "doctor" : "natua";
      const values = [
        ["views", "Visualizacoes", row[1]],
        ["reach", "Alcance", row[2]],
        ["interactions", "Interacoes", row[3]],
        ["profile_visits", "Visitas ao perfil", row[4]],
        ["bio_clicks", "Cliques na bio", row[5]],
      ] as const;

      for (const [key, label, raw] of values) {
        metrics.push(
          metric({
            id: `organic.${prefix}.${key}.current`,
            label: `${label} ${prefix === "doctor" ? "Dr. Luciano" : "Natua"}`,
            value: finiteNumber(raw),
            unit: "COUNT",
            period: currentPeriod,
            source: "marketing",
            sheet: organicSheet,
          }),
        );
      }

      const reach = finiteNumber(row[2]);
      const interactions = finiteNumber(row[3]);
      const profileVisits = finiteNumber(row[4]);
      const bioClicks = finiteNumber(row[5]);
      metrics.push(
        metric({
          id: `organic.${prefix}.interaction_rate.current`,
          label: "Taxa de interacao por alcance",
          value:
            reach && interactions !== null ? interactions / reach : null,
          unit: "PERCENT",
          period: currentPeriod,
          source: "marketing",
          sheet: organicSheet,
          formula: "interacoes / alcance",
          dependencies: [
            `organic.${prefix}.interactions.current`,
            `organic.${prefix}.reach.current`,
          ],
        }),
        metric({
          id: `organic.${prefix}.visit_rate.current`,
          label: "Taxa de visita por alcance",
          value:
            reach && profileVisits !== null ? profileVisits / reach : null,
          unit: "PERCENT",
          period: currentPeriod,
          source: "marketing",
          sheet: organicSheet,
          formula: "visitas ao perfil / alcance",
          dependencies: [
            `organic.${prefix}.profile_visits.current`,
            `organic.${prefix}.reach.current`,
          ],
        }),
        metric({
          id: `organic.${prefix}.bio_click_rate.current`,
          label: "Taxa de clique por visita",
          value:
            profileVisits && bioClicks !== null
              ? bioClicks / profileVisits
              : null,
          unit: "PERCENT",
          period: currentPeriod,
          source: "marketing",
          sheet: organicSheet,
          formula: "cliques na bio / visitas ao perfil",
          dependencies: [
            `organic.${prefix}.bio_clicks.current`,
            `organic.${prefix}.profile_visits.current`,
          ],
        }),
        metric({
          id: `organic.${prefix}.reach_click_rate.current`,
          label: "Taxa de clique por alcance",
          value: reach && bioClicks !== null ? bioClicks / reach : null,
          unit: "PERCENT",
          period: currentPeriod,
          source: "marketing",
          sheet: organicSheet,
          formula: "cliques na bio / alcance",
          dependencies: [
            `organic.${prefix}.bio_clicks.current`,
            `organic.${prefix}.reach.current`,
          ],
        }),
      );

      organicBreakdown.push({
        profile: prefix === "doctor" ? "Dr. Luciano" : "Natua",
        period: currentPeriod,
        views: finiteNumber(row[1]),
        reach,
        interactions,
        profileVisits,
        bioClicks,
      });
      organicTimeline.push({
        profile: prefix === "doctor" ? "Dr. Luciano" : "Natua",
        profileKey: prefix,
        period: currentPeriod,
        posts: null,
        views: finiteNumber(row[1]),
        reach,
        interactions,
        profileVisits,
        bioClicks,
      });
    }
  } else {
    issues.push({
      severity: "WARNING",
      code: "ORGANIC_CURRENT_MISSING",
      message: `Aba de Organico nao encontrada para ${currentPeriod}.`,
      source: "marketing",
    });
  }

  const organicHistorySheet = input.workbook.SheetNames.find(
    (name) => normalizeText(name) === "ORGANICO",
  );
  if (organicHistorySheet) {
    const rows = sheetRows(input.workbook, organicHistorySheet);
    const metricValue = (
      pattern: RegExp,
      labelColumn: number,
      valueColumn: number,
    ): number | null => {
      const row = rows.find((item) =>
        pattern.test(normalizeText(item[labelColumn])),
      );
      return finiteNumber(row?.[valueColumn]);
    };
    const historyPeriods = [
      { period: `${year}-05`, doctorColumn: 1, natuaColumn: 7 },
      { period: `${year}-06`, doctorColumn: 2, natuaColumn: 8 },
    ];

    for (const historyPeriod of historyPeriods) {
      for (const profile of [
        {
          profile: "Dr. Luciano",
          profileKey: "doctor",
          labelColumn: 0,
          valueColumn: historyPeriod.doctorColumn,
        },
        {
          profile: "Natua",
          profileKey: "natua",
          labelColumn: 6,
          valueColumn: historyPeriod.natuaColumn,
        },
      ]) {
        organicTimeline.push({
          profile: profile.profile,
          profileKey: profile.profileKey,
          period: historyPeriod.period,
          posts: metricValue(
            /^POSTS PUBLICADOS$/,
            profile.labelColumn,
            profile.valueColumn,
          ),
          views: metricValue(
            /^VISUALIZACOES TOTAIS$/,
            profile.labelColumn,
            profile.valueColumn,
          ),
          reach: metricValue(
            /^CONTAS ALCANCADAS$/,
            profile.labelColumn,
            profile.valueColumn,
          ),
          interactions: metricValue(
            /^INTERACOES COM O CONTEUDO$/,
            profile.labelColumn,
            profile.valueColumn,
          ),
          profileVisits: metricValue(
            /^VISITAS AO PERFIL$/,
            profile.labelColumn,
            profile.valueColumn,
          ),
          bioClicks: metricValue(
            /^CLIQUES NO LINK DA BIO$/,
            profile.labelColumn,
            profile.valueColumn,
          ),
        });
      }
    }

    for (const prefix of ["doctor", "natua"] as const) {
      const previous = organicTimeline.find(
        (point) =>
          point.profileKey === prefix && point.period === priorPeriod,
      );
      if (!previous) {
        continue;
      }

      const fields = [
        ["views", "Visualizacoes", previous.views],
        ["reach", "Alcance", previous.reach],
        ["interactions", "Interacoes", previous.interactions],
        ["profile_visits", "Visitas ao perfil", previous.profileVisits],
        ["bio_clicks", "Cliques na bio", previous.bioClicks],
      ] as const;
      for (const [key, label, value] of fields) {
        metrics.push(
          metric({
            id: `organic.${prefix}.${key}.previous`,
            label: `${label} ${prefix === "doctor" ? "Dr. Luciano" : "Natua"} no periodo anterior`,
            value: finiteNumber(value),
            unit: "COUNT",
            period: priorPeriod,
            source: "marketing",
            sheet: organicHistorySheet,
          }),
        );
      }
      const previousReach = finiteNumber(previous.reach);
      const previousInteractions = finiteNumber(previous.interactions);
      const previousProfileVisits = finiteNumber(previous.profileVisits);
      const previousBioClicks = finiteNumber(previous.bioClicks);
      metrics.push(
        metric({
          id: `organic.${prefix}.interaction_rate.previous`,
          label: "Taxa de interacao por alcance no periodo anterior",
          value:
            previousReach && previousInteractions !== null
              ? previousInteractions / previousReach
              : null,
          unit: "PERCENT",
          period: priorPeriod,
          source: "marketing",
          sheet: organicHistorySheet,
          formula: "interacoes / alcance",
        }),
        metric({
          id: `organic.${prefix}.visit_rate.previous`,
          label: "Taxa de visita por alcance no periodo anterior",
          value:
            previousReach && previousProfileVisits !== null
              ? previousProfileVisits / previousReach
              : null,
          unit: "PERCENT",
          period: priorPeriod,
          source: "marketing",
          sheet: organicHistorySheet,
          formula: "visitas ao perfil / alcance",
        }),
        metric({
          id: `organic.${prefix}.bio_click_rate.previous`,
          label: "Taxa de clique por visita no periodo anterior",
          value:
            previousProfileVisits && previousBioClicks !== null
              ? previousBioClicks / previousProfileVisits
              : null,
          unit: "PERCENT",
          period: priorPeriod,
          source: "marketing",
          sheet: organicHistorySheet,
          formula: "cliques na bio / visitas ao perfil",
        }),
      );
    }
  }

  const trafficSheet = input.workbook.SheetNames.find(
    (name) =>
      normalizeText(name).startsWith("TRAFEGO ") &&
      periodFromSheetName(name, year) === currentPeriod,
  );
  const campaigns: Array<Record<string, string | number | null>> = [];
  if (trafficSheet) {
    const rows = sheetRows(input.workbook, trafficSheet);
    const start = rows.findIndex((row) =>
      normalizeText(row[0]).includes("CAMPANHAS"),
    );
    for (const row of rows.slice(start + 2)) {
      const name = String(row[0] ?? "").trim();
      if (
        campaigns.length > 0 &&
        (!name || normalizeText(name).startsWith("TOP "))
      ) {
        break;
      }
      const investment = finiteNumber(row[1]);
      const leads = finiteNumber(row[2]);
      if (!name || investment === null || leads === null) {
        continue;
      }
      campaigns.push({
        name,
        investment,
        leads,
        cpl: finiteNumber(row[3]),
        mql: finiteNumber(row[4]),
        mqlRate: finiteNumber(row[5]),
      });
    }
    const leadgenInvestment = campaigns.reduce(
      (sum, campaign) => sum + Number(campaign.investment ?? 0),
      0,
    );
    const leadgenResults = campaigns.reduce(
      (sum, campaign) => sum + Number(campaign.leads ?? 0),
      0,
    );
    metrics.push(
      metric({
        id: "marketing.investment.leadgen.current",
        label: "Investimento Meta em campanhas de leadgen",
        value: leadgenInvestment,
        unit: "BRL",
        period: currentPeriod,
        source: "marketing",
        sheet: trafficSheet,
        formula: "soma do investimento das campanhas de leadgen",
      }),
      metric({
        id: "marketing.cpl.leadgen.current",
        label: "CPL Meta leadgen",
        value:
          leadgenResults > 0
            ? leadgenInvestment / leadgenResults
            : null,
        unit: "BRL",
        period: currentPeriod,
        source: "marketing",
        sheet: trafficSheet,
        formula: "investimento leadgen / resultados leadgen",
        dependencies: ["marketing.investment.leadgen.current"],
      }),
    );
  }

  return {
    source: sourceSummary(
      "marketing",
      input,
      currentPeriod,
      sheetRows(input.workbook, latest.name).filter((row) =>
        row.some((value) => value !== null && value !== ""),
      ).length,
    ),
    metrics,
    breakdowns: {
      "marketing.campaigns": campaigns,
      "marketing.history": marketingHistory,
      "organic.profiles": organicBreakdown,
      "organic.timeline": organicTimeline,
    },
    issues,
  };
}
