# Deploy

## Rodar localmente

```bash
npm ci
npm run dev
```

Abre em `http://127.0.0.1:3000`. Nenhuma chave de API e necessaria: o pipeline e
deterministico e nao chama servico externo.

Para rodar o teste end-to-end, que regenera o snapshot a partir das planilhas
brutas, coloque as 5 fontes em `.data/` (ja no `.gitignore`) e rode `npm test`.
Sem a pasta, esse teste se pula sozinho e os outros 31 continuam rodando.

## Build

```bash
npm run build
```

Gera `dist/index.html` (pagina + design system), `dist/data/` (snapshot e analise)
e `dist/server.cjs` (Express). Rodar com `npm start`.

## Variaveis de ambiente

Copie `.env.example` para `.env`. **Nenhum valor secreto entra no repositorio.**

| Variavel | Obrigatoria | Para que serve |
|---|---|---|
| `PORT` | nao (padrao 3000) | porta do servidor local e do preview |
| `APP_URL` | nao | usada por ambientes de deploy |
| `DASHBOARD_AUTO_PUBLISH` | nao | `true` permite commit e push automaticos apos `--publish` |
| `DASHBOARD_PUBLISH_BRANCH` | nao (padrao `main`) | branch alvo da publicacao automatica |

## CI

`.github/workflows/ci.yml` roda em todo push na `main` e em todo Pull Request:

1. instalacao limpa (`npm ci`);
2. **gate de arquivos proibidos, segredos e PII** — roda primeiro, porque se dado
   real entrou no commit nao interessa se o build passa;
3. typecheck (`tsc --noEmit`);
4. testes (`node:test`, incluindo os parsers e a regressao do fechamento);
5. build;
6. varredura do `dist/` por padrao de e-mail, telefone e CPF.

## Deploy contínuo — NAO EXECUTADO

O brief pede deploy automatico apos merge na branch principal. **Isso ainda nao
existe.** O que falta decidir e configurar:

- **provedor** (Fly.io, Railway, Render ou VPS — o build gera um Express comum, sem amarra a fornecedor);
- **workflow de deploy** disparado por push na `main`, apos o CI verde;
- **segredos** do provedor cadastrados como GitHub Secrets.

## Producao — pre-requisito bloqueante

**O painel nao pode ser exposto na internet publica no estado atual.**
Nao existe autenticacao (`docs/seguranca-e-privacidade.md`, secao NAO EXECUTADO).
Enquanto isso for verdade, ele deve rodar em rede interna, atras de VPN, ou atras
de um proxy com autenticacao.

## Persistencia em producao — NAO EXECUTADO

Hoje o estado vive em arquivo (`store.ts` + os tres artefatos publicados). Isso
funciona para a atualizacao semanal de uma clinica e falha quando houver mais de
um operador simultaneo.

O caminho documentado no brief §6, quando isso for necessario:

- **PostgreSQL** para dados normalizados, importacoes, usuarios e versoes;
- **object storage privado** compativel com S3 para os arquivos originais, com
  URL assinada, acesso restrito e retencao configuravel;
- **criptografia em transito**;
- credenciais **somente** por variavel de ambiente ou secret do provedor.

Migrar para banco nao muda o contrato do snapshot: `dashboardSnapshotSchema`
continua sendo a fronteira entre o motor de dados e a tela.
