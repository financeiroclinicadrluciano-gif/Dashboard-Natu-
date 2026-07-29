#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
DATA_DIR="${DASHBOARD_DATA_DIR:-${1:-}}"
REMOTE="${GIT_REMOTE:-origin}"
BRANCH="${GIT_BRANCH:-main}"

if [[ -z "${DATA_DIR}" ]]; then
  echo "Uso: scripts/publish-dashboard.sh /diretorio/com/as-5-planilhas" >&2
  exit 2
fi

if [[ ! -d "${DATA_DIR}" ]]; then
  echo "Diretorio de planilhas nao encontrado: ${DATA_DIR}" >&2
  exit 2
fi

DATA_DIR="$(cd -- "${DATA_DIR}" && pwd)"

if [[ -n "$(git -C "${REPO_ROOT}" status --porcelain)" ]]; then
  echo "O repositorio possui alteracoes locais. Revise-as antes da publicacao automatica." >&2
  git -C "${REPO_ROOT}" status --short
  exit 1
fi

CURRENT_BRANCH="$(git -C "${REPO_ROOT}" branch --show-current)"
if [[ "${CURRENT_BRANCH}" != "${BRANCH}" ]]; then
  echo "Publicacao bloqueada: branch atual ${CURRENT_BRANCH}; esperado ${BRANCH}." >&2
  exit 1
fi

git -C "${REPO_ROOT}" pull --ff-only "${REMOTE}" "${BRANCH}"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm e necessario para validar o build." >&2
  exit 1
fi

npm ci --ignore-scripts --no-audit --no-fund --prefix "${REPO_ROOT}"
npm run dashboard:update --prefix "${REPO_ROOT}" -- "${DATA_DIR}" --publish

echo "Snapshot validado e publicado em ${REMOTE}/${BRANCH}."
