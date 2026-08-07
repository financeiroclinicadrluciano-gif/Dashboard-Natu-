# Decisoes tecnicas

Registro das decisoes que mudam o produto, com o motivo e a evidencia que as
sustentou. Decisao sem motivo registrado volta a ser discutida a cada sessao.

---

## D1 — O motor de dados e deterministico; a IA nunca calcula

**Decisao.** Planilha vira numero por codigo. A camada de IA recebe o snapshot
ja validado e so interpreta.

**Motivo.** Elimina variacao de calculo entre fornecedores e impede que uma
resposta convincente seja confundida com dado auditado. `validateAnalysisEvidence`
rejeita a importacao se a analise citar numero que nao existe no snapshot.

---

## D2 — Metrica sem fonte fica `SEM_BASE`, nunca zero

**Decisao.** Denominador zero, coluna ausente ou criterio inexistente produzem
`value: null` e `status: "SEM_BASE"`, com justificativa.

**Motivo.** Zero e um numero. Ele desenha barra, entra em media e parece medido.
`SEM_BASE` nao. Em 2026-08 a categoria Ginecologicos tinha contagem de pacote e
nenhuma coluna de valor: publicar `R$ 0,00` teria afirmado que ela nao vendeu nada.

---

## D3 — O nome do arquivo nao e contrato

**Decisao.** Classificacao por assinatura de abas e cabecalhos.

**Motivo.** Os arquivos chegam com nomes diferentes toda semana
(`CLOSER_JULHO_VALIDADA (1).xlsx`). Amarrar ao nome quebra na primeira copia.

---

## D4 — A planilha semanal entra como sexta fonte, opcional

**Decisao.** `weekly` e um papel proprio, nao um segundo `closer`. As cinco
obrigatorias seguem bloqueando quando faltam; a semanal nao bloqueia.

**Motivo.** Ela traz o que nenhuma outra fonte fornece — comparecimento auditavel
e venda por categoria — mas o painel precisa continuar publicavel nas semanas em
que ela nao chega. `sources` passou de `.length(5)` para `.min(5).max(6)`.

---

## D5 — Taxonomia de canal fechada em 6 valores

**Decisao.** `FORMULARIO` · `TRAFEGO_PAGO` · `ORGANICO` · `BIO` · `INDICACAO` ·
`RECORRENCIA`. Campanha e campo separado. Canal desconhecido gera issue e sai dos
recortes. **Nao existe bucket "outros".**

**Motivo.** Havia 11 grafias para 5 canais reais. Agregar texto livre produz numero
errado com aparencia de certo. Bucket generico esconderia o erro em vez de mostra-lo.

**Consequencia deliberada.** `RECORRENCIA` fica fora do denominador de aquisicao —
contar recompra como CAC infla o resultado do marketing.

---

## D6 — Reconciliacao detalhe x pivo e gate, nao conveniencia

**Decisao.** 13 baterias comparam o bloco de detalhe com o bloco de totais da
propria planilha. Divergencia acima de R$ 0,01 e `CRITICAL`.

**Motivo.** A planilha cola os totais na mesma aba. Um leitor ingenuo contaria 34
"pacientes" em vez de 23, somando `TOTAL GERAL`, `%` e o cabecalho do pivo.
Publicar numero que nao fecha com o proprio arquivo e pior do que nao publicar.

**Evidencia.** Quatro baterias de sabotagem reprovam leitura ingenua: pivo sem
linha em branco, `TOTAL` no meio do detalhe, um centavo alterado no total e
contagem de pacote trocada.

---

## D7 — Os 30 numeros do fechamento viram teste de regressao

**Decisao.** `tests/baselines/fechamento-2026-07.json` congela o fechamento
`01-28/07`. `tests/pipeline-e2e.test.ts` regenera o snapshot a partir das
planilhas brutas e confere os 30.

**Motivo.** Ate 2026-08-07 a unica prova de que o painel continuava certo era
alguem reconferir a mao. Comparar o snapshot publicado com o baseline nao bastaria:
se o publicador estivesse errado, os dois estariam errados juntos.

**Regra.** Numero que muda porque a fonte mudou exige **novo fechamento aprovado**
e edicao explicita do baseline. Editar o baseline para o teste passar inverte o
proposito do gate.

---

## D8 — A aplicacao React com mocks foi removida

**Decisao.** `src/App.tsx`, `src/main.tsx`, `src/components/`, `src/data/mockData.ts`,
`src/types.ts` e `src/index.css` foram deletados. `src/data-pipeline/` permaneceu.

**Motivo.** Aquele app montava em `#root`, um elemento que **nunca existiu** no
`index.html`. Ele nunca renderizou e nunca entrou no bundle — verificado: o build
gera `dist/index.html` e zero asset React. Era codigo morto carregando 199 linhas
de pacientes ficticios, KPIs fixos (`619` leads, `R$ 118.135,13`), paleta roxo e
laranja que o brief proibe, e a marca errada ("Natuamed Spa") — tudo num
repositorio publico.

**Consequencia.** As dependencias de UI sairam do `package.json`: 230 pacotes
caíram para 112. O historico continua no Git.

**O que isso NAO resolve.** O painel e uma pagina estatica que le o snapshot em
tempo de execucao. A area administrativa de upload com previa e historico
(brief §5) precisara de uma camada de UI. Quando ela for construida, sera sobre o
snapshot real desde a primeira linha — nunca sobre mock.

---

## D9 — O gate de arquivos proibidos olha o git, nao o disco

**Decisao.** `scripts/check-forbidden-files.sh` inspeciona `git ls-files` e
`git grep`, nao o sistema de arquivos.

**Motivo.** `.gitignore` protege o futuro; ele nao desfaz o que ja foi commitado.
Um gate que olhasse o disco passaria justamente no caso que importa.

---

## D10 — Telefone so casa com separador ou aspas

**Decisao.** O padrao de telefone exige separador (`(41) 99876-5432`) ou aspas
delimitando digitos puros (`"41999876543"`).

**Motivo.** A primeira versao do gate usava um padrao frouxo e bloqueou o estado
limpo: casou com `03902638462`, que e a casa decimal de uma taxa de conversao.
Gate que grita no caso certo e ruido, e ruido treina todo mundo a ignorar o gate.
Metrica e numero JSON; telefone e string.

---

## D11 — Duas fontes de verdade para o fechamento foram reconciliadas, nao fundidas

**Decisao.** Documentos de junho registram 1.378 formularios / 197 MQL; a planilha
final vigente usa 1.428 / 204. A planilha recebe precedencia operacional; o
baseline textual antigo permanece marcado como historico.

**Motivo.** Sobrescrever silenciosamente destruiria a rastreabilidade da
divergencia. Ver `docs/handoff-chatgpt/07_DIVERGENCIAS_E_DADOS_SUPERADOS.md`.

---

## D12 — A lista "o que o painel nao calcula" e prosa fixa · **DIVIDA CONHECIDA**

**Situacao.** A tela de qualidade de dados lista em texto fixo o que o painel se
recusa a calcular, e um dos itens e *"No-show e comparecimento — nenhuma base tem
campo de presenca"*.

**O que mudou.** Com a fonte `weekly`, comparecimento passou a ter base auditavel
(`weekly.attendance_rate`). A frase continua correta para o snapshot publicado hoje,
que tem 5 fontes — e fica **errada no instante em que um snapshot com a semanal for
publicado**.

**Por que nao foi corrigido agora.** Trocar a prosa por outra prosa so adia o
problema: a lista precisa ser derivada das metricas `SEM_BASE` do proprio snapshot,
como o resto do painel ja faz. Isso e uma mudanca no `index.html` que merece ser
feita junto com a tela de importacao, nao de improviso.

**Como isso nao passa despercebido.** Registrado aqui e no PR. A correcao certa e
renderizar a lista a partir de `metrics[*].status === "SEM_BASE"` + `note`.

---

## D13 — Support nao e receita comercial

**Decisao.** `commercial.revenue` vem da Closer validada. Movimentacoes do Support
nunca a substituem.

**Motivo.** Em 28/07, Support marcava R$ 293.136,89 e a Closer R$ 244.512,10. A
diferenca e conceitual: o Support pode conter pagamento de negociacao ou de
paciente de outro momento. Somar os dois conceitos infla a receita do periodo.
