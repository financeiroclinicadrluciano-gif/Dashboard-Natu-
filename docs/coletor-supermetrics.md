# Coletor Supermetrics e o comando de atualização

## O comando de um passo

```bash
npm run atualizar            # regenera o snapshot das fontes e passa nos gates
npm run atualizar -- --publish   # e sobe no GitHub
```

`scripts/atualizar.sh` roda, parando se qualquer um falhar:

1. pipeline — lê as planilhas de `.data/`, aplica o re-fecho maduro da Meta e o
   MQL automático, grava o snapshot;
2. gate de tokens CSS órfãos;
3. gate de arquivos proibidos, segredos e PII;
4. typecheck;
5. 71 testes;
6. build;
7. com `--publish`: commit dos três artefatos permitidos + push.

Verificado em 2026-08-08: as 6 etapas passam, 71 testes verdes.

## O coletor da Meta — o que funciona e o que falta

```bash
npm run coletar   # gera public/data/meta-live-coletado-revisao.js (não publica)
```

`scripts/coletar.ts` puxa da Meta Ads API (Supermetrics), chave do `.env`.
**Funciona e traz dado real.** Mas ainda não dirige número publicado, por duas
razões descobertas em 2026-08-08:

### 1. `campaign_name` está mapeado para `adset_name`

Neste Supermetrics, o campo `campaign_name` retorna nome de **conjunto**, não de
campanha. Por isso o ranking veio com "Rmkt 05", "Frio 07" (conjuntos) em vez de
"Campanha Junho 1/2/3" (campanhas). Precisa remapear o campo ou agregar por
campanha explicitamente.

### 2. A conta tem mais campanhas que as "3 fixas leadgen"

O fecho validado usava as 3 campanhas fixas. A conta real roda dezenas de
conjuntos com leads. Somando tudo:

| Agosto 01–07 | Leads |
|---|---:|
| CRM (formulários — padrão-ouro) | **207** |
| Meta "3 fixas leadgen" | 206 (bate com a CRM) |
| Meta "todos os conjuntos" | 217 (11 a mais) |

Os 11 a mais são leads on-Facebook (Messenger/remarketing) que **não viram
formulário**. Como o MQL vem do formulário, a definição alinhada à CRM é a certa.

## Decisão que trava a automação total

**Qual é o "Leads Meta" oficial?**
- **Formulário (CRM)** — o que já está publicado, bate 99,5% com a Meta das 3
  fixas. É o que alimenta o MQL. **Recomendo este.**
- **Todos os leads on-Facebook** — número maior, inclui Messenger/remarketing.

Enquanto não confirmado, o publicado usa a CRM (padrão-ouro) e o coletor grava em
arquivo de revisão. Confirmado o critério, o coletor trava nele e o
`npm run atualizar` passa a puxar a Meta junto — aí é um comando de verdade.

## Fontes testadas em 2026-08-08

| Fonte | Estado |
|---|---|
| Facebook Ads (FA) | ✅ dado real |
| Google Ads (AW) | ✅ auth ok, R$ 0 de gasto (consistente) |
| FB Page (FB) | 🟡 auth ok, retorna páginas sem métrica útil |
| Instagram Insights (IGI) | ❌ **auth expirada — reautorizar** |
| FB Public Data (FBPD) | 🟡 exige parâmetro de conta |

**Para ligar o orgânico do Instagram** (o que mais falta): reautorizar o IGI.
Link de login do conector fica no `/mcp` ou nas configurações de conector.

## Segurança

A chave da API vive só em `.env` (gitignored). O coletor lê de lá e escreve
**apenas agregados** — a chave nunca entra em arquivo de saída. O arquivo de
revisão do coletor também está no `.gitignore`.
