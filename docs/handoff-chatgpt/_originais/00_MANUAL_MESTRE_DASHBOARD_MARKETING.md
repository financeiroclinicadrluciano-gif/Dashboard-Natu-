# MANUAL MESTRE — DASHBOARD MARKETING

## 1. Finalidade

Este documento é a fonte permanente de regras do Dashboard Marketing da Natuá MedSpa e do Dr. Luciano. Ele deve ser atualizado quando uma definição, fórmula, fonte ou processo for corrigido. Números de um mês específico não devem substituir estas regras; devem ficar em um fechamento datado.

## 2. Princípios de governança

1. Uma métrica deve ter definição, fórmula, período, fonte e responsável.
2. O arquivo mais recente aprovado é a base de edição.
3. O arquivo original nunca é sobrescrito.
4. Divergências são expostas, não ocultadas.
5. Campos ausentes não viram zero.
6. Toda alteração precisa entrar no log.
7. O dashboard deve ser reprodutível: outra pessoa precisa conseguir chegar ao mesmo número usando os mesmos arquivos.

## 3. Matriz de fontes

| Área | Fonte principal | Fonte complementar | Não fazer |
|---|---|---|---|
| Investimento e campanhas | Meta Ads Manager / Google Ads | Exportações por campanha, conjunto e anúncio | Usar CRM para investimento |
| Cliques e formulários abertos | Meta Ads Manager | — | Estimar por leads |
| Leads enviados | Meta Ads + formulários/CRM | Planilha comercial | Misturar lead de link da bio com formulário sem origem |
| MQL | Formulários/CRM auditados | Validação comercial | Classificar pela primeira resposta |
| Agendamento/comparecimento | Base comercial oficial | CRM | Usar somente Meta |
| Receita/tratamento | Closer/Support Clinic | Confirmação manual | Misturar negociação, contrato e caixa |
| Instagram consolidado | Aplicativo do Instagram | Business Suite | Somar alcance diário como alcance único |
| Conteúdos e Stories | Business Suite | Aplicativo do Instagram | Contar linhas duplicadas |

## 4. Dicionário de métricas e fórmulas

### Mídia paga

- **Investimento total** = Meta total + Google.
- **Investimento Meta leadgen** = somente campanhas que geram leads.
- **CPL Meta leadgen** = investimento Meta leadgen ÷ leads Meta leadgen.
- **Custo total por lead Meta** = investimento total pago ÷ leads Meta.
- **CAC por agendamento** = investimento total de marketing ÷ agendamentos de marketing realizados no período.

O denominador do CAC precisa ser reconciliado. Agendamento, comparecimento e atendimento são conceitos diferentes.

### MQL

Classificação conservadora:
- **MQL confirmado:** evidência forte de autonomia, decisão ou poder aquisitivo provável.
- **MQL potencial:** perfil promissor, mas renda/autonomia não confirmadas.
- **Não MQL:** sem evidência suficiente, resposta inválida ou perfil incompatível.

Exemplos geralmente confirmados: empresários, proprietários, sócios, advogados, arquitetos, engenheiros, médicos, dentistas, contadores, diretores, gerentes, executivos e corretores.

Regras técnicas:
- remover testes;
- normalizar telefone;
- deduplicar por telefone, depois e-mail, depois nome;
- contar separadamente submissões e pessoas;
- registrar casos ambíguos para revisão.

Fórmulas:
- **Taxa MQL por submissão** = MQLs confirmados ÷ submissões válidas.
- **Taxa MQL por pessoa** = pessoas únicas MQL ÷ pessoas únicas.
- **Custo por MQL** = investimento Meta leadgen ÷ MQLs confirmados por submissão.
- **Cobertura da auditoria** = formulários auditáveis ÷ leads Meta.

### Duplicidade

- **Pessoas repetidas** = quantidade de chaves de pessoa com 2 ou mais submissões.
- **Envios excedentes** = soma de `(submissões da pessoa − 1)` para pessoas repetidas.
- Uma pessoa com 3 preenchimentos conta como 1 pessoa repetida e 2 envios excedentes.

### Funil do formulário

- **Clique → abertura** = formulários abertos ÷ cliques.
- **Abertura → envio** = formulários enviados ÷ formulários abertos.
- **Clique → envio** = formulários enviados ÷ cliques.

Todos os números precisam ter o mesmo período, contas, campanhas e objetivo.

### Comercial e ROI

- **ROI de primeira consulta** = faturamento das consultas de primeira consulta ÷ investimento total de marketing.
- **ROI total de primeiros pacientes** = tratamentos fechados na primeira consulta ÷ investimento total de marketing.
- Exibir ambos em múltiplo “x”.
- Meta da consulta: 2x.
- Meta dos tratamentos: 8x.
- Não somar consulta e tratamento.
- Negociação não entra.
- Pacientes antigos/retornos não entram no ROI de aquisição.
- Receita contratual e caixa recebido permanecem separados.

### Orgânico

- **Visualizações, alcance, interações, seguidores líquidos, visitas e toques no link:** aplicativo do Instagram.
- **Posts, Stories e desempenho por conteúdo:** Business Suite.
- **Engajamento absoluto do conteúdo** = curtidas + comentários + compartilhamentos + salvamentos.
- Alcance diário acumulado não equivale a contas únicas alcançadas.
- Novos seguidores brutos não equivalem a crescimento líquido.

## 5. Rotina semanal

### Coleta
- Exportar Meta Ads com período exato.
- Incluir investimento, cliques, formulários abertos, leads, campanha, conjunto e anúncio.
- Exportar/obter formulários e CRM.
- Atualizar comercial/Closer/Support Clinic.
- Capturar Insights do Instagram e exportar Business Suite.

### Auditoria
- Conferir período e fuso.
- Contar linhas.
- Remover testes.
- Deduplicar IDs e pessoas.
- Verificar cobertura.
- Cruzar campanhas e origens.
- Sinalizar divergências.

### Atualização
- Abrir a última versão aprovada.
- Alterar apenas as células necessárias.
- Aplicar formato correto.
- Recalcular fórmulas.
- Conferir visualmente.
- Verificar erros de planilha.
- Salvar nova versão.

### Fechamento
Criar um registro com:
- período;
- arquivos usados;
- números principais;
- fórmulas;
- divergências;
- decisões;
- pendências;
- nome do arquivo entregue.

## 6. Regra para mudanças de metodologia

Toda mudança precisa registrar:

- data;
- problema identificado;
- regra anterior;
- nova regra;
- impacto nos números;
- responsável pela aprovação;
- primeira competência em que a regra passa a valer.

Nunca alterar uma fórmula histórica silenciosamente.

## 7. Critério de pronto

Uma atualização só está concluída quando:

- todas as fontes foram listadas;
- o período está correto;
- os denominadores foram validados;
- duplicidades foram tratadas;
- o layout foi preservado;
- não há erros de fórmula;
- os totais reconciliam ou a divergência está documentada;
- foi criada uma nova versão;
- o log foi atualizado.