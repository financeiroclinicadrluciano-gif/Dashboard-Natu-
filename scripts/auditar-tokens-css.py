#!/usr/bin/env python3
"""
Auditor de tokens CSS orfaos.

Tres agentes escreveram `motion.css`, `surfaces.css` e `controls.css` em
paralelo, cada um dono do seu arquivo. Esse arranjo evita conflito de escrita e
cria um risco novo: um agente referencia `var(--dur-2)` achando que outro define,
o outro chamou de `--motion-base`, e o CSS continua valido — o navegador so usa
o fallback em silencio. Nada quebra, e o sistema visual deixa de ser um sistema.

Este script compara toda `var(--x)` usada contra as declaradas e reporta:

  ORFAO SEM FALLBACK  -> quebra de verdade, exit 1
  ORFAO COM FALLBACK  -> nao quebra, mas a camada nao esta integrada, exit 1
  NAO USADO           -> apenas informativo

Rodar: python3 scripts/auditar-tokens-css.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DS = RAIZ / "public" / "_ds"

# Onde os tokens sao DECLARADOS. Inclui o design system versionado.
FONTES_DE_TOKEN = sorted(DS.glob("design-system-natu-*/tokens/*.css")) + sorted(
    DS.glob("design-system-natu-*/styles.css")
)
# Camadas escritas pelos agentes.
CAMADAS = [DS / "surfaces.css", DS / "controls.css", DS / "motion.css"]

DECLARACAO = re.compile(r"^\s*(--[A-Za-z0-9_-]+)\s*:", re.MULTILINE)
# Captura o nome e se ha virgula (fallback) antes do fecha-parenteses do var().
USO = re.compile(r"var\(\s*(--[A-Za-z0-9_-]+)\s*(,)?")


def ler(caminho: Path) -> str:
    return caminho.read_text(encoding="utf-8") if caminho.exists() else ""


def main() -> int:
    declarados: set[str] = set()
    for arquivo in FONTES_DE_TOKEN:
        declarados.update(DECLARACAO.findall(ler(arquivo)))

    # Cada camada tambem pode declarar os proprios tokens; isso e legitimo.
    for camada in CAMADAS:
        declarados.update(DECLARACAO.findall(ler(camada)))

    # O CSS inline do index.html conta como consumidor e como declarante.
    index = ler(RAIZ / "index.html")
    declarados.update(DECLARACAO.findall(index))

    sem_fallback: list[tuple[str, str]] = []
    com_fallback: list[tuple[str, str]] = []

    for camada in CAMADAS + [RAIZ / "index.html"]:
        conteudo = ler(camada)
        if not conteudo:
            continue
        nome = camada.name
        for token, virgula in USO.findall(conteudo):
            if token in declarados:
                continue
            if virgula:
                com_fallback.append((nome, token))
            else:
                sem_fallback.append((nome, token))

    print(f"tokens declarados: {len(declarados)}")
    print(f"arquivos de camada: {', '.join(c.name for c in CAMADAS)}\n")

    falhou = False

    if sem_fallback:
        falhou = True
        print(f"ORFAO SEM FALLBACK ({len(sem_fallback)}) — o valor sai vazio:")
        for arquivo, token in sorted(set(sem_fallback)):
            print(f"   {arquivo:16} {token}")
        print()

    if com_fallback:
        falhou = True
        unicos = sorted(set(com_fallback))
        print(
            f"ORFAO COM FALLBACK ({len(unicos)}) — nao quebra, mas a camada nao"
            " esta integrada:"
        )
        for arquivo, token in unicos:
            print(f"   {arquivo:16} {token}")
        print()

    if falhou:
        print("RESULTADO: REPROVADO — corrigir o nome do token ou declara-lo.")
        return 1

    print("RESULTADO: APROVADO — nenhuma referencia a token inexistente.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
