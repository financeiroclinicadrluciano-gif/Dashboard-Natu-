# LOG DE DECISÕES E ATUALIZAÇÕES — DASHBOARD MARKETING

Este documento registra decisões aprovadas, mudanças de metodologia, correções de cálculo e impactos no Dashboard Marketing da Natuá MedSpa e do Dr. Luciano.

**Regra de uso:** nunca apagar registros anteriores. Cada nova correção deve ser adicionada ao final com data, regra anterior, regra nova, impacto, fontes e pendências.

---

## 2026-06-30 — Definição da planilha oficial vigente

**Período analisado:** Junho de 2026  
**Responsável pela aprovação:** Gustavo Amaral  
**Arquivo-base aprovado:** `Relatório Marketing 2026.xlsm` enviado manualmente por Gustavo  
**Arquivo final entregue:** `Relatório Marketing 2026.xlsx`

### Decisão aprovada
- A planilha enviada manualmente por Gustavo passa a ser a base oficial.
- Atualizações futuras devem começar exclusivamente pela versão mais recente aprovada.
- Layout, cores, estrutura, nomes das abas, dimensões e organização manual devem ser preservados.
- O arquivo original não deve ser sobrescrito; cada atualização deve gerar uma nova versão.

### Impacto
- Versões anteriores deixam de ser referência operacional.
- Alterações futuras devem ser feitas apenas nas células necessárias.

---

## 2026-06-30 — Separação entre agendamentos totais e agendamentos de marketing

**Período analisado:** Junho de 2026  
**Fontes:** planilha comercial, classificação de origem e confirmação manual

### Regra anterior
- Os números 19 e 23 apareciam sem distinção clara.
- O CAC chegou a ser calculado com denominador incorreto.

### Regra nova
- **Agendamentos totais:** 23
- **Agendamentos atribuídos ao marketing:** 19
- **Agendamentos por indicação:** 4
- **Comparecimentos:** 22
- **No-show:** 1
- **Ainda não atendidos no fechamento:** 0

### Fórmula aprovada
- **CAC por agendamento de marketing** = investimento total de marketing ÷ agendamentos de marketing
- `R$ 32.932,54 ÷ 19 = R$ 1.733,29`

### Impacto
- O CAC correto do marketing em junho passa a ser **R$ 1.733,29**.
- O total de 23 continua sendo usado para leitura operacional da agenda, mas não como denominador do CAC de aquisição.

---

## 2026-06-30 — Separação definitiva dos indicadores de ROI

**Período analisado:** Junho de 2026  
**Fonte:** valores manuais confirmados por Gustavo e base comercial

### Regra anterior
- Consulta e tratamento chegaram a ser somados em um mesmo indicador.
- O retorno foi interpretado como percentual em alguns momentos.

### Regra nova
- **ROI de primeira consulta** = faturamento das consultas de primeira consulta ÷ investimento total de marketing.
- **ROI total de primeiros pacientes** = tratamentos fechados na primeira consulta ÷ investimento total de marketing.
- Os dois indicadores são exibidos como múltiplos em **“x”**, não como porcentagem.
- Consultas e tratamentos não devem ser somados.
- Pacientes antigos, retornos e negociações não entram no ROI de aquisição.

### Valores confirmados
- Faturamento das consultas de primeira consulta: **R$ 16.550,00**
- Tratamentos fechados na primeira consulta: **R$ 44.866,92**
- Investimento total: **R$ 32.932,54**

### Resultados
- **ROI de primeira consulta:** `R$ 16.550,00 ÷ R$ 32.932,54 = 0,50x`
- **ROI total de primeiros pacientes:** `R$ 44.866,92 ÷ R$ 32.932,54 = 1,36x`

### Metas
- ROI de primeira consulta: **2x**
- ROI total de primeiros pacientes: **8x**

---

## 2026-06-30 — Separação de primeira consulta, pacientes antigos e negociação

**Período analisado:** Junho de 2026  
**Fonte:** base comercial e valores manuais confirmados

### Regra aprovada
- Primeira consulta, pacientes antigos/retornos e negociação devem permanecer separados.
- Negociação não é faturamento e não entra no ROI até o fechamento.
- Receita contratual não equivale necessariamente a caixa recebido.

### Valores confirmados
- Receita contratual fechada total: **R$ 235.175,60**
- Tratamentos fechados na primeira consulta: **R$ 44.866,92**
- Tratamentos de pacientes antigos/retornos: **R$ 190.308,68**
- Pipeline/negociação informado: **R$ 111.463,63**

### Negociação por profissional
- Dra. Gislaine: **R$ 90.482,76**
- Dr. Luciano: **R$ 11.801,77**
- Dr. Luca: **R$ 9.179,10**
- Dra. Vivian: **R$ 0,00**

### Tratamentos fechados na primeira consulta
- Dra. Gislaine: **R$ 44.866,92**
- Dr. Luciano: **R$ 0,00**
- Dr. Luca: **R$ 0,00**
- Dra. Vivian: **R$ 0,00**

---

## 2026-06-30 — Revisão completa da base de MQL

**Período analisado:** Junho de 2026  
**Fontes:** quatro arquivos de formulários/CRM, incluindo a base histórica `FORMULÁRIO MAIO+`

### Regra anterior
- 76 MQLs em 827 formulários válidos.
- Taxa MQL de 9,19%.
- Custo por MQL de R$ 380,25.

### Problema identificado
- A auditoria anterior não continha todos os arquivos de junho.
- A inclusão da base complementar revelou registros faltantes.

### Regra nova
- MQL deve ser classificado por profissão/cargo, autonomia, poder de decisão e poder aquisitivo provável.
- Responder ou demonstrar interesse não basta para ser MQL.
- Na dúvida, usar **MQL POTENCIAL**, sem contar como MQL confirmado.
- Testes devem ser removidos.
- O dashboard usa MQL por submissão válida; a visão comercial também deve mostrar pessoas únicas.

### Resultado auditado
- Leads Meta: **1.401**
- Formulários válidos auditáveis: **1.378**
- Cobertura: **98,36%**
- Registros ausentes em relação ao Meta: **23**
- MQLs confirmados por submissão: **197**
- Pessoas únicas MQL: **193**
- Taxa MQL por submissão: `197 ÷ 1.378 = 14,30%`
- Custo por MQL: `R$ 28.898,72 ÷ 197 = R$ 146,69`

### Impacto
- MQLs aumentaram de 76 para 197.
- A taxa MQL aumentou para 14,30%.
- O custo por MQL caiu para R$ 146,69.
- O resultado permanece condicionado à diferença de 23 leads sem registro auditável.

---

## 2026-06-30 — Critério operacional de MQL

### MQL confirmado
Perfil com evidência forte de autonomia, decisão ou poder aquisitivo provável, como:
- empresários, proprietários, sócios e empreendedores;
- advogados, arquitetos, engenheiros, médicos, dentistas e contadores;
- diretores, gerentes, gestores e executivos;
- profissionais liberais qualificados e corretores.

### MQL potencial
Perfil promissor, mas sem evidência suficiente para confirmação de renda, autonomia ou poder decisório.

### Não MQL
Resposta inválida, profissão não identificável ou ausência de evidência suficiente de capacidade e aderência comercial.

### Regra conservadora
- Na dúvida, não classificar como MQL confirmado.
- O comercial pode posteriormente promover um MQL potencial para confirmado com nova evidência.

---

## 2026-06-30 — Auditoria de duplicidade dos formulários

**Período analisado:** Junho de 2026  
**Chave principal:** telefone normalizado  
**Chaves secundárias:** e-mail e nome

### Resultado
- Submissões válidas: **1.378**
- Pessoas únicas: **1.323**
- Pessoas que preencheram mais de uma vez: **51**
- Envios duplicados/excedentes: **55**
- 47 pessoas preencheram duas vezes.
- 4 pessoas preencheram três vezes.

### Regra aprovada
- Uma pessoa com três preenchimentos conta como:
  - 1 pessoa repetida;
  - 2 envios excedentes.
- Submissões válidas, pessoas únicas, pessoas repetidas e envios excedentes devem ser reportados separadamente.

### Período 22–30/06
- Formulários enviados: **441**
- Pessoas únicas: **439**
- Pessoas que já tinham preenchido antes de 22/06: **28**
- Pessoas realmente novas no período: **411**

---

## 2026-06-30 — Comparação da estratégia iniciada em 22/06

### Regra de comparação
- Como os períodos têm quantidades diferentes de dias, comparar:
  - médias por dia;
  - taxas;
  - não apenas volume bruto.

### Resultado revisado
- Leads válidos por dia:
  - 01–21/06: **44,6**
  - 22–30/06: **49,0**
  - Variação: **+9,8%**

- MQLs por dia:
  - 01–21/06: **5,4**
  - 22–30/06: **9,3**
  - Variação: **+73,5%**

- Taxa MQL:
  - 01–21/06: **12,1%**
  - 22–30/06: **19,0%**
  - Variação relativa: **+57,9%**

### Decisão
- A mudança iniciada em 22/06 foi classificada como **positiva**.
- A decisão de escala deve considerar também investimento, custo por MQL e agendamentos, não somente CPL.

---

## 2026-06-30 — Definição do funil do formulário

### Fórmulas aprovadas
- **Clique → abertura** = formulários abertos ÷ cliques nos anúncios.
- **Abertura → envio** = formulários enviados ÷ formulários abertos.
- **Clique → envio** = formulários enviados ÷ cliques nos anúncios.

### Regra de fonte
- Cliques e formulários abertos devem vir do Meta Ads Manager.
- CSVs de leads fornecem somente formulários concluídos.
- Não estimar aberturas a partir de cliques ou leads.

### Recorte analisado das três campanhas
- Cliques no link: **1.848**
- Leads/formulários enviados: **365**
- Conversão clique → envio: `365 ÷ 1.848 = 19,75%`
- Leitura: aproximadamente **20 de cada 100 pessoas que clicam preenchem o formulário**.

### Pendência
- Formulários abertos ainda precisam ser extraídos do Meta Ads no mesmo período e escopo para fechar as outras etapas do funil.
- Os 1.848 cliques e 365 leads não devem ser tratados como total de todas as campanhas sem confirmação do escopo.

---

## 2026-06-30 — Hierarquia oficial das fontes do Instagram

### Regra anterior
- KPIs consolidados e somas detalhadas chegaram a ser misturados.

### Regra nova
1. Aplicativo do Instagram é a fonte principal dos KPIs consolidados:
   - visualizações;
   - contas alcançadas;
   - interações;
   - seguidores líquidos;
   - visitas ao perfil;
   - toques no link da bio.
2. Meta Business Suite é fonte complementar para:
   - posts;
   - Reels;
   - Stories;
   - detalhamento diário;
   - desempenho por conteúdo;
   - novos seguidores brutos.

### Regras adicionais
- Contas alcançadas representam alcance único e não devem ser substituídas pela soma do alcance diário.
- Seguidores líquidos e novos seguidores brutos devem ficar separados.
- Interações oficiais do perfil não devem ser substituídas pela soma de uma base detalhada incompleta.
- Engajamento dos conteúdos é número absoluto:
  - curtidas + comentários + compartilhamentos + salvamentos.
- Engajamento não deve ser formatado como percentual.
- Posts duplicados devem ser removidos pela identificação do post.

---

## 2026-06-30 — KPIs orgânicos oficiais de maio e junho

### Dr. Luciano — Maio
- Visualizações: **1.693.544**
- Contas alcançadas: **437.249**
- Interações: **7.777**
- Visitas ao perfil: **9.892**
- Toques no link: **909**
- Seguidores líquidos: **+1.023**
- Stories: **65**
- Posts únicos: **21**
- Média de visualizações dos Stories: **345,68**

### Dr. Luciano — Junho
- Visualizações: **1.174.393**
- Contas alcançadas: **279.333**
- Interações: **5.848**
- Visitas ao perfil: **5.937**
- Toques no link: **793**
- Seguidores líquidos: **+876**
- Stories: **134**
- Posts: **38**
- Média de visualizações dos Stories: **318,51**

### Natuá — Maio
- Visualizações: **69.990**
- Contas alcançadas: **28.793**
- Interações: **1.020**
- Visitas ao perfil: **7.118**
- Toques no link: **115**
- Seguidores líquidos: **+337**
- Stories: **45**
- Posts únicos: **14**
- Média de visualizações dos Stories: **80,93**

### Natuá — Junho
- Visualizações: **362.231**
- Contas alcançadas: **135.959**
- Interações: **2.555**
- Visitas ao perfil: **7.630**
- Toques no link: **141**
- Seguidores líquidos: **+494**
- Stories: **99**
- Posts: **23**
- Média de visualizações dos Stories: **90,42**

---

## 2026-06-30 — Separação entre investimento Meta leadgen e investimento total

### Regra anterior
- R$ 23,51 chegou a ser tratado como CPL consolidado.

### Regra nova
- Meta total: **R$ 31.148,53**
- Meta em campanhas de geração de leads: **R$ 28.898,72**
- Meta em campanhas não-lead: **R$ 2.249,81**
- Google: **R$ 1.784,01**
- Investimento total: **R$ 32.932,54**
- Leads Meta: **1.401**

### Fórmulas corretas
- **CPL Meta leadgen** = R$ 28.898,72 ÷ 1.401 = **R$ 20,63**
- **Custo total pago por lead Meta** = R$ 32.932,54 ÷ 1.401 = **R$ 23,51**

### Regra de nomenclatura
- R$ 20,63 pode ser chamado de CPL Meta leadgen.
- R$ 23,51 deve ser chamado de custo total pago por lead Meta.
- Não chamar R$ 23,51 de CPL leadgen.

---

## 2026-06-30 — Rankings de tráfego corrigidos

### Campanha com melhor eficiência e volume relevante
- Campanha Junho 3 | ABO – Teste de Criativos
- Leads: **160**
- CPL: **R$ 9,69**

### Conjunto com melhor eficiência, mínimo de 10 leads
- Frio 07 | Aberto Curitiba 35+ | Mulheres 2
- Leads: **21**
- CPL: **R$ 6,20**

### Maior conjunto em volume
- Frio | Criativos Campeões 01
- Leads: **423**
- CPL: **R$ 18,92**

### Anúncio com melhor eficiência
- Juliana
- Leads: **152**
- CPL: **R$ 8,02**

### Maior anúncio em volume
- Tratamento Obesidade
- Leads: **540**
- CPL: **R$ 18,10**

### Regra de decisão
- Não escalar por CPL isolado.
- Considerar volume mínimo, MQL, custo por MQL e agendamentos.

---

## 2026-06-30 — Top conteúdos de junho inseridos na planilha

### Dr. Luciano
- https://www.instagram.com/p/DZYYvMjPxfP/
- https://www.instagram.com/p/DZ5vKZwPdm5/
- https://www.instagram.com/p/DZ7oc8Gxk4z/

### Natuá
- https://www.instagram.com/p/DZ-5HQrPXgt/
- https://www.instagram.com/p/DaAxmpBR9Wk/
- https://www.instagram.com/p/DaGSsjlvE68/

### Regra
- O link direto do conteúdo deve permanecer disponível na aba ORGÂNICO.
- Não inventar visualizações, engajamento ou legenda quando a informação não estiver confirmada.

---

## 2026-06-30 — Controle de qualidade da versão final

**Arquivo final:** `Relatório Marketing 2026.xlsx`

### Validações realizadas
- [x] Período de junho conferido
- [x] MQLs recalculados com a base ampliada
- [x] Duplicidades auditadas
- [x] Agendamentos totais e de marketing separados
- [x] ROI de consulta e tratamento separados
- [x] Pipeline corrigido
- [x] Dados orgânicos consolidados pelas fontes corretas
- [x] Rankings de tráfego corrigidos
- [x] Formatos percentuais, monetários e múltiplos revisados
- [x] Layout manual preservado
- [x] Sem `#REF!`, `#VALUE!`, `#DIV/0!`, `#N/A` ou `#NAME?`
- [x] Arquivo final versionado

### Critério de pronto
A versão está pronta quando:
- abre normalmente;
- mantém o layout aprovado;
- usa as fontes hierarquicamente corretas;
- diferencia fatos, cálculos e pendências;
- não contém erros de fórmula;
- possui log e baseline atualizados.

---

## MODELO PARA PRÓXIMAS ATUALIZAÇÕES

## AAAA-MM-DD — Título da atualização

**Período analisado:**  
**Responsável:**  
**Arquivo-base:**  
**Arquivo entregue:**  

### Fontes utilizadas
- 

### Regra anterior
- 

### Regra nova
- 

### Impacto
- 

### Fórmulas e denominadores
- Métrica:
- Fórmula:
- Numerador:
- Denominador:
- Resultado:

### Divergências encontradas
- 

### Decisões aprovadas por Gustavo
- 

### Pendências
- 

### Validações finais
- [ ] Período e fuso conferidos
- [ ] Testes removidos
- [ ] Duplicidades auditadas
- [ ] Totais reconciliados
- [ ] Formatos corretos
- [ ] Layout preservado
- [ ] Sem erros de fórmula
- [ ] Arquivo versionado
- [ ] Baseline atualizado
