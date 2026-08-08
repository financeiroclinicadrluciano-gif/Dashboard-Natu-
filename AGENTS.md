# Contrato Operacional do Dashboard Natua

Este repositorio pode ser operado por Codex, Claude Code, Gemini ou outra IA. Todas devem seguir o mesmo fluxo; nenhuma IA pode criar sua propria definicao de metrica.

## Ordem obrigatoria

1. Ler `docs/arquitetura.md`.
2. Ler `docs/contrato-de-dados.md`.
3. Para qualquer analise, ler `skills/natua-data-analyst/SKILL.md`.
4. Executar a importacao deterministica antes de interpretar os dados.
5. Publicar somente quando todos os gates criticos estiverem aprovados.

## Regras inegociaveis

- Planilhas brutas, nomes, telefones, e-mails e dados clinicos nunca entram no Git.
- Todo numero exibido deve ter `source`, `sheet`, `period`, `metric` e formula quando calculado.
- IA nao calcula KPIs a partir de linhas brutas. IA interpreta apenas `DashboardSnapshot` validado.
- Nao inventar comparecimento, no-show, ROI por origem, ticket por origem ou ranking de objecoes.
- Ausencia de base deve aparecer como `SEM_BASE`, nunca como zero ou estimativa.
- Financeiro e marketing podem ter competencias diferentes; a interface deve mostrar essa defasagem.
- Erro critico bloqueia publicacao e preserva o ultimo snapshot valido.
- Uma analise so pode citar um numero que exista no snapshot recebido.

## Comando padrao

```bash
npm run dashboard:update -- /caminho/das/planilhas
```

O diretorio deve conter uma planilha de cada papel: Marketing, Closer, Agendamentos, Formulario e Financeiro. Nomes podem variar; a classificacao e feita pelo conteudo.

## Definicao de pronto

- `npm run dashboard:update:check -- /caminho/das/planilhas`
- `npm run lint`
- `npm test`
- `npm run build`
- QA visual em 390, 768 e 1440 px
- nenhuma planilha ou PII no diff do Git
- snapshot, relatorio de validacao e analises com o mesmo `importId`

