# Reconciliação Meta — 2026-08-07

Fechamento de julho e abertura de agosto contra a **Meta Ads API**, consultada em
07/08/2026. Fonte: conta `Natuá MedSpa Backup 1 (1817673385831425)`, BRL — a conta
`Natuá MedSpa Principal` está **desabilitada** ("unusual activity") e não é
consultável; o gasto real corre na Backup 1, como nos CSVs históricos.

---

## O medo era legítimo: os números de julho mudaram. Não é erro.

| Julho leadgen (3 campanhas) | Fechamento manual (~28/07) | Meta API (07/08) | Δ |
|---|---:|---:|---:|
| Investimento | R$ 20.550,33 | R$ 20.825,29 | +R$ 274,96 |
| Leads | 1.441 | **1.708** | **+267 (+18,5%)** |
| CPL | R$ 14,26 | R$ 12,19 | −R$ 2,07 |

**Causa: maturação de atribuição.** A Meta atribui conversões de clique de 7 dias
por até ~28 dias após o clique. Um fechamento tirado no dia 28 conta só os leads
que já converteram até ali — os que clicaram em julho e converteram em agosto
entram depois. Por isso o número **sempre cresce** quando a mesma competência é
consultada mais tarde.

As duas leituras estão certas. São fotos em instantes diferentes:
- **1.441** = o que se sabia em 28/07 (preliminar);
- **1.708** = o número maduro de julho, consultado em 07/08 (final).

Cada campanha cresceu de forma coerente, sem salto anômalo:

| Campanha | Leads 28/07 | Leads 07/08 | Investimento 07/08 | CPL |
|---|---:|---:|---:|---:|
| Junho 2 · Remarketing | 915 | 1.098 | R$ 13.662,38 | R$ 12,44 |
| Junho 3 · Teste Criativos | 279 | 312 | R$ 3.951,97 | R$ 12,67 |
| Junho 1 · Campeões | 247 | 298 | R$ 3.210,94 | R$ 10,77 |
| **Total leadgen** | **1.441** | **1.708** | **R$ 20.825,29** | **R$ 12,19** |

Conta inteira em julho (inclui Seguidores e Landing Page, sem lead): investimento
**R$ 24.815,22**, alcance 260.980, 21.376 cliques.

---

## Agosto validado por DUAS fontes independentes

| Agosto 01–07 (parcial) | Meta API | CRM (formulário) | Δ |
|---|---:|---:|---:|
| Leads leadgen | 206 | 207 | **1 lead (99,5%)** |

Duas fontes que não se falam concordam em 99,5%. Isso valida o pipeline inteiro
para o mês corrente — e confirma o ritmo de agosto que o painel já mostrava.

| Agosto 01–07 · tráfego pago (Meta) | |
|---|---:|
| Investimento total | R$ 3.712,32 |
| Investimento leadgen (3 campanhas) | R$ 2.998,00 |
| Leads leadgen | 206 |
| CPL leadgen | R$ 14,55 |
| Alcance | 87.531 |
| Cliques | 3.657 |

**Ritmo de agosto: −30,5%** vs os mesmos 7 dias de julho (207 vs 298 leads na CRM).
O CPL subiu de R$ 12,19 (julho maduro) para R$ 14,55 — está mais caro e trazendo
menos. Sinal para a próxima reunião.

---

## A decisão que é do Gustavo, não minha

O baseline de regressão (`tests/baselines/fechamento-2026-07.json`) trava julho em
**1.441 leads** — o fechamento preliminar aprovado. Os números maduros da Meta
mostram **1.708**. Trocar o baseline é **re-fechar julho** e muda a referência que
o gate de regressão protege.

**Recomendação:** re-fechar julho com os números maduros da Meta (1.708 leads,
CPL R$ 12,19), porque é o número final e verdadeiro do mês. Mas isso é uma decisão
de fechamento, não um ajuste silencioso — o baseline só muda com aprovação
explícita, e é isso que a regra do baseline exige.

Enquanto não houver decisão, o painel mostra:
- **julho** = fechamento preliminar aprovado (1.441), como estava;
- **reconciliação** = esta comparação, para a decisão ser informada;
- **agosto** = Meta + CRM ao vivo, claramente marcado como parcial.

---

## O que a Meta Ads API NÃO entregou

- **Orgânico** (visualizações, alcance, interações, stories) — esta é uma API de
  **anúncios**. Orgânico vem do Instagram Insights, que continua **não
  autorizado**. Os dados orgânicos no painel seguem sendo os das planilhas
  (março–julho). `NÃO EXECUTADO`.
- **MQL** — a Meta conta "lead" (submissão), não MQL. A classificação de MQL
  continua vindo da auditoria CRM (abas BASE MQL). `PENDENTE` para agosto.

---

Camada de dados: `public/data/meta-live.js`. Governada por `docs/contrato-de-dados.md`.
