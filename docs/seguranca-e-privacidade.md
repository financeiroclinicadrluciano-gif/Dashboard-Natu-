# Seguranca e privacidade

> Este documento descreve arquitetura, riscos, retencao e responsabilidades.
> **Nao e parecer juridico.**

## O risco central

O produto processa nome, telefone e informacao de tratamento de pacientes reais de
uma clinica. O repositorio `financeiroclinicadrluciano-gif/Dashboard-Natu-` e
**publico**. Essas duas frases juntas definem todo o desenho de privacidade aqui:
o dado bruto nunca pode encostar no Git, e o artefato publicado precisa ser
agregado por construcao, nao por disciplina de quem opera.

## Camadas de defesa

Quatro barreiras independentes. Nenhuma delas confia nas outras.

| # | Barreira | Onde | O que pega |
|---|---|---|---|
| 1 | `.gitignore` | `.gitignore` | impede que planilha, `.env`, `.data/` e upload sejam adicionados |
| 2 | Gate de PII na geracao | `pipeline.ts:containsPii` | rejeita o snapshot se um padrao de e-mail/telefone ou campo pessoal aparecer no agregado |
| 3 | Gate de commit | `scripts/check-forbidden-files.sh` | roda no CI sobre o que o git **efetivamente rastreia**; pega o que ja furou o `.gitignore` |
| 4 | Gate de bundle | `.github/workflows/ci.yml` | varre `dist/` depois do build |

A barreira 1 protege o futuro; ela nao desfaz o que ja foi commitado. Por isso a
barreira 3 olha `git ls-files`, e nao o disco.

**Estado verificado em 2026-08-07:** as quatro rodaram. O gate de commit foi
testado contra quatro sabotagens — planilha real forcada com `git add -f`, token
`ghp_*` no codigo, telefone formatado no snapshot e campo `telefone` no breakdown.
As quatro bloquearam; o estado limpo passou.

## Dados pessoais: onde eles existem e onde nao existem

| Camada | Contem dado pessoal? |
|---|---|
| Planilhas de origem | **Sim** — nome, telefone, tratamento |
| Adaptadores em memoria | Sim, durante o processamento |
| `dashboard-snapshot.json` | **Nao** — so agregados, com proveniencia |
| `analysis-package.json` | **Nao** — analise sobre agregados |
| Bundle do frontend | **Nao** |
| Logs | **Nao** — nenhum log imprime linha de origem |

O canal de origem da planilha semanal e um caso a parte: ele chega em texto livre
e pode conter nome de profissional (`indicacao dra vivian`). Ele e classificado em
6 valores canonicos e **o texto bruto nao e publicado** — so o canal e a campanha.

## Retencao

| Artefato | Onde vive | Retencao |
|---|---|---|
| Planilhas originais | maquina de quem opera, em `.data/` | definida por quem opera; nunca sobe |
| Snapshot publicado | repositorio | historico do Git; sao agregados |
| Versoes anteriores | `store.ts` | permitem `dashboard:rollback` |

`.data/` esta no `.gitignore` e serve ao teste end-to-end local. **Apagar `.data/`
nao quebra nada** — o teste que depende dela se pula sozinho.

## Requisitos ainda NAO EXECUTADO

Estes itens do brief §7 nao estao implementados. Nao os trate como resolvidos:

- **Autenticacao obrigatoria em producao** — hoje o `server.ts` serve o painel sem login. Enquanto isso for verdade, **o painel nao pode ser exposto na internet publica**.
- **Controle de acesso por perfil (RBAC)** e sessao segura.
- **Rate limit** em upload e APIs.
- **Mascaramento de nome e telefone na visao executiva** — hoje o snapshot nao tem esses campos, entao nao ha o que mascarar; o requisito volta a valer se alguma tela passar a exibir registro individual.
- **Trilha de auditoria com usuario** — o `importId` registra a importacao, nao quem a fez.
- **Object storage privado com URL assinada** para os arquivos originais.
- **Politica formal de retencao e exclusao** aprovada por quem responde pela clinica.

## Responsabilidades

| Papel | Responsabilidade |
|---|---|
| Quem opera a atualizacao semanal | manter as planilhas fora do repositorio; nunca commitar `.data/` |
| Quem revisa PR | conferir que o CI passou no gate de arquivos proibidos antes do merge |
| Quem administra o repositorio | decidir a visibilidade; publico exige que nada real seja versionado |
| Quem responde pela clinica | definir retencao, base legal e quem pode ver registro individual |

## Recomendacao aberta

**Tornar o repositorio privado.** Nenhum dado pessoal esta versionado hoje — isso
foi verificado. Mas o snapshot publico carrega receita, ticket, pipeline e nome de
profissional da clinica. Isso e informacao comercial sensivel, e nenhum gate de PII
pega, porque nao e erro de dado: e escolha de superficie. Um clique resolve.
