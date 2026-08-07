# Dashboard Executivo Natuá MedSpa

Painel semanal de marketing, tráfego pago, orgânico, agendamentos, comercial e
financeiro. Os números são calculados por um pipeline determinístico com
proveniência por métrica: cada valor sabe de qual planilha, de qual aba e de qual
fórmula ele veio.

**Métrica sem fonte auditável fica `SEM_BASE`.** Nenhum agente — humano ou IA —
pode estimar um número para preencher tela.

## Rodar localmente

```bash
npm ci
npm run dev
```

Abre em `http://127.0.0.1:3000`. Nenhuma chave de API é necessária.

## Atualizar os dados

```bash
scripts/publish-dashboard.sh /diretorio/com/as-planilhas
```

Ou abra o painel, clique em `Atualizar dados` e selecione as planilhas.

O passo a passo para quem não é técnico está em
[docs/manual-atualizacao-semanal.md](docs/manual-atualizacao-semanal.md).

## Verificar

```bash
npm run lint          # typecheck
npm test              # 33 testes
npm run check:secrets # gate de arquivos proibidos, segredos e PII
npm run build
```

O teste end-to-end regenera o snapshot a partir das planilhas brutas e confere os
30 números do fechamento aprovado. Ele depende das fontes, que têm dado pessoal e
nunca entram no repositório: coloque-as em `.data/` (já no `.gitignore`) para
rodá-lo. Sem a pasta, ele se pula sozinho.

## Documentação

| Documento | Para quê |
|---|---|
| [manual-atualizacao-semanal.md](docs/manual-atualizacao-semanal.md) | atualizar o painel toda semana, passo a passo |
| [contrato-de-dados.md](docs/contrato-de-dados.md) | definições, fórmulas, fontes e o que bloqueia a publicação |
| [dicionario-de-metricas.md](docs/dicionario-de-metricas.md) | as 116 métricas, geradas do próprio snapshot |
| [dicionario-de-dados.md](docs/dicionario-de-dados.md) | o que cada fonte entrega e como é reconhecida |
| [fluxo-de-importacao.md](docs/fluxo-de-importacao.md) | como uma planilha vira número, e onde o processo para |
| [arquitetura.md](docs/arquitetura.md) | os dois cérebros: motor determinístico e camada de análise |
| [cobertura-indicadores.md](docs/cobertura-indicadores.md) | os indicadores pedidos por setor e quais já têm fonte |
| [decisoes-tecnicas.md](docs/decisoes-tecnicas.md) | as 13 decisões que moldaram o produto, com o motivo |
| [seguranca-e-privacidade.md](docs/seguranca-e-privacidade.md) | camadas de defesa, retenção e o que ainda falta |
| [deploy.md](docs/deploy.md) | build, variáveis, CI e pré-requisitos de produção |
| [sistema-operacional-de-ia.md](docs/sistema-operacional-de-ia.md) | como uma IA colabora sem virar fonte de número |
| [AGENTS.md](AGENTS.md) | regras obrigatórias para qualquer IA que operar este repositório |

## Segurança

O repositório é público e o produto trata dado de paciente. Quatro barreiras
independentes cobrem isso:

1. `.gitignore` — impede planilha, `.env`, `.data/` e upload de serem adicionados;
2. gate de PII na geração do snapshot — rejeita o agregado se um padrão pessoal aparecer;
3. `scripts/check-forbidden-files.sh` — roda no CI sobre o que o git **efetivamente rastreia**;
4. varredura do `dist/` depois do build.

Publicação aceita apenas três arquivos: `dashboard-snapshot.json`,
`dashboard-snapshot.js` e `analysis-package.json`.

**O painel não tem autenticação e não pode ser exposto na internet pública no
estado atual.** Ver [docs/seguranca-e-privacidade.md](docs/seguranca-e-privacidade.md).

## Frente do vault que consome este dashboard

[[03-PROJETOS/03.1-NATUA/6-Natua-Dashboard-Reunioes-Semanais/README|Dashboard de Reuniões Semanais]]
