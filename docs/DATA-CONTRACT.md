# Contrato de Dados

## Fontes obrigatorias

| Papel | Conteudo esperado | Uso principal |
|---|---|---|
| Marketing | Abas `MARKETING`, `TRAFEGO` e `ORGANICO` por mes | midia, leads, MQL, campanhas e social |
| Closer | Uma aba por profissional e/ou dashboard consolidado | consultas, status, vendas e pipeline |
| Agendamentos | Origem, profissional, data e pagamento da consulta | volume e origem dos agendamentos |
| Formulario | Submissoes, campanha e classificacao de lead | auditoria de formularios e MQL |
| Financeiro | DRE, base e competencia | receita, custos, resultado e defasagem |

Os nomes dos arquivos nao sao contrato. O importador classifica cada arquivo por assinaturas de abas e cabecalhos.

## Fonte opcional

| Papel | Conteudo esperado | Uso principal |
|---|---|---|
| Semanal (`weekly`) | Aba unica: detalhe de pacientes e, abaixo, bloco de totais por profissional | comparecimento, categorias de pacote, receita por canal e por profissional |

As cinco fontes acima continuam obrigatorias. A semanal e opcional: sua ausencia
nao bloqueia a publicacao, mas sua presenca traz metricas que nenhuma outra
fonte fornece (comparecimento auditavel e vendas por categoria).

## Regras de metrica

### Marketing

- `investimento_total`: valor consolidado da aba de marketing para o periodo.
- `leads_meta`: total informado na mesma competencia.
- `formularios_validos`: total consolidado, reconciliado com a base de formulario.
- `mql`: classificacao confirmada pela base; na duvida, nao classificar como MQL.
- `taxa_mql = mql / formularios_validos`.
- `cpl = investimento_total / leads_meta`.
- `custo_mql = investimento_total / mql`.

### Comercial

- `consultas_realizadas`: linhas de atendimento elegiveis definidas pelo adaptador da Closer.
- `fechamentos`: status normalizado igual a `FECHOU`.
- `taxa_fechamento = fechamentos / consultas_realizadas`, conforme a formula da aba Dashboard da Closer.
- `receita_fechada`: soma do valor de tratamento nas linhas `FECHOU`.
- `receita_comercial`: soma das consultas realizadas mais tratamentos nas linhas `FECHOU`.
- `pipeline`: soma de valores nas linhas `NEGOCIACAO`.
- Linhas sem status permanecem no denominador de atendidos e geram alerta explicito.

### Agendamentos

- Um agendamento elegivel deve possuir o sinal operacional exigido pela fonte, incluindo pagamento quando esse for o criterio vigente.
- Origens sao normalizadas, mas o valor original nao e publicado.
- `CAC operacional = investimento / agendamentos de marketing`.

### Semanal

- `weekly.attended`: linhas do **bloco de detalhe**, delimitado pelo detector de
  fim-de-bloco. A planilha cola a tabela de totais na mesma aba; ler a aba
  inteira contaria `TOTAL GERAL`, `%` e o cabecalho do pivo como pacientes.
- `weekly.attendance_rate = comparecidos / (comparecidos + faltas)`, ambos lidos
  **do bloco de totais**. A coluna rotulada `PRESENCA` no detalhe guarda canal de
  origem, nao presenca — o rotulo mente e o adaptador nao acredita nele.
- `weekly.category.<cat>.units` e `.revenue`: seis categorias, incluindo
  **Ginecologicos**, confirmada como 6a em 2026-08-07.
- Categoria sem coluna de receita na planilha devolve `SEM_BASE`, nunca `0`.
  Zero seria um numero inventado com aparencia de medido.
- `weekly.acquisition.*`: exclui o canal `RECORRENCIA`. Contar recompra no
  denominador de aquisicao infla o resultado do marketing.

#### Taxonomia de canal — fechada em 6 valores

`FORMULARIO` · `TRAFEGO_PAGO` · `ORGANICO` · `BIO` · `INDICACAO` · `RECORRENCIA`

A planilha grava canal em texto livre. Em 2026-08 havia **11 grafias para 5
canais reais** (`organico` e `organico perfil natua`; `formulario`,
`formulario - mounjaro`, `formulario - trat obesidade`; `indicacao` e
`indicacao dra vivian`). Agregar texto livre produz numero errado com aparencia
de certo, entao o canal e normalizado antes de qualquer soma.

A campanha (`mounjaro`, `trat obesidade`, `depoimento`) e um campo separado, nao
um canal. Texto que nao casa com nenhuma regra devolve canal nulo e gera
`WEEKLY_CHANNEL_UNMAPPED`: o paciente permanece no total e sai dos recortes por
canal. **Nao existe bucket "outros"** — bucket generico esconde o erro em vez de
mostra-lo.

### Financeiro

- A competencia e extraida da propria planilha.
- Dados financeiros nunca sao projetados para preencher meses ausentes.
- Se a competencia for anterior a marketing/comercial, o snapshot recebe alerta de defasagem.

## Metricas sem base

Estas metricas permanecem `SEM_BASE` ate existir fonte e denominador auditaveis:

- comparecimento e no-show;
- ROI por origem do paciente;
- ticket medio por origem do paciente;
- ranking de objecoes sem taxonomia padronizada;
- faturamento por campanha sem cruzamento individual validado.

## Proveniencia

Toda metrica publica usa:

```json
{
  "value": 175,
  "status": "VALIDATED",
  "period": "2026-07",
  "source": "marketing",
  "sheet": "MARKETING JULHO",
  "metric": "mql",
  "formula": null
}
```

Metrica calculada inclui formula e dependencias. Metrica indisponivel usa `value: null`, `status: "SEM_BASE"` e uma justificativa.

## Gates criticos

A publicacao e bloqueada quando:

- falta uma das cinco fontes;
- o arquivo nao pode ser lido;
- uma aba/cabecalho obrigatorio desapareceu;
- uma metrica obrigatoria nao e numerica ou e negativa sem permissao;
- reconciliacao ultrapassa a tolerancia documentada;
- o snapshot contem chave ou valor com padrao de PII;
- o periodo principal nao pode ser determinado;
- uma formula usa denominador zero sem marcar `SEM_BASE`;
- a analise cita numero ausente do snapshot;
- **a planilha semanal nao fecha com o proprio bloco de totais** — 13 baterias
  comparam detalhe e pivo (atendimentos, faturamento, unidades e receita das
  categorias). Divergencia acima de R$ 0,01 e `WEEKLY_RECONCILIATION_FAILED`,
  severidade CRITICAL. Publicar numero que nao fecha com o proprio arquivo e
  pior do que nao publicar;
- a planilha semanal perde `NOME` ou `VALOR`, ou chega sem nenhuma linha de
  paciente.

### Regressao do fechamento aprovado

`tests/baselines/fechamento-2026-07.json` congela os 30 numeros do fechamento
`01-28/07`. Enquanto o painel estiver nesse periodo, os 30 tem que bater; passando
o periodo, continuam valendo os testes de existencia, unidade, proveniencia e
nao-regressao para `SEM_BASE`.

Numero que muda porque a fonte mudou exige **novo fechamento aprovado** e edicao
explicita do baseline. Editar o baseline para o teste passar inverte o proposito
do gate.

Alertas nao criticos podem publicar com ressalva, por exemplo competencia financeira defasada ou linhas comerciais sem status.
