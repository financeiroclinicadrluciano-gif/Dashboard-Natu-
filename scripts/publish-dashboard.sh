#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
SOURCE_DIR="${DASHBOARD_SOURCE_DIR:-${1:-}}"
REMOTE="${GIT_REMOTE:-origin}"
BRANCH="${GIT_BRANCH:-main}"
COMMIT_MESSAGE="${GIT_COMMIT_MESSAGE:-chore(dashboard): atualizar painel executivo}"

if [[ -z "${SOURCE_DIR}" ]]; then
  echo "Uso: scripts/publish-dashboard.sh /caminho/para/Dashboard-Natua-Final-v2" >&2
  exit 2
fi

if [[ ! -d "${SOURCE_DIR}" ]]; then
  echo "Fonte nao encontrada: ${SOURCE_DIR}" >&2
  exit 2
fi

SOURCE_DIR="$(cd -- "${SOURCE_DIR}" && pwd)"
HTML_SOURCE="$(find "${SOURCE_DIR}" -maxdepth 1 -type f -name '*.html' -print -quit)"

if [[ -z "${HTML_SOURCE}" || ! -f "${SOURCE_DIR}/support.js" || ! -d "${SOURCE_DIR}/_ds" ]]; then
  echo "A fonte precisa conter um HTML, support.js e o diretorio _ds." >&2
  exit 2
fi

if [[ -n "$(git -C "${REPO_ROOT}" status --porcelain)" ]]; then
  echo "O repositorio possui alteracoes locais. Revise-as antes da publicacao automatica." >&2
  git -C "${REPO_ROOT}" status --short
  exit 1
fi

git -C "${REPO_ROOT}" pull --ff-only "${REMOTE}" "${BRANCH}"

mkdir -p "${REPO_ROOT}/public"
cp "${HTML_SOURCE}" "${REPO_ROOT}/index.html"
cp "${SOURCE_DIR}/support.js" "${REPO_ROOT}/public/support.js"
rsync -a --delete "${SOURCE_DIR}/_ds/" "${REPO_ROOT}/public/_ds/"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm e necessario para validar o build." >&2
  exit 1
fi

npm install --ignore-scripts --no-package-lock --no-audit --no-fund --prefix "${REPO_ROOT}"
npm run build --prefix "${REPO_ROOT}"

git -C "${REPO_ROOT}" add -- index.html public/support.js public/_ds

if git -C "${REPO_ROOT}" diff --cached --quiet; then
  echo "Nenhuma alteracao de dashboard para publicar."
  exit 0
fi

git -C "${REPO_ROOT}" commit -m "${COMMIT_MESSAGE}"
git -C "${REPO_ROOT}" push "${REMOTE}" "${BRANCH}"

echo "Dashboard publicado em ${REMOTE}/${BRANCH}."
