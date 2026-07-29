# Runbook de Atualizacao

## Atualizacao local automatica

Coloque as cinco planilhas em um diretorio fora do repositorio e execute:

```bash
npm run dashboard:update -- /caminho/das/planilhas
```

O comando executa classificacao, extracao, reconciliacao, validacao, snapshot e analises. A publicacao no Git so ocorre com `--publish`; nesse modo, `lint`, testes e build tambem sao obrigatorios.

```bash
npm run dashboard:update -- /caminho/das/planilhas --publish
```

Para o fluxo operacional completo, prefira o wrapper seguro:

```bash
scripts/publish-dashboard.sh /caminho/das/planilhas
```

Ele exige a branch `main`, worktree limpo, atualiza dependencias pelo lockfile e publica somente os tres artefatos agregados permitidos.

## Atualizacao visual: anexar e pressionar Enter

1. Configure `.env` a partir de `.env.example`.
2. Mantenha `DASHBOARD_AUTO_PUBLISH=true` somente na maquina autorizada a publicar.
3. Execute `npm run dev`.
4. Abra o dashboard e clique em `Atualizar dados`.
5. Selecione exatamente cinco planilhas e pressione Enter.

Com a publicacao automatica habilitada, a API executa pipeline, Skill, testes, build, commit e push. Sem essa variavel, o mesmo fluxo atualiza apenas o snapshot local e informa `PUBLISHED_LOCAL`.

## Conferencia sem publicar

```bash
npm run dashboard:update:check -- /caminho/das/planilhas
```

Este modo nao altera o snapshot ativo e retorna um resumo por fonte, periodo, divergencias e gates.

## Estados

- `RECEIVED`: arquivos recebidos e identificados.
- `VALIDATING`: extracao e reconciliacao em andamento.
- `REJECTED`: gate critico falhou; versao publica preservada.
- `APPROVED`: snapshot candidato valido.
- `PUBLISHED`: snapshot ativo e build aprovados.
- `ROLLED_BACK`: versao anterior restaurada.

## Rollback

```bash
npm run dashboard:rollback
```

O comando seleciona o snapshot aprovado imediatamente anterior, valida novamente e troca o ativo sem apagar o historico.

Para publicar o rollback:

```bash
npm run dashboard:rollback -- --publish
```

## Falhas comuns

| Falha | Acao |
|---|---|
| arquivo nao reconhecido | conferir se a planilha possui abas/cabecalhos esperados |
| fonte duplicada | remover a copia antiga; o sistema nao escolhe silenciosamente |
| divergencia Marketing x Formulario | corrigir classificacao/periodo na fonte |
| linhas sem status na Closer | completar status; publicacao pode seguir com ressalva |
| Financeiro defasado | atualizar a fonte ou manter alerta visivel |
| PII detectada na saida | bloquear, revisar adaptador e nunca publicar |
| branch diferente de `main` | trocar para `main`, sincronizar e repetir; nunca forcar push |
| worktree com alteracoes | revisar ou concluir as alteracoes antes da importacao automatica |

## Checklist de publicacao

- cinco fontes classificadas;
- periodos declarados;
- formulas reconciliadas;
- metricas `SEM_BASE` preservadas;
- nenhuma PII no snapshot ou diff;
- analises das oito secoes validadas;
- build e testes aprovados;
- commit contem apenas codigo e agregados sanitizados.
