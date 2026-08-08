# MQL automático por cargo

A Meta conta **lead** (submissão), não **MQL**. Até 2026-08-07 o MQL era
classificado à mão nas abas `BASE MQL`. Agora um classificador aplica a régua do
guardrail a cada lead — o MQL sai sozinho toda semana, com o mesmo critério.

Código: `src/data-pipeline/mql-classifier.ts`. Régua-fonte:
`03-PROJETOS/03.1-NATUA/5-Natua-Trafego-Pago/arquivos/02-METRICAS-MQL-CAC-ROI-GUARDRAILS.md`.

## A régua

MQL é definido por **cargo / profissão / poder aquisitivo provável / autonomia de
decisão** — nunca por dor ou urgência. As regras, na ordem:

1. cargo vazio ou lixo (`.`, `sim`, `0`) → **NÃO MQL** (sem sinal);
2. sinal forte de MQL presente → **MQL**, mesmo com termo operacional junto
   (`médica aposentada` é MQL: a profissão ganha da situação);
3. termo operacional presente → **NÃO MQL**;
4. nenhum match → **NÃO MQL**. "Na dúvida, NÃO MQL" é regra do guardrail.

**MQL:** empresário, dono, sócio, proprietário, diretor, executivo, presidente,
gerente, gestor, CEO/CFO/COO, médico, dentista, advogado, engenheiro, arquiteto,
veterinário, juiz, investidor, coronel, comandante, "dona de empresa",
"profissional liberal".

**NÃO MQL:** do lar, dona de casa, aposentado, professor, secretária, atendente,
auxiliar, diarista, doméstica, cozinheira, motorista, vendedor, técnico,
enfermeiro, recepcionista, estudante, desempregado, e operacional em geral.

## Validação contra a auditoria humana

Rodado contra a base de julho, comparado com o MQL auditado do CRM:

| | MQL | Taxa |
|---|---:|---:|
| CRM auditado (humano) | 175 | 12,59% |
| Automático (guardrail) | **184** | 12,7% |
| Automático (estrito) | 176 | 12,1% |

O automático fica **dentro de 5%** da auditoria humana; a variante estrita, a
0,6%. Duas classificações independentes concordando validam a régua.

## O bug que o teste de sabotagem pegou

A primeira versão casava por substring cru: `coo` casava **coordenador**, `socia`
casava **assistente social** — falsos positivos que inflavam o MQL. O match
passou a ser **por palavra** (prefixo de token ou palavra inteira para os curtos).
`tests/mql-classifier.test.ts` trava essa classe com sabotagens explícitas.

## Régua estrita vs padrão — a decisão aberta

Há um conflito conhecido: o guardrail inclui médico/engenheiro como MQL; a memória
`mql-natua-regua-estrita` diz que a régua final os excluiu. O padrão segue o
guardrail; `STRICT_EXCLUSIONS` documenta o que a estrita removeria.

**Para trocar de régua, é só passar `{ strict: true }`** — nenhuma outra mudança.
Se o Dr. confirmar que médico/engenheiro ficam fora, viramos o padrão para estrito.

## Onde aparece

- `form.mql_auto.current` — MQL automático da competência do painel;
- `form.current_month.mql_auto.current` — MQL do mês corrente (agosto), o número
  que o CRM ainda não auditou;
- `breakdowns["form.mql_by_role"]` — quais cargos viraram MQL, para auditoria;
- faixa do mês corrente: **MQL, taxa e custo por MQL ao vivo** — a Meta dá o
  investimento, o classificador dá o MQL, e o custo por MQL sai no mesmo dia.

## Limite honesto

O classificador lê `job_title`, texto livre que o próprio lead digita. Cargo em
branco ou vago (`autônomo`, `funcionário público` sem nível) cai em NÃO MQL por
conservadorismo. Isso subconta levemente — é o preço de "na dúvida, NÃO MQL". A
auditoria humana continua sendo o padrão-ouro; o automático é o que roda toda
semana sem esperar ninguém.
