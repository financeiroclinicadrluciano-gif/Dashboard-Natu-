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
- a analise cita numero ausente do snapshot.

Alertas nao criticos podem publicar com ressalva, por exemplo competencia financeira defasada ou linhas comerciais sem status.
