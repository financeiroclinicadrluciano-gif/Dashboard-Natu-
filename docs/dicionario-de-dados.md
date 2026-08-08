# Dicionario de dados

O que cada fonte entrega, como ela e reconhecida e o que o sistema faz com cada campo.
Complementa `docs/dicionario-de-metricas.md`, que descreve os numeros calculados.

## Como uma fonte e reconhecida

**O nome do arquivo nao e contrato.** A classificacao usa assinatura de abas e de
cabecalhos (`src/data-pipeline/workbooks.ts:detectWorkbookRole`). Renomear o
arquivo nao muda nada; mudar o nome de uma aba obrigatoria bloqueia a publicacao.

| Papel | Assinatura exigida |
|---|---|
| `marketing` | abas `MARKETING <mes>` + `TRAFEGO*` + `ORGANICO*` |
| `closer` | aba `DASHBOARD` + cabecalhos `JORNADA` e `FECHOU/NAO FECHOU/NEGOCIACAO` |
| `appointments` | cabecalhos `ORIGEM` + `AGENDAMENTO` + `CONSULTA` + `PROFISS*` |
| `form` | cabecalhos `CREATED_TIME` + `LEAD_STATUS` + (`PHONE_NUMBER` ou `TELEFONE`) |
| `finance` | abas `REL DRE` + `BASE` + cabecalho `DEMONSTRATIVO DE RESULTADO` |
| `weekly` *(opcional)* | cabecalhos `NOME` + `PROFISSIONAL` + `VALOR` + (`PACOTE MED` ou `PACOTE INJET`) |

Arquivo que nao casa com nenhuma assinatura gera `UNRECOGNIZED_WORKBOOK` e
**bloqueia a importacao inteira**. Dois arquivos com o mesmo papel geram
`DUPLICATE_SOURCE` e tambem bloqueiam: o sistema nao escolhe qual e o certo.

## Normalizacao aplicada a todo campo

| Transformacao | Onde | Por que |
|---|---|---|
| Acentos removidos, caixa alta, espacos colapsados | `normalizeText` | `TRÁFEGO JULHO` e `trafego julho ` sao a mesma aba |
| `R$`, separador de milhar e virgula decimal | `finiteNumber` | `R$ 1.234,56` vira `1234.56` |
| Datas seriais do Excel | `cellDates: true` na leitura | serial `45870` nao pode virar o numero 45870 |
| Valor original preservado | adaptadores | normalizar sem guardar o bruto impede auditoria |

## Campos por fonte

### `marketing`
Investimento (total, Meta, Google, leadgen), leads Meta, cliques no link,
formularios validos, MQL, agendamentos de marketing, receita de primeira consulta,
tratamentos de primeiros pacientes, metricas por campanha/conjunto/anuncio,
e o organico dos dois perfis (visualizacoes, alcance, interacoes, visitas, cliques na bio).

**Regra critica:** `% MQL` dos rankings usa a base CRM atribuida ao item, **nunca**
`MQL / Resultados Meta`. Recalcular pelo Meta muda o denominador e o numero perde o sentido.

### `closer`
Uma aba por profissional + aba `DASHBOARD`. Linha elegivel exige paciente
preenchido e jornada no formato `\d+A`. Status normalizado: `FECHOU`,
`NAO FECHOU`, `NEGOCIACAO`. Linha sem status **permanece no denominador de
atendidos** e gera `CLOSER_STATUS_MISSING` — some-la do denominador inflaria a taxa
de fechamento.

**Regra critica:** receita comercial vem da Closer. Movimentacoes do Support **nao
sao** sinonimo de receita comercial — o Support pode conter pagamento de negociacao
de mes anterior.

### `appointments`
Origem, profissional, data de criacao, data da consulta, modalidade. Origens
normalizadas para Marketing / Indicacao / Follow-up / Outros, com o valor original
preservado e **nao publicado**.

**Regra critica:** comparecimento **nao e inferido**. Sem evidencia de status ou
conciliacao com outra base, `appointments.confirmed` e `appointments.no_show`
ficam `SEM_BASE`.

### `form`
Submissoes do formulario com classificacao de lead. A aba mensal nao carrega a
classificacao MQL final; o consolidado auditado e quem manda (`FORM_MQL_CLASSIFICATION_EXTERNAL`).

### `finance`
`REL DRE` para o demonstrativo, `BASE` para o fluxo de caixa linha a linha
(plano de contas, centro de custo, competencia, status quitado/vencido/a vencer).

**Regra critica:** a competencia sai da propria planilha. Mes ausente **nao e
projetado**. Competencia mais antiga que o painel gera `FINANCE_PERIOD_STALE`.

### `weekly` (opcional)
Aba unica com dois blocos: detalhe de pacientes e, abaixo, totais por profissional.
Ver `docs/contrato-de-dados.md` para o detector de fim-de-bloco, a taxonomia de canal
e as 13 baterias de reconciliacao.

## O que nunca sai da camada de ingestao

Nome de paciente, telefone, e-mail, documento e canal em texto livre existem
dentro dos adaptadores e **nao entram no snapshot**. O snapshot publica agregados.
Dois gates independentes cobrem isso: `containsPii` na geracao e
`scripts/check-forbidden-files.sh` no commit.

## Deduplicacao

Chaves conservadoras, nunca exclusao silenciosa:

| Entidade | Chave |
|---|---|
| Lead | ID do lead; na ausencia, telefone normalizado + data/hora da submissao |
| Agendamento | telefone ou nome normalizado + data da consulta + profissional |
| Fechamento | paciente normalizado + jornada + profissional + valor + periodo |
| Financeiro | identificador nativo; na ausencia, data + valor + conta + fornecedor + historico |

**Status:** as chaves estao documentadas e os adaptadores ja reconciliam contra os
totais da propria planilha. A **fila de revisao com comparacao lado a lado**
(brief §4.1) ainda **NAO EXECUTADO** — hoje um duplicado suspeito vira issue no
snapshot, nao um item de triagem na interface.
