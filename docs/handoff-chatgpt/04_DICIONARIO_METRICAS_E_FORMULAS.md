# DICIONÁRIO DE MÉTRICAS E FÓRMULAS

| Métrica | Fórmula / definição | Fonte |
|---|---|---|
| Investimento total | Meta total + Google | Ads Managers |
| Meta leadgen | gasto somente das campanhas de geração de leads | Meta |
| CPL Meta leadgen | Meta leadgen / leads Meta leadgen | Meta |
| Custo total por lead Meta | investimento total pago / leads Meta | Meta + Google |
| Formulários válidos | submissões auditáveis após remover testes | CRM/Form |
| Cobertura | formulários válidos / leads Meta | Meta + CRM |
| MQL confirmado | classificação conservadora aprovada | CRM auditado |
| Taxa MQL | MQL confirmado por submissão / formulários válidos | CRM |
| Custo por MQL | Meta leadgen / MQL confirmado | Meta + CRM |
| Pessoas repetidas | pessoas com >=2 submissões | CRM |
| Envios excedentes | soma(envios por pessoa - 1) | CRM |
| Clique → abertura | aberturas / cliques | Meta |
| Abertura → envio | envios / aberturas | Meta |
| Clique → envio | envios / cliques | Meta/CRM no mesmo escopo |
| CAC agendamento MKT | investimento total / agendamentos MKT | Ads + Comercial |
| Conversão comercial | fechados / atendidos | Closer |
| Ticket médio por atendido | receita fechada / atendidos | Closer |
| Ticket por fechado | receita fechada / fechados | Closer |
| Conversão 1ª consulta | fechados na 1ª consulta / 1ª consultas | Closer |
| ROI 1ª consulta | receita das 1ª consultas / investimento total | Closer + Ads |
| ROI primeiros pacientes | tratamentos fechados em 1ª consulta / investimento total | Closer + Ads |
| Taxa interação/alcance | interações / contas alcançadas | Instagram |
| Taxa visita/alcance | visitas / contas alcançadas | Instagram |
| Taxa clique/visita | cliques bio / visitas | Instagram |
| Taxa clique/alcance | cliques bio / contas alcançadas | Instagram |

## Regra especial do `% MQL` em TRÁFEGO JULHO
A coluna `% MQL` do ranking por campanha/conjunto/anúncio é calculada sobre **submissões CRM auditáveis atribuídas àquele item**, não necessariamente sobre a coluna `Resultados` do Meta. Portanto:
- `Resultados` = número Meta;
- `MQL` = classificação CRM;
- `% MQL` = MQL / base auditável do item.

Não recalcular `% MQL` como `MQL / Resultados` sem reconstruir a base CRM correspondente.
