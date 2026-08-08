# Mapa de Cobertura — 6 setores × 82 indicadores

> Estado: `VERIFICADO_TECNICAMENTE` para as colunas "já existe" e "planilha semanal"
> (cruzadas contra `public/data/dashboard-snapshot.json`, 116 métricas, e contra a
> reconciliação de `Pasta1_Tabela2_Ajustada.xlsx` em 2026-08-07 — 13/13 baterias delta 0,00).
> `PENDENTE` para tudo que depende de fonte ainda não conectada.
>
> Regra que governa este arquivo: métrica sem fonte auditável **permanece `SEM_BASE`**.
> Nenhum agente estima número para preencher tela (`docs/contrato-de-dados.md`, seção Gates críticos).

## Legenda

| Marca | Significado |
|---|---|
| ✅ | Já existe no snapshot hoje, com proveniência |
| 🟡 | Destravável — a fonte existe, falta adaptador |
| 🔴 | `SEM_BASE` — não existe fonte hoje; precisa de captura nova |

---

## 1. SDR — Pré-vendas

| Indicador | Status | Fonte / bloqueio |
|---|---|---|
| Quantidade total de leads | ✅ | `marketing.leads.meta.current` |
| Leads por canal de origem | 🟡 | Só Meta hoje. Orgânico/indicação/bio existem na planilha do Closer, sem taxonomia unificada |
| Tempo médio de resposta aos leads | 🔴 | Nenhuma fonte grava `timestamp_lead` × `timestamp_1a_resposta`. Só o n8n do SDR tem isso |
| Total de agendamentos | ✅ | `appointments.raw.current` |
| Agendamentos por canal | ✅ | `appointments.origins` (4 origens) |
| Taxa lead → agendamento | ✅ | `marketing.mql_to_appointment_rate.current` |
| Taxa lead respondido → agendamento | 🔴 | Depende de "lead respondido", que ninguém grava |

**Destrave mais barato do setor:** o SDR em produção (V8.1, n8n) já carimba hora de
entrada e hora de resposta em cada conversa. Exportar esse log fecha os dois 🔴 de uma vez.

---

## 2. CLOSER — Comercial e fechamento

| Indicador | Status | Fonte / bloqueio |
|---|---|---|
| Total de atendimentos no mês | ✅ | `commercial.attended.current` |
| Atendimentos por canal de origem | ✅ | `weekly.channels` — taxonomia de 6 canais (fase 1) |
| Consultas realizadas | ✅ | `commercial.attended.current` |
| Taxa de comparecimento | ✅ | `weekly.attendance_rate.current` (fase 1) |
| Taxa de não comparecimento | ✅ | `weekly.no_show_rate.current` (fase 1) |
| Faturamento das primeiras consultas | ✅ | `marketing.first_consultation.revenue.current` |
| Faturamento por canal de aquisição | ✅ | `weekly.channels[].revenue` (fase 1) |
| Faturamento por profissional | ✅ | `weekly.professionals[].revenue` (fase 1) |
| Participação % de cada profissional | ✅ | `weekly.professionals[].share` — soma 100% sob teste (fase 1) |
| Ticket médio geral | ✅ | `commercial.ticket_attended` / `commercial.ticket_closed` |
| Ticket médio por canal | ✅ | `weekly.channels[].ticket` (fase 1) |
| Valor total investido por paciente | 🟡 | Existe na coluna `VALOR`, mas é linha de paciente: não pode ser publicado no snapshot (PII). Precisa de faixa/decil, não de valor individual |
| Valor total em negociação | ✅ | `commercial.pipeline.current` |
| Valor potencial perdido | 🟡 | Precisa das linhas `NÃO FECHOU` **com valor de proposta** — a planilha semanal só traz `Atendido` |
| Pacotes vendidos por categoria | ✅ | `weekly.category.<cat>.units` — 6 categorias (fase 1) |
| Taxa de adesão por categoria | ✅ | `weekly.category.<cat>.adoption_rate` (fase 1) |
| Faturamento por categoria de serviço | ✅ | `weekly.category.<cat>.revenue` — 5 de 6; Ginecológicos `SEM_BASE` por falta de coluna `$` na planilha |

**Categorias confirmadas na planilha:** Pacote Médico · Pacote Nutricional · Pacote Treino ·
Implantes · Pacote Injetáveis/Soroterapia · **Ginecológicos** (esta 6ª não estava na sua lista).

---

## 3. CS/CX — Jornada e experiência

| Indicador | Status | Fonte / bloqueio |
|---|---|---|
| Pacientes por etapa da jornada | ✅ | `breakdowns.commercial.journeys` (8 etapas) |
| Consultas por número da consulta | 🔴 | Nenhuma fonte grava "1ª/2ª/3ª consulta" por paciente |
| Evolução mensal de consultas | ✅ | `breakdowns.marketing.history` (5 meses) |
| Faturamento por número da consulta | 🔴 | Mesmo bloqueio |
| Faturamento por etapa da jornada | 🟡 | `journeys` existe; falta somar receita por etapa |
| Evolução mensal do faturamento por etapa | 🔴 | Precisa de série histórica por etapa, que não é guardada |
| Ticket médio por número da consulta | 🔴 | Mesmo bloqueio |
| Ticket médio por etapa da jornada | 🟡 | Derivável de `journeys` + receita |
| Evolução mensal do ticket por etapa | 🔴 | Mesmo bloqueio da série histórica |

**Causa raiz dos 5 🔴:** o snapshot é substituído a cada publicação. Não há tabela de
histórico por etapa. Isso é uma decisão de arquitetura, não um adaptador faltando.

---

## 4. MARKETING — Aquisição

| Indicador | Status | Fonte / bloqueio |
|---|---|---|
| CPL | ✅ | `marketing.cpl.total.current` + `cpl.leadgen` |
| CAC | ✅ | `marketing.cac.appointment.current` |
| ROAS / ROI de campanha | ✅ | `marketing.roi.consultation` + `roi.treatments` |
| Leads por canal | 🟡 | A semanal dá **pacientes** por canal, não leads. Lead por canal exige o CRM, não a planilha do Closer |
| Agendamentos por canal | ✅ | `appointments.origins` |
| Pacientes adquiridos por canal | ✅ | `weekly.acquisition.attended.current` + `weekly.channels` (fase 1) |
| Faturamento por canal de aquisição | ✅ | `weekly.acquisition.revenue.current` (fase 1) |

---

## 5. FINANCEIRO

| Indicador | Status | Fonte / bloqueio |
|---|---|---|
| Investimento Instagram / tráfego pago | ✅ | `marketing.investment.meta.current` |
| Investimento Google | ✅ | `marketing.investment.google.current` |
| Investimento outros canais | 🟡 | Existe `investment.total` e `investment.leadgen`; "outros" não é campo próprio |
| Custo total de marketing | ✅ | `marketing.investment.total.current` |
| Custo total do setor comercial | 🔴 | O DRE traz `fixed_expenses` agregado, sem rateio por setor |
| Custo total marketing + comercial | 🔴 | Bloqueado pelo anterior |
| Faturamento total acumulado | ✅ | `finance.sales.current` |
| ROI total | 🟡 | Existe ROI de marketing; ROI **total** exige o custo comercial acima |

---

## 6. FILMMAKER — Produção audiovisual

| Indicador | Status |
|---|---|
| Gravações realizadas · materiais para editar · editados · conteúdos gravados · fotografias · dias de gravação | 🔴 |
| Postagens Instagram · TikTok · YouTube Shorts · YouTube | 🔴 |
| Stories Dr. Luciano · Natuá · AlphaMed | 🔴 |
| Consolidados do mês (4 totais) | 🔴 |
| Intercorrências · solicitante · mudanças de estratégia | 🔴 |

**Setor inteiro descoberto — 0 de 18 indicadores têm fonte.** O snapshot tem alcance
orgânico (`organic.doctor.*`, `organic.natua.*`), que é *resultado* da publicação, nunca
*volume de produção*. Isto não é um adaptador faltando: não existe planilha de produção
audiovisual sendo preenchida. É o gap mais barato de fechar e o único setor sem nenhum dado.

---

## Placar

| Setor | ✅ | 🟡 | 🔴 | Total | Δ fase 1 |
|---|---:|---:|---:|---:|---|
| SDR | 4 | 1 | 2 | 7 | — |
| Closer | 15 | 2 | 0 | 17 | **+10** |
| CS/CX | 2 | 2 | 5 | 9 | — |
| Marketing | 6 | 1 | 0 | 7 | **+2** |
| Financeiro | 5 | 2 | 2 | 9 | — |
| Filmmaker | 0 | 0 | 18 | 18 | — |
| **Total** | **32** | **8** | **27** | **67** | **+12** |

A fase 1 (2026-08-07) moveu 12 indicadores de 🟡 para ✅ — 10 do Closer e 2 do
Marketing — ao ligar a planilha semanal como fonte `weekly`. Prova: `npm test`,
31/31, com 4 baterias de sabotagem que reprovam leitura ingênua.

67 linhas verificáveis a partir dos 82 itens da lista (alguns itens da lista são o mesmo
número em recortes diferentes e foram fundidos).

---

## Bloqueios estruturais

### Bloqueio 1 — a taxonomia de canal não existe · **RESOLVIDO na fase 1**

> Fechada em `src/data-pipeline/channels.ts`: 6 valores canônicos, campanha como
> campo separado, canal desconhecido gera `WEEKLY_CHANNEL_UNMAPPED` e sai dos
> recortes — **nunca vira bucket "outros"**. O diagnóstico abaixo fica como
> registro do que motivou a correção.


A coluna da planilha semanal rotulada `PRESENÇA` **não contém presença: contém canal de
origem**, em texto livre. Nas 23 linhas de 2026-08 apareceram **11 grafias para ~5 canais reais**:

| Grafia na planilha | Canal real |
|---|---|
| `formulario`, `formulario - mounjaro`, `formulario - trat obesidade` | Formulário (mesma origem, campanhas diferentes) |
| `organico`, `organico perfil natua` | Orgânico |
| `indicação`, `indicação dra vivian` | Indicação |
| `link da bio` | Bio |
| `campanha mkt`, `depoimento - mkt` | Tráfego pago |
| `paciente antigo` | Recorrência (não é aquisição) |

Sem taxonomia fechada, **todo indicador "por canal" — 8 dos 20 🟡 — produz número errado
com aparência de certo.** É a correção mais barata e a de maior alcance do mapa inteiro.

### Bloqueio 2 — a planilha tem dois blocos na mesma aba · **RESOLVIDO na fase 1**

> Detector em `adapters/weekly.ts:detectBlockEnd`. Contra o arquivo real: 23
> registros lidos de 964 linhas. Duas baterias de sabotagem provam que ele para
> mesmo sem linha em branco separando os blocos, e que uma linha `TOTAL` no meio
> do detalhe encerra o bloco em vez de virar paciente.


- `L2:L24` — detalhe, 23 pacientes.
- `L25:L27` — vazias.
- `L28:L38` — tabela pivô por profissional, com linhas de valor e de `%` alternadas.

Um importador que leia "a aba inteira" ingere `TOTAL GERAL`, `%` e `TOTAL AGEND.` como se
fossem pacientes. O efeito seria 34 atendimentos em vez de 23 e taxas somadas a valores
absolutos. **O detector de fim-de-bloco é gate de publicação, não conveniência.**

### Bloqueio 3 — sem série histórica por etapa

Ver §3. Enquanto o snapshot for substituído a cada publicação, todo indicador de
"evolução mensal por etapa/consulta" fica 🔴 por arquitetura.

---

## Reconciliação executada — 2026-08-07

Bloco detalhe (`L2:L24`) somado contra bloco pivô (`L29`), 13 baterias:

| Métrica | Detalhe | Pivô | Delta |
|---|---:|---:|---:|
| Atendimentos | 23 | 23 | 0,00 |
| Valor total | 121.523,33 | 121.523,33 | 0,00 |
| Pacote Médico | 9 | 9 | 0,00 |
| Pacote Nutri | 6 | 6 | 0,00 |
| Pacote Treino | 1 | 1 | 0,00 |
| Implante | 1 | 1 | 0,00 |
| Pacote Injetável | 11 | 11 | 0,00 |
| Ginecológicos | 1 | 1 | 0,00 |
| $ Médico | 11.950,00 | 11.950,00 | 0,00 |
| $ Nutri | 4.900,00 | 4.900,00 | 0,00 |
| $ Treino | 4.000,00 | 4.000,00 | 0,00 |
| $ Implante | 5.309,33 | 5.309,33 | 0,00 |
| $ Injetável | 83.064,81 | 83.064,81 | 0,00 |

Por profissional, 4/4 batendo em contagem e receita (Luciano 8 / 50.810,55 · Vivian 8 /
30.660,89 · Luca 4 / 34.524,79 · Gislaine 3 / 5.527,10).

**Conclusão:** a fonte é confiável; o risco está na *leitura* dela, não no preenchimento.
Por isso a reconciliação detalhe × pivô vira bateria permanente do gate — ela prova, a cada
semana, que o importador leu o bloco certo.

---

Contrato que governa este mapa: `03-PROJETOS/03.1-NATUA/Dashboard-Codebase-GitHub/docs/contrato-de-dados.md`.
Frente do vault que consome: [[03-PROJETOS/03.1-NATUA/6-Natua-Dashboard-Reunioes-Semanais/README|Dashboard de Reuniões Semanais]].
