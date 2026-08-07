# Dicionario de metricas

> **Gerado a partir de `public/data/dashboard-snapshot.json`**, nao escrito a mao.
> Metrica que nao existe no snapshot nao aparece aqui; metrica nova aparece sozinha
> na proxima geracao. Regenerar com `npm run docs:metricas`.

Snapshot de referencia: `2026-07-29-c3ffdca9-d845-4fe5-b96e-b43b79690828` · periodo `2026-07` · 116 metricas.

## Como ler

| Coluna | Significado |
|---|---|
| **ID** | chave estavel; e por ela que a UI e os testes referenciam a metrica |
| **Unidade** | `quantidade`, `moeda (BRL)`, `percentual`, `multiplo (x)` ou `dias`. ROI e multiplo, nunca percentual |
| **Formula** | vazio = valor lido direto da fonte; preenchido = calculado a partir das dependencias |
| **Estado** | `VALIDATED` tem fonte auditavel · `SEM_BASE` nao tem e **nao pode ser estimada** |
| **Aba** | a aba exata de onde o numero saiu |

Estado atual: **111 VALIDATED · 2 WARNING · 3 SEM_BASE**.

---

## Fonte: Relatorio de marketing (`marketing`) — 76 metricas

| ID | Rotulo | Unidade | Formula | Estado | Aba |
|---|---|---|---|---|---|
| `marketing.appointments.marketing.current` | Agendamentos de marketing | quantidade | `—` | VALIDATED | MARKETING JULHO |
| `marketing.appointments.marketing.previous` | Agendamentos de marketing no periodo anterior | quantidade | `—` | VALIDATED | MARKETING JULHO |
| `marketing.cac.appointment.current` | CAC por agendamento de marketing | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.cac.appointment.previous` | CAC por agendamento de marketing no periodo anterior | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.click_to_form_rate.current` | Conversao de clique em formulario valido | percentual | `formularios validos / cliques no link` | VALIDATED | MARKETING JULHO |
| `marketing.clicks.link.current` | Cliques no link | quantidade | `—` | VALIDATED | MARKETING JULHO |
| `marketing.commercial.attended.current` | Atendimentos comerciais | quantidade | `—` | VALIDATED | MARKETING JULHO |
| `marketing.commercial.attended.previous` | Atendimentos comerciais no periodo anterior | quantidade | `—` | VALIDATED | MARKETING JULHO |
| `marketing.cost.form.current` | Custo por formulario valido | moeda (BRL) | `investimento total / formularios validos` | VALIDATED | MARKETING JULHO |
| `marketing.cost.mql.current` | Custo por MQL | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.cost.mql.previous` | Custo por MQL no periodo anterior | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.cpc.current` | Custo por clique | moeda (BRL) | `investimento total / cliques no link` | VALIDATED | MARKETING JULHO |
| `marketing.cpl.leadgen.current` | CPL Meta leadgen | moeda (BRL) | `investimento leadgen / resultados leadgen` | VALIDATED | TRÁFEGO JULHO |
| `marketing.cpl.total.current` | Custo total por lead | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.cpl.total.previous` | Custo total por lead no periodo anterior | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.first_consultation.revenue.current` | Faturamento de primeira consulta | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.first_consultation.revenue.previous` | Faturamento de primeira consulta no periodo anterior | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.first_patient.treatments.current` | Tratamentos fechados de primeiros pacientes | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.first_patient.treatments.previous` | Tratamentos fechados de primeiros pacientes no periodo anterior | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.forms.valid.current` | Formularios validos | quantidade | `—` | VALIDATED | MARKETING JULHO |
| `marketing.forms.valid.previous` | Formularios validos no periodo anterior | quantidade | `—` | VALIDATED | MARKETING JULHO |
| `marketing.investment.google.current` | Investimento Google | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.investment.google.previous` | Investimento Google no periodo anterior | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.investment.leadgen.current` | Investimento Meta em campanhas de leadgen | moeda (BRL) | `soma do investimento das campanhas de leadgen` | VALIDATED | TRÁFEGO JULHO |
| `marketing.investment.meta.current` | Investimento Meta | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.investment.meta.previous` | Investimento Meta no periodo anterior | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.investment.total.current` | Investimento total | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.investment.total.previous` | Investimento total no periodo anterior | moeda (BRL) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.leads.meta.current` | Leads Meta | quantidade | `—` | VALIDATED | MARKETING JULHO |
| `marketing.leads.meta.previous` | Leads Meta no periodo anterior | quantidade | `—` | VALIDATED | MARKETING JULHO |
| `marketing.loss.click_to_form.current` | Perda entre clique e formulario valido | quantidade | `cliques no link - formularios validos` | VALIDATED | MARKETING JULHO |
| `marketing.loss.form_to_mql.current` | Perda entre formulario valido e MQL | quantidade | `formularios validos - MQL confirmados` | VALIDATED | MARKETING JULHO |
| `marketing.loss.mql_to_appointment.current` | Perda entre MQL e agendamento de marketing | quantidade | `MQL confirmados - agendamentos de marketing` | VALIDATED | MARKETING JULHO |
| `marketing.mql.current` | MQL confirmados | quantidade | `—` | VALIDATED | MARKETING JULHO |
| `marketing.mql.previous` | MQL confirmados no periodo anterior | quantidade | `—` | VALIDATED | MARKETING JULHO |
| `marketing.mql_to_appointment_rate.current` | Conversao de MQL em agendamento de marketing | percentual | `agendamentos de marketing / MQL confirmados` | VALIDATED | MARKETING JULHO |
| `marketing.rate.mql.current` | Taxa MQL | percentual | `—` | VALIDATED | MARKETING JULHO |
| `marketing.rate.mql.previous` | Taxa MQL no periodo anterior | percentual | `—` | VALIDATED | MARKETING JULHO |
| `marketing.roi.consultation.current` | ROI de consultas | multiplo (x) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.roi.consultation.previous` | ROI de consultas no periodo anterior | multiplo (x) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.roi.treatments.current` | ROI de tratamentos de primeiros pacientes | multiplo (x) | `—` | VALIDATED | MARKETING JULHO |
| `marketing.roi.treatments.previous` | ROI de tratamentos de primeiros pacientes no periodo anterior | multiplo (x) | `—` | VALIDATED | MARKETING JULHO |
| `organic.doctor.bio_click_rate.current` | Taxa de clique por visita | percentual | `cliques na bio / visitas ao perfil` | VALIDATED | ORGÂNICO JULHO |
| `organic.doctor.bio_click_rate.previous` | Taxa de clique por visita no periodo anterior | percentual | `cliques na bio / visitas ao perfil` | VALIDATED | ORGÂNICO |
| `organic.doctor.bio_clicks.current` | Cliques na bio Dr. Luciano | quantidade | `—` | VALIDATED | ORGÂNICO JULHO |
| `organic.doctor.bio_clicks.previous` | Cliques na bio Dr. Luciano no periodo anterior | quantidade | `—` | VALIDATED | ORGÂNICO |
| `organic.doctor.interaction_rate.current` | Taxa de interacao por alcance | percentual | `interacoes / alcance` | VALIDATED | ORGÂNICO JULHO |
| `organic.doctor.interaction_rate.previous` | Taxa de interacao por alcance no periodo anterior | percentual | `interacoes / alcance` | VALIDATED | ORGÂNICO |
| `organic.doctor.interactions.current` | Interacoes Dr. Luciano | quantidade | `—` | VALIDATED | ORGÂNICO JULHO |
| `organic.doctor.interactions.previous` | Interacoes Dr. Luciano no periodo anterior | quantidade | `—` | VALIDATED | ORGÂNICO |
| `organic.doctor.profile_visits.current` | Visitas ao perfil Dr. Luciano | quantidade | `—` | VALIDATED | ORGÂNICO JULHO |
| `organic.doctor.profile_visits.previous` | Visitas ao perfil Dr. Luciano no periodo anterior | quantidade | `—` | VALIDATED | ORGÂNICO |
| `organic.doctor.reach.current` | Alcance Dr. Luciano | quantidade | `—` | VALIDATED | ORGÂNICO JULHO |
| `organic.doctor.reach.previous` | Alcance Dr. Luciano no periodo anterior | quantidade | `—` | VALIDATED | ORGÂNICO |
| `organic.doctor.reach_click_rate.current` | Taxa de clique por alcance | percentual | `cliques na bio / alcance` | VALIDATED | ORGÂNICO JULHO |
| `organic.doctor.views.current` | Visualizacoes Dr. Luciano | quantidade | `—` | VALIDATED | ORGÂNICO JULHO |
| `organic.doctor.views.previous` | Visualizacoes Dr. Luciano no periodo anterior | quantidade | `—` | VALIDATED | ORGÂNICO |
| `organic.doctor.visit_rate.current` | Taxa de visita por alcance | percentual | `visitas ao perfil / alcance` | VALIDATED | ORGÂNICO JULHO |
| `organic.doctor.visit_rate.previous` | Taxa de visita por alcance no periodo anterior | percentual | `visitas ao perfil / alcance` | VALIDATED | ORGÂNICO |
| `organic.natua.bio_click_rate.current` | Taxa de clique por visita | percentual | `cliques na bio / visitas ao perfil` | VALIDATED | ORGÂNICO JULHO |
| `organic.natua.bio_click_rate.previous` | Taxa de clique por visita no periodo anterior | percentual | `cliques na bio / visitas ao perfil` | VALIDATED | ORGÂNICO |
| `organic.natua.bio_clicks.current` | Cliques na bio Natua | quantidade | `—` | VALIDATED | ORGÂNICO JULHO |
| `organic.natua.bio_clicks.previous` | Cliques na bio Natua no periodo anterior | quantidade | `—` | VALIDATED | ORGÂNICO |
| `organic.natua.interaction_rate.current` | Taxa de interacao por alcance | percentual | `interacoes / alcance` | VALIDATED | ORGÂNICO JULHO |
| `organic.natua.interaction_rate.previous` | Taxa de interacao por alcance no periodo anterior | percentual | `interacoes / alcance` | VALIDATED | ORGÂNICO |
| `organic.natua.interactions.current` | Interacoes Natua | quantidade | `—` | VALIDATED | ORGÂNICO JULHO |
| `organic.natua.interactions.previous` | Interacoes Natua no periodo anterior | quantidade | `—` | VALIDATED | ORGÂNICO |
| `organic.natua.profile_visits.current` | Visitas ao perfil Natua | quantidade | `—` | VALIDATED | ORGÂNICO JULHO |
| `organic.natua.profile_visits.previous` | Visitas ao perfil Natua no periodo anterior | quantidade | `—` | VALIDATED | ORGÂNICO |
| `organic.natua.reach.current` | Alcance Natua | quantidade | `—` | VALIDATED | ORGÂNICO JULHO |
| `organic.natua.reach.previous` | Alcance Natua no periodo anterior | quantidade | `—` | VALIDATED | ORGÂNICO |
| `organic.natua.reach_click_rate.current` | Taxa de clique por alcance | percentual | `cliques na bio / alcance` | VALIDATED | ORGÂNICO JULHO |
| `organic.natua.views.current` | Visualizacoes Natua | quantidade | `—` | VALIDATED | ORGÂNICO JULHO |
| `organic.natua.views.previous` | Visualizacoes Natua no periodo anterior | quantidade | `—` | VALIDATED | ORGÂNICO |
| `organic.natua.visit_rate.current` | Taxa de visita por alcance | percentual | `visitas ao perfil / alcance` | VALIDATED | ORGÂNICO JULHO |
| `organic.natua.visit_rate.previous` | Taxa de visita por alcance no periodo anterior | percentual | `visitas ao perfil / alcance` | VALIDATED | ORGÂNICO |

## Fonte: Closer validada (`closer`) — 13 metricas

| ID | Rotulo | Unidade | Formula | Estado | Aba |
|---|---|---|---|---|---|
| `commercial.attended.current` | Atendimentos | quantidade | `—` | VALIDATED | abas por profissional |
| `commercial.close_rate.current` | Taxa de fechamento | percentual | `fechamentos / atendimentos` | VALIDATED | abas por profissional |
| `commercial.closed.current` | Fechamentos | quantidade | `—` | VALIDATED | abas por profissional |
| `commercial.consultation_revenue.current` | Receita de consultas | moeda (BRL) | `—` | VALIDATED | abas por profissional |
| `commercial.missing_status.current` | Atendimentos sem status | quantidade | `—` | WARNING | abas por profissional |
| `commercial.negotiating.current` | Em negociacao | quantidade | `—` | VALIDATED | abas por profissional |
| `commercial.not_closed.current` | Nao fechados | quantidade | `—` | VALIDATED | abas por profissional |
| `commercial.not_closed_total.current` | Atendimentos ainda nao fechados | quantidade | `atendimentos - fechamentos` | VALIDATED | abas por profissional |
| `commercial.pipeline.current` | Pipeline aberto | moeda (BRL) | `soma de NOVA PROPOSTA nas linhas NEGOCIACAO` | VALIDATED | abas por profissional |
| `commercial.revenue.current` | Receita comercial fechada | moeda (BRL) | `consultas realizadas + tratamentos com status FECHOU` | VALIDATED | abas por profissional |
| `commercial.ticket_attended.current` | Ticket por atendido | moeda (BRL) | `receita comercial / atendimentos` | VALIDATED | abas por profissional |
| `commercial.ticket_closed.current` | Ticket por fechado | moeda (BRL) | `receita comercial / fechamentos` | VALIDATED | abas por profissional |
| `commercial.treatment_revenue.current` | Tratamentos fechados | moeda (BRL) | `—` | VALIDATED | abas por profissional |

## Fonte: Agendamentos (`appointments`) — 10 metricas

| ID | Rotulo | Unidade | Formula | Estado | Aba |
|---|---|---|---|---|---|
| `appointments.confirmed.current` | Agendamentos confirmados | quantidade | `—` | SEM_BASE ⚠️ | Página1 |
| `appointments.missing_consultation_date.current` | Registros sem data de consulta | quantidade | `—` | VALIDATED | Página1 |
| `appointments.missing_owner.current` | Registros sem responsavel | quantidade | `—` | WARNING | Página1 |
| `appointments.no_show.current` | No-show | quantidade | `—` | SEM_BASE ⚠️ | Página1 |
| `appointments.origin.follow_up.current` | Origem Follow-up | quantidade | `—` | VALIDATED | Página1 |
| `appointments.origin.indicacao.current` | Origem Indicacao | quantidade | `—` | VALIDATED | Página1 |
| `appointments.origin.marketing.current` | Origem Marketing | quantidade | `—` | VALIDATED | Página1 |
| `appointments.origin.marketing_indicacao.current` | Origem Marketing / Indicacao | quantidade | `—` | VALIDATED | Página1 |
| `appointments.raw.current` | Agendamentos brutos | quantidade | `—` | VALIDATED | Página1 |
| `appointments.with_consultation_date.current` | Registros com data de consulta | quantidade | `—` | VALIDATED | Página1 |

## Fonte: Formulario/CRM (`form`) — 2 metricas

| ID | Rotulo | Unidade | Formula | Estado | Aba |
|---|---|---|---|---|---|
| `form.mql.current` | MQL na aba mensal | quantidade | `—` | SEM_BASE ⚠️ | FORM JULHO |
| `form.submissions.raw.current` | Submissoes brutas da aba mensal | quantidade | `—` | VALIDATED | FORM JULHO |

## Fonte: Financeiro (DRE + BASE) (`finance`) — 15 metricas

| ID | Rotulo | Unidade | Formula | Estado | Aba |
|---|---|---|---|---|---|
| `finance.cash_in.current` | Entradas de caixa | moeda (BRL) | `soma VALOR_FINAL onde TIPO = ENTRADA e MES_COMP = competencia` | VALIDATED | BASE |
| `finance.cash_out.current` | Saidas de caixa | moeda (BRL) | `valor absoluto da soma onde TIPO = SAIDA e MES_COMP = competencia` | VALIDATED | BASE |
| `finance.deductions.current` | Deducoes das receitas | moeda (BRL) | `—` | VALIDATED | REL DRE |
| `finance.deductions_rate.current` | Deducoes sobre vendas | percentual | `deducoes / vendas operacionais` | VALIDATED | REL DRE |
| `finance.due.current` | Titulos a vencer | moeda (BRL) | `soma absoluta de VALOR_FINAL onde Status = A VENCER` | VALIDATED | BASE |
| `finance.fixed_expenses.current` | Despesas fixas | moeda (BRL) | `—` | VALIDATED | REL DRE |
| `finance.fixed_expenses_rate.current` | Despesas fixas sobre vendas | percentual | `despesas fixas / vendas operacionais` | VALIDATED | REL DRE |
| `finance.gross_margin.current` | Margem bruta | percentual | `lucro bruto / vendas operacionais` | VALIDATED | REL DRE |
| `finance.gross_profit.current` | Lucro bruto | moeda (BRL) | `—` | VALIDATED | REL DRE |
| `finance.overdue.current` | Titulos vencidos | moeda (BRL) | `soma absoluta de VALOR_FINAL onde Status = VENCIDO` | VALIDATED | BASE |
| `finance.result.current` | Lucro bruto menos despesas fixas | moeda (BRL) | `lucro bruto + despesas fixas` | VALIDATED | REL DRE |
| `finance.result_margin.current` | Resultado gerencial sobre vendas | percentual | `resultado gerencial / vendas operacionais` | VALIDATED | REL DRE |
| `finance.sales.current` | Vendas operacionais | moeda (BRL) | `—` | VALIDATED | REL DRE |
| `finance.variable_cost.current` | Custo variavel | moeda (BRL) | `—` | VALIDATED | REL DRE |
| `finance.variable_cost_rate.current` | Custo variavel sobre vendas | percentual | `custo variavel / vendas operacionais` | VALIDATED | REL DRE |

---

## Metricas SEM_BASE — e por que continuam assim

Nenhuma destas pode ser preenchida por estimativa. Sem fonte auditavel, o valor e `null`.

| ID | Motivo declarado |
|---|---|
| `appointments.confirmed.current` | Nao ha status ou regra inequívoca de pagamento/confirmacao. |
| `appointments.no_show.current` | A base nao possui campo de presenca. |
| `form.mql.current` | A classificacao validada esta no consolidado de Marketing. |

---

Regras de calculo que governam esta tabela: `docs/contrato-de-dados.md`.
Cobertura contra os indicadores pedidos pelos setores: `docs/cobertura-indicadores.md`.
