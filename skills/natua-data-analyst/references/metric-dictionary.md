# Dicionario de Metricas

## Marketing

| Metrica | Formula | Observacao |
|---|---|---|
| Investimento | fonte consolidada | declarar Meta e Google separadamente quando existirem |
| CPL | investimento / leads | usar o mesmo periodo |
| Taxa MQL | MQL / formularios validos | nao usar leads de plataforma como denominador |
| Custo MQL | investimento / MQL | `SEM_BASE` se MQL for zero/ausente |
| CAC operacional | investimento / agendamentos de marketing | nao e CAC financeiro completo |

## Comercial

| Metrica | Formula | Observacao |
|---|---|---|
| Taxa de fechamento | fechamentos / consultas com status decisorio | linhas sem status ficam fora e geram alerta |
| Receita fechada | soma dos tratamentos `FECHOU` | nao e receita reconhecida no caixa |
| Ticket fechado | receita fechada / fechamentos | nao segmentar por origem sem chave de cruzamento |
| Pipeline | soma de `NEGOCIACAO` | potencial, nao receita |

## Funil

Uma passagem so e taxa de conversao se origem e destino usam:

- competencia compativel;
- populacao rastreavel;
- denominadores declarados.

Quando as bases nao permitem coorte individual, usar “indicador operacional entre etapas”, nao “conversao causal”.

## Financeiro

Receita, custos e resultado seguem a competencia da planilha financeira. Nao combinar com marketing atual para ROI sem reconciliacao temporal e atribuicao.

## Sem base

- no-show/comparecimento;
- ROI por origem;
- ticket por origem;
- ranking de objecoes;
- faturamento por campanha.

