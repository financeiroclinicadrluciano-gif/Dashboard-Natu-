import type { DashboardMetric } from "./model";

/**
 * Fechamento maduro pela Meta Ads API.
 *
 * O fechamento manual de julho foi um snapshot de ~28/07 e subcontou 18% dos
 * leads por maturacao de atribuicao: a Meta atribui cliques de 7 dias por ~28
 * dias, entao leads que clicaram em julho e converteram em agosto nao estavam
 * la. Consultada em 07/08, a mesma competencia fecha em 1.708 leads.
 *
 * Este override troca as metricas PAGAS de julho pelos numeros maduros e stampa
 * a proveniencia como "Meta Ads API". As metricas derivadas (CPL, custo por MQL,
 * CAC, ROI) sao RECALCULADAS a partir dos brutos maduros e dos denominadores que
 * continuam vindo das outras fontes (MQL da CRM, agendamentos e receita do
 * comercial). Recalcular em vez de transcrever garante que as identidades
 * aritmeticas do validador continuem fechando — o proprio gate prova o re-fecho.
 *
 * O que NAO muda: MQL (classificacao CRM), formularios validos, comercial,
 * organico. A Meta conta lead, nao MQL.
 */

export interface MetaClose {
  /** Competencia AAAA-MM que este fechamento substitui. */
  period: string;
  /** Data da consulta a API, para proveniencia. */
  queriedAt: string;
  investmentTotal: number;
  investmentMeta: number;
  investmentGoogle: number;
  investmentLeadgen: number;
  leadsMeta: number;
  clicks: number;
  reach: number;
}

/** O fechamento maduro de julho de 2026, consultado em 07/08. */
export const JULY_2026_META_CLOSE: MetaClose = {
  period: "2026-07",
  queriedAt: "2026-08-07",
  investmentTotal: 24815.22,
  investmentMeta: 24815.22,
  investmentGoogle: 0,
  investmentLeadgen: 20825.29,
  leadsMeta: 1708,
  clicks: 21376,
  reach: 260980,
};

function currentValue(
  metrics: Record<string, DashboardMetric>,
  id: string,
): number | null {
  const found = metrics[id];
  return found && found.value !== null ? found.value : null;
}

/**
 * Aplica o fechamento maduro sobre o mapa de metricas, sem mutar o original.
 * So age se a competencia principal bater com a do fechamento — um override de
 * julho nunca contamina agosto.
 */
export function applyMetaClose(
  metrics: Record<string, DashboardMetric>,
  primaryPeriod: string,
  close: MetaClose,
): Record<string, DashboardMetric> {
  if (primaryPeriod !== close.period) {
    return metrics;
  }

  const sheet = `Meta Ads API (maduro ${close.queriedAt})`;
  const maturationNote =
    "Fechamento maduro da Meta; supera o preliminar de 28/07 por maturacao de atribuicao (7 dias de clique, ~28 dias de janela).";

  // Denominadores que continuam vindo das outras fontes.
  const mql = currentValue(metrics, "marketing.mql.current");
  const validForms = currentValue(metrics, "marketing.forms.valid.current");
  const appointments = currentValue(
    metrics,
    "marketing.appointments.marketing.current",
  );
  const firstConsultRevenue = currentValue(
    metrics,
    "marketing.first_consultation.revenue.current",
  );
  const firstPatientTreatments = currentValue(
    metrics,
    "marketing.first_patient.treatments.current",
  );

  const next: Record<string, DashboardMetric> = { ...metrics };

  const put = (
    id: string,
    value: number | null,
    formula: string | null = null,
    dependencies: string[] = [],
  ): void => {
    const base = metrics[id];
    if (!base) {
      return;
    }
    next[id] = {
      ...base,
      value,
      status: value === null ? "SEM_BASE" : "VALIDATED",
      sheet,
      formula,
      dependencies,
      note: maturationNote,
    };
  };

  // Cliques NAO sao sobrescritos: o "clicks" da conta na Meta conta TODOS os
  // cliques, enquanto o painel usa cliques de link leadgen. Sao definicoes
  // diferentes; trocar quebraria a taxa clique->formulario. O clique leadgen
  // preliminar continua sendo o denominador certo.
  const clicks = currentValue(metrics, "marketing.clicks.link.current");

  // Brutos maduros.
  put("marketing.investment.total.current", close.investmentTotal);
  put("marketing.investment.meta.current", close.investmentMeta);
  put("marketing.investment.google.current", close.investmentGoogle);
  put("marketing.investment.leadgen.current", close.investmentLeadgen);
  put("marketing.leads.meta.current", close.leadsMeta);

  // Derivados recalculados a partir dos brutos maduros. As identidades do
  // validador conferem exatamente estas contas.
  put(
    "marketing.cpl.total.current",
    close.leadsMeta ? close.investmentTotal / close.leadsMeta : null,
    "investimento total / leads Meta",
    ["marketing.investment.total.current", "marketing.leads.meta.current"],
  );
  put(
    "marketing.cpl.leadgen.current",
    close.leadsMeta ? close.investmentLeadgen / close.leadsMeta : null,
    "investimento leadgen / leads Meta",
    ["marketing.investment.leadgen.current", "marketing.leads.meta.current"],
  );
  put(
    "marketing.cost.mql.current",
    mql ? close.investmentLeadgen / mql : null,
    "investimento leadgen / MQL",
    ["marketing.investment.leadgen.current", "marketing.mql.current"],
  );
  put(
    "marketing.cac.appointment.current",
    appointments ? close.investmentTotal / appointments : null,
    "investimento total / agendamentos de marketing",
    [
      "marketing.investment.total.current",
      "marketing.appointments.marketing.current",
    ],
  );
  put(
    "marketing.roi.consultation.current",
    firstConsultRevenue !== null && close.investmentTotal
      ? firstConsultRevenue / close.investmentTotal
      : null,
    "receita de 1a consulta / investimento total",
    [
      "marketing.first_consultation.revenue.current",
      "marketing.investment.total.current",
    ],
  );
  put(
    "marketing.roi.treatments.current",
    firstPatientTreatments !== null && close.investmentTotal
      ? firstPatientTreatments / close.investmentTotal
      : null,
    "tratamentos de 1a consulta / investimento total",
    [
      "marketing.first_patient.treatments.current",
      "marketing.investment.total.current",
    ],
  );

  // Taxa de MQL nao muda: MQL e formularios continuam da CRM. O CPC depende do
  // investimento maduro, entao e recalculado sobre os cliques leadgen preliminares.
  void validForms;
  put(
    "marketing.cpc.current",
    clicks ? close.investmentTotal / clicks : null,
    "investimento total / cliques no link",
    ["marketing.investment.total.current", "marketing.clicks.link.current"],
  );

  return next;
}

type BreakdownRow = Record<string, string | number | null>;

/**
 * Patcha a linha do mes maduro na serie historica, para a tela de comparativo
 * mostrar o mesmo numero maduro dos KPIs. Sem isso, o KPI diria 1.708 e o
 * comparativo diria 1.441 — a inconsistencia que mais assusta.
 */
export function applyMetaCloseToBreakdowns(
  breakdowns: Record<string, BreakdownRow[]>,
  primaryPeriod: string,
  close: MetaClose,
  mql: number | null,
): Record<string, BreakdownRow[]> {
  if (primaryPeriod !== close.period) {
    return breakdowns;
  }
  const history = breakdowns["marketing.history"];
  if (!history) {
    return breakdowns;
  }
  const patched = history.map((row) =>
    row.period === close.period
      ? {
          ...row,
          investment: close.investmentTotal,
          leads: close.leadsMeta,
          cpl: close.leadsMeta ? close.investmentTotal / close.leadsMeta : null,
          mql,
          // mqlRate e MQL/formularios (nao MQL/leads); nao muda com o re-fecho.
        }
      : row,
  );
  return { ...breakdowns, "marketing.history": patched };
}
