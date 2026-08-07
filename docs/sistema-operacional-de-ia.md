# Sistema Operacional para Multiplas IAs

## Objetivo

Permitir que qualquer IA autorizada atualize o dashboard sem redefinir metricas, expor pacientes ou publicar uma analise inconsistente.

## Papeis

| Etapa | Executor | Saida | Regra |
|---|---|---|---|
| Intake | codigo | arquivos classificados e hashes | nunca enviar linhas a uma IA |
| Extracao | codigo | agregados por fonte | deterministico |
| QA de dados | codigo | relatorio de gates | pode bloquear |
| Analise | IA + Skill | `AnalysisPackage` | somente snapshot validado |
| QA de analise | codigo | contrato e evidencias conferidos | numero citado deve existir |
| Publicacao | codigo | snapshot ativo e commit | somente allowlist |
| Auditoria | outra IA ou humano | parecer sobre diff | nao recalcula dados |

## Prompt universal de atualizacao

Use esta mensagem com qualquer IA trabalhando no repositorio:

> Atualize o Dashboard Natua usando as planilhas anexadas. Leia `AGENTS.md`, execute o pipeline deterministico, use `skills/natua-data-analyst/SKILL.md` para as analises e publique somente se todos os gates criticos passarem. Nao envie planilhas ao Git nem invente metricas ausentes.

## Fluxo esperado para o operador

1. Selecionar ou anexar as cinco planilhas.
2. Pressionar Enter.
3. O sistema classifica os arquivos, extrai, reconcilia e valida.
4. Se aprovado, gera analises das oito secoes e cria o snapshot.
5. Com publicacao habilitada, executa testes, build, commit allowlisted e push.
6. Se rejeitado, mostra a causa sem alterar o dashboard publicado.

## Independencia de fornecedor

O contrato nao depende de um modelo especifico. Codex, Claude, Gemini ou outro agente pode executar a etapa de analise, desde que:

- leia a Skill;
- receba o mesmo snapshot;
- devolva o mesmo schema;
- nao altere metricas;
- passe no validador de evidencias.

## Hierarquia de autoridade

1. Planilha de origem.
2. Contrato de dados.
3. Motor deterministico e relatorio de validacao.
4. Snapshot aprovado.
5. Analise da IA.

Em conflito, a camada superior vence. Uma analise nunca corrige uma planilha; ela registra a divergencia e recomenda a correcao da fonte.
