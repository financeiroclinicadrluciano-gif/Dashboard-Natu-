# Dashboard Executivo Natua

Dashboard auditavel para Marketing, Organico, Comercial, Agendamentos e Financeiro. Os numeros sao calculados por um pipeline deterministico; a Skill de analista interpreta somente o snapshot aprovado.

## Atualizar em um passo

```bash
scripts/publish-dashboard.sh /diretorio/com/as-5-planilhas
```

Ou abra o dashboard local, clique em `Atualizar dados`, selecione as cinco planilhas e pressione Enter. Para commit e push automaticos, configure `DASHBOARD_AUTO_PUBLISH=true` em uma copia local de `.env`.

## Rodar localmente

```bash
npm ci
npm run dev
```

Abra `http://127.0.0.1:3000`.

## Contratos

- `AGENTS.md`: regras obrigatorias para qualquer IA.
- `docs/DATA-CONTRACT.md`: definicoes, formulas e fontes.
- `docs/AI-OPERATING-SYSTEM.md`: fluxo de colaboracao entre IAs.
- `docs/UPDATE-RUNBOOK.md`: atualizacao, publicacao e rollback.
- `skills/natua-data-analyst/SKILL.md`: metodo das oito analises.

## Seguranca

Planilhas e linhas brutas nao entram no Git. O publicador aceita somente:

- `public/data/dashboard-snapshot.json`
- `public/data/dashboard-snapshot.js`
- `public/data/analysis-package.json`

Metricas sem fonte permanecem `SEM_BASE`; nenhum agente pode estima-las para preencher a interface.

## Indice navegavel

Os contratos acima estao em backtick, o que nao gera aresta no grafo do vault (regra 8) — nenhum deles era alcancavel por navegacao. Os mesmos arquivos, dentro do proprio repo:

- `03-PROJETOS/03.1-NATUA/Dashboard-Codebase-GitHub/AGENTS.md` — regras obrigatorias para qualquer IA
- `03-PROJETOS/03.1-NATUA/Dashboard-Codebase-GitHub/docs/DATA-CONTRACT.md` — definicoes, formulas e fontes
- `03-PROJETOS/03.1-NATUA/Dashboard-Codebase-GitHub/docs/AI-OPERATING-SYSTEM.md` · `03-PROJETOS/03.1-NATUA/Dashboard-Codebase-GitHub/docs/UPDATE-RUNBOOK.md` · `03-PROJETOS/03.1-NATUA/Dashboard-Codebase-GitHub/docs/ARCHITECTURE.md`
- `03-PROJETOS/03.1-NATUA/Dashboard-Codebase-GitHub/skills/natua-data-analyst/SKILL.md` — metodo das oito analises

Frente do vault que consome este dashboard: [[03-PROJETOS/03.1-NATUA/6-Natua-Dashboard-Reunioes-Semanais/README|Dashboard de Reunioes Semanais]].
