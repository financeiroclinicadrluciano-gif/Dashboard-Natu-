/**
 * Dados vivos da Meta Ads API — camada separada do pipeline deterministico.
 *
 * O pipeline le planilhas e publica o snapshot. Estes numeros vem da API da
 * Meta, consultados em 2026-08-07, e ficam numa camada propria com proveniencia
 * explicita: conta, periodo e data da consulta. Nao substituem o snapshot; a UI
 * os le em paralelo para o mes corrente e para a reconciliacao de julho.
 *
 * Por que existem duas colunas em julho:
 *   - "preliminar" e o fechamento manual, snapshot de ~28/07;
 *   - "maduro" e a mesma competencia consultada em 07/08.
 * A diferenca (1.441 -> 1.708 leads) e MATURACAO DE ATRIBUICAO: a Meta continua
 * atribuindo conversoes de clique de 7 dias por ~28 dias. Um fechamento tirado
 * no dia 28 sempre subconta. Nao e erro de dado; e o instante da foto.
 *
 * Fonte: Meta Ads API · conta "Natua MedSpa Backup 1" (1817673385831425) · BRL.
 * A conta "Natua MedSpa Principal" esta DESABILITADA ("unusual activity") e nao
 * e consultavel; o gasto real corre na Backup 1, como nos CSVs historicos.
 */
window.NATUA_META_LIVE = {
  source: "Meta Ads API",
  account: "Natua MedSpa Backup 1 (1817673385831425)",
  queriedAt: "2026-08-07",

  july: {
    period: "2026-07 (01-28)",
    status: "maduro",
    investmentTotal: 24815.22,
    investmentLeadgen: 20825.29,
    leadsLeadgen: 1708,
    cplLeadgen: 12.19,
    clicks: 21376,
    reach: 260980,
    // O que o fechamento manual registrou como preliminar, para comparar.
    preliminary: {
      investmentLeadgen: 20550.33,
      leadsLeadgen: 1441,
      cplLeadgen: 14.26,
    },
    campaigns: [
      { name: "Campanha Junho 2 · Remarketing", investment: 13662.38, leads: 1098, cpl: 12.44 },
      { name: "Campanha Junho 3 · Teste de Criativos", investment: 3951.97, leads: 312, cpl: 12.67 },
      { name: "Campanha Junho 1 · Campeões", investment: 3210.94, leads: 298, cpl: 10.77 },
    ],
  },

  august: {
    period: "2026-08 (01-07, parcial)",
    status: "parcial",
    investmentTotal: 3712.32,
    investmentLeadgen: 2998.0,
    leadsLeadgen: 206,
    cplLeadgen: 14.55,
    clicks: 3657,
    reach: 87531,
    // Validacao cruzada: a CRM (formulario) contou 207 submissoes nos mesmos
    // 7 dias. Duas fontes independentes, diferenca de 1 lead.
    crmFormLeads: 207,
    campaigns: [
      { name: "Campanha Junho 2 · Remarketing", investment: 1624.97, leads: 119, cpl: 13.66 },
      { name: "Campanha Junho 1 · Campeões", investment: 996.38, leads: 59, cpl: 16.89 },
      { name: "Campanha Junho 3 · Teste de Criativos", investment: 376.65, leads: 28, cpl: 13.45 },
    ],
  },
};
