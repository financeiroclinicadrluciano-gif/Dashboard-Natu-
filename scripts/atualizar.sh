#!/usr/bin/env bash
#
# Atualizar o dashboard num comando: regenera o snapshot das fontes, passa por
# TODOS os gates e — com --publish — sobe para o GitHub.
#
# O que roda, na ordem (para se qualquer um falhar):
#   1. pipeline: le as planilhas de .data/, aplica o re-fecho da Meta, o MQL
#      automatico e o validador logico, e grava o snapshot;
#   2. gate de tokens CSS orfaos;
#   3. gate de arquivos proibidos, segredos e PII;
#   4. typecheck;
#   5. testes (71);
#   6. build;
#   7. com --publish: commit dos tres artefatos permitidos + push.
#
# Uso:
#   scripts/atualizar.sh                 # regenera e verifica, nao publica
#   scripts/atualizar.sh --publish       # regenera, verifica e sobe no GitHub
#
# A coleta da Meta (scripts/coletar.ts) NAO entra aqui ainda: a definicao de
# leadgen da conta precisa ser confirmada (ver docs/coletor-supermetrics.md).
# Enquanto isso, os leads/MQL vem da CRM, que e o padrao-ouro.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO}"

DATA_DIR="${DASHBOARD_DATA_DIR:-.data}"
PUBLISH=0
[[ "${1:-}" == "--publish" ]] && PUBLISH=1

step() { printf "\n\033[1m▸ %s\033[0m\n" "$1"; }

step "1/6 · Regenerando o snapshot das fontes"
npm run --silent dashboard:update -- "${DATA_DIR}"

step "2/6 · Gate de tokens CSS"
npm run --silent check:tokens

step "3/6 · Gate de arquivos proibidos, segredos e PII"
npm run --silent check:secrets

step "4/6 · Typecheck"
npm run --silent lint

step "5/6 · Testes"
npm run --silent test

step "6/6 · Build"
npm run --silent build

if [[ "${PUBLISH}" -eq 1 ]]; then
  step "Publicando no GitHub"
  git add public/data/dashboard-snapshot.json \
          public/data/dashboard-snapshot.js \
          public/data/analysis-package.json
  if git diff --cached --quiet; then
    echo "Nada mudou no snapshot; nada a publicar."
  else
    git commit -m "data(dashboard): atualizar snapshot $(date +%Y-%m-%d)"
    git push
    echo "Snapshot publicado."
  fi
else
  printf "\n\033[1mPronto.\033[0m Snapshot regenerado e verificado. Rode com --publish para subir.\n"
fi
