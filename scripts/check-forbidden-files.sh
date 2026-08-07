#!/usr/bin/env bash
#
# Gate de arquivos proibidos e segredos.
#
# O repositorio e publico e o produto trata dado de paciente e de lead. Este
# script falha o CI quando algo que nunca pode ser versionado entra no commit.
# Ele olha o que o git EFETIVAMENTE rastreia — nao o disco — porque .gitignore
# protege o futuro e nao desfaz o que ja foi commitado.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "${REPO_ROOT}"

fail=0
report() {
  echo "BLOQUEIO: $1" >&2
  fail=1
}

# ---------------------------------------------------------------------------
# 1. Extensoes que carregam dado bruto
# ---------------------------------------------------------------------------
planilhas="$(git ls-files | grep -iE '\.(xlsx|xlsm|xls|csv)$' | grep -viE '^(docs/amostras|tests/fixtures)/' || true)"
if [[ -n "${planilhas}" ]]; then
  report "planilha versionada fora da pasta de amostras sinteticas:"
  echo "${planilhas}" | sed 's/^/    /' >&2
fi

# ---------------------------------------------------------------------------
# 2. Diretorios e arquivos que nunca entram
# ---------------------------------------------------------------------------
proibidos="$(git ls-files | grep -E '^(uploads/|data/raw/|data/private/|\.data/|\.runtime/)|\.(sqlite|sqlite3|db)$|^\.env$|\.env\.(local|production)$' || true)"
if [[ -n "${proibidos}" ]]; then
  report "caminho proibido versionado:"
  echo "${proibidos}" | sed 's/^/    /' >&2
fi

# ---------------------------------------------------------------------------
# 3. Padroes de segredo no conteudo rastreado
#
# `.env.example` e a documentacao das variaveis e nao pode ter valor real, entao
# entra na varredura como qualquer outro arquivo.
# ---------------------------------------------------------------------------
segredos=$(
  git grep -nIE \
    -e '(sk|pk)-[A-Za-z0-9]{20,}' \
    -e 'gh[pousr]_[A-Za-z0-9]{30,}' \
    -e 'AIza[0-9A-Za-z_-]{30,}' \
    -e 'AKIA[0-9A-Z]{16}' \
    -e 'xox[baprs]-[0-9A-Za-z-]{10,}' \
    -e '-----BEGIN [A-Z ]*PRIVATE KEY-----' \
    -e '(SECRET|TOKEN|PASSWORD|PASSWD|API_KEY|ACCESS_KEY)[[:space:]]*[:=][[:space:]]*["'\''][^"'\'']{12,}' \
    -- . ':(exclude)scripts/check-forbidden-files.sh' ':(exclude)*.lock' ':(exclude)package-lock.json' || true
)
if [[ -n "${segredos}" ]]; then
  report "padrao de segredo no conteudo versionado:"
  echo "${segredos}" | sed 's/^/    /' >&2
fi

# ---------------------------------------------------------------------------
# 4. PII nos artefatos publicos
#
# O pipeline ja tem gate de PII, mas ele roda na geracao. Este roda no commit:
# protege contra alguem editar o JSON a mao ou restaurar um snapshot antigo.
# ---------------------------------------------------------------------------
# Telefone precisa de SEPARADOR ou de aspas delimitando um token puramente
# numerico. Uma taxa como 0.03902638462 contem onze digitos seguidos e casaria
# com um padrao frouxo de celular — foi exatamente o que aconteceu na primeira
# versao deste gate. Metrica e numero JSON; telefone e string.
TEL_FORMATADO='(^|[^0-9.])\(?[0-9]{2}\)?[[:space:].-]+9?[0-9]{4}[[:space:].-]+[0-9]{4}([^0-9]|$)'
TEL_STRING='"(\+?55)?[0-9]{10,13}"'

for artefato in public/data/dashboard-snapshot.json public/data/analysis-package.json; do
  [[ -f "${artefato}" ]] || continue
  achados=$(
    grep -oIE \
      -e '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' \
      -e "${TEL_FORMATADO}" \
      -e "${TEL_STRING}" \
      -e '[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}' \
      "${artefato}" || true
  )
  if [[ -n "${achados}" ]]; then
    report "padrao de e-mail, telefone ou CPF em ${artefato}:"
    echo "${achados}" | sort -u | head -5 | sed 's/^/    /' >&2
  fi

  campos=$(
    grep -oiE '"(patient|patient_id|patient_name|paciente|paciente_nome|full_?name|phone(_number)?|telefone|email|e-mail|cpf|document)"' \
      "${artefato}" || true
  )
  if [[ -n "${campos}" ]]; then
    report "campo de dado pessoal em ${artefato}:"
    echo "${campos}" | sort -u | sed 's/^/    /' >&2
  fi
done

if [[ "${fail}" -eq 1 ]]; then
  echo >&2
  echo "Publicacao bloqueada. Nada de dado real entra em repositorio publico." >&2
  exit 1
fi

echo "check-forbidden-files: nenhum arquivo proibido, segredo ou PII no conteudo versionado."
