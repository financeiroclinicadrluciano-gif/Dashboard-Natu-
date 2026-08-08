# Manual da atualização semanal

Escrito para quem vai atualizar o painel toda semana, sem depender de conhecimento
técnico. A parte técnica está no fim, para quem precisar.

---

## 1. Como acessar

Na máquina autorizada, abra o terminal na pasta do projeto e rode:

```bash
npm run dev
```

Abra `http://127.0.0.1:3000` no navegador. O painel abre com os dados da última
atualização publicada.

**Se for a primeira vez nesta máquina**, rode `npm ci` uma vez antes.

---

## 2. Quais arquivos enviar

Cinco planilhas, sempre. Uma sexta é opcional.

| # | Planilha | Como reconhecer |
|---|---|---|
| 1 | **Marketing** | tem as abas `MARKETING <mês>`, `TRÁFEGO <mês>` e `ORGÂNICO <mês>` |
| 2 | **Closer** | uma aba por profissional + uma aba `DASHBOARD` |
| 3 | **Agendamentos** | colunas de origem, profissional, data de agendamento e data da consulta |
| 4 | **Formulário** | export do CRM, com data de criação e status do lead |
| 5 | **Financeiro** | tem as abas `REL DRE` e `BASE` |
| 6 | **Semanal** *(opcional)* | a planilha que o time preenche durante a semana, com os pacotes por paciente |

**O nome do arquivo não importa.** O sistema reconhece cada planilha pelo conteúdo.
Pode mandar `Closer (3) final v2.xlsx` — ele identifica sozinho.

**O que importa:** não mandar duas planilhas do mesmo tipo. Se mandar duas Closer,
o sistema para e avisa. Ele não escolhe qual é a certa.

---

## 3. Como conferir o período

Antes de publicar, rode a conferência. **Ela não altera nada:**

```bash
npm run dashboard:update:check -- /caminho/das/planilhas
```

Confira na saída:

- **Período principal** — precisa ser o mês que você quer atualizar.
- **Período de cada fonte** — o financeiro costuma ficar um mês atrás. Isso gera
  aviso, não erro.
- **Total de registros por fonte** — um número muito diferente da semana passada
  é sinal de arquivo errado ou recorte errado.

---

## 4. Como interpretar os alertas

Existem dois tipos. A diferença entre eles é a única coisa que você precisa saber.

### 🔴 BLOQUEIO — não publica, e está certo não publicar

O sistema recusa e mantém o painel anterior no ar.

| Alerta | O que fazer |
|---|---|
| Arquivo não reconhecido | conferir se você mandou a planilha certa e se alguma aba foi renomeada |
| Fonte duplicada | remover a cópia antiga da pasta |
| Falta uma das 5 fontes | mandar a que faltou |
| A planilha semanal não fecha com os próprios totais | conferir se alguém editou o detalhe sem atualizar o bloco de totais |
| Dado pessoal detectado na saída | **parar e avisar quem cuida do sistema.** Não tente contornar |

### 🟡 AVISO — publica, mas fica registrado na tela de qualidade

| Alerta | O que significa |
|---|---|
| Atendimento sem status na Closer | alguém não preencheu FECHOU/NÃO FECHOU/NEGOCIAÇÃO. O paciente **continua contando** como atendido |
| Financeiro defasado | a competência do financeiro é anterior ao mês do painel |
| Comparecimento sem base auditável | a fonte não tem como provar quem compareceu |
| Canal fora da taxonomia | alguém escreveu uma origem nova na planilha semanal. O paciente conta no total, mas fica de fora dos gráficos por canal |
| Categoria sem coluna de receita | a categoria aparece com quantidade e sem faturamento |

**Aviso não é erro.** Ele existe para você saber o que está incompleto, não para
travar a semana.

---

## 5. Como publicar

Depois que a conferência estiver limpa:

```bash
scripts/publish-dashboard.sh /caminho/das/planilhas
```

Esse é o caminho seguro. Ele exige que você esteja na branch `main`, sem alterações
pendentes, e roda os testes e o build antes de publicar. Se qualquer um falhar,
ele para.

**Pela interface:** clique em `Atualizar dados`, selecione as planilhas e pressione
Enter. Isso só publica de verdade se `DASHBOARD_AUTO_PUBLISH=true` estiver
configurado nessa máquina. Sem isso, ele atualiza só localmente e informa
`PUBLISHED_LOCAL`.

---

## 6. Como corrigir uma importação

**Publicou com o arquivo errado?** Não tente editar o painel. Corrija a planilha
e publique de novo — a nova publicação substitui a anterior e o histórico é
preservado.

**Um número está errado e a planilha está certa?** Aí é problema de leitura, não
de dado. Avise quem cuida do sistema com: qual número, qual planilha, qual aba.
Não ajuste a planilha para "consertar" o painel — isso quebra a reconciliação e o
erro volta na semana seguinte, escondido.

---

## 7. Como restaurar a versão anterior

```bash
npm run dashboard:rollback
```

Volta para a última versão aprovada, revalida e troca a ativa. **Nada é apagado** —
o histórico continua inteiro.

Para publicar o rollback:

```bash
npm run dashboard:rollback -- --publish
```

---

## 8. Critério de pronto

A atualização da semana só está pronta quando **todos** estes forem verdade:

- [ ] as 5 fontes obrigatórias foram classificadas;
- [ ] o período principal é o mês que você queria atualizar;
- [ ] nenhum alerta 🔴 aparece;
- [ ] todo alerta 🟡 foi lido e você sabe o que ele significa;
- [ ] as métricas sem fonte continuam marcadas como `SEM_BASE`, e não como zero;
- [ ] nenhum dado pessoal apareceu na saída;
- [ ] testes e build passaram;
- [ ] **você abriu o painel no navegador e viu os números novos.**

O último item não é formalidade. Publicado não é funcionando: enquanto ninguém
abriu a página, a atualização é `RASCUNHO`.

---

## Estados da importação

| Estado | Significado |
|---|---|
| `RECEIVED` | arquivos recebidos e identificados |
| `VALIDATING` | extração e reconciliação em andamento |
| `REJECTED` | um bloqueio falhou; a versão pública foi preservada |
| `APPROVED` | snapshot candidato válido |
| `PUBLISHED` | snapshot ativo, testes e build aprovados |
| `ROLLED_BACK` | versão anterior restaurada |

---

## Referência técnica

### Comandos

```bash
npm run dashboard:update:check -- /caminho    # confere, não escreve nada
npm run dashboard:update -- /caminho          # grava local
npm run dashboard:update -- /caminho --publish  # grava, testa, publica
npm run dashboard:rollback                    # volta uma versão
scripts/publish-dashboard.sh /caminho         # fluxo completo com todas as travas
```

### Falhas de publicação e o que fazer

| Falha | Ação |
|---|---|
| branch diferente de `main` | trocar para `main`, sincronizar e repetir. **Nunca forçar push** |
| worktree com alterações | concluir ou reverter as alterações antes da importação automática |
| divergência Marketing × Formulário | corrigir classificação ou período na fonte |
| PII detectada na saída | bloquear, revisar o adaptador, **nunca publicar** |

### O que o commit de publicação pode conter

Apenas três arquivos:

- `public/data/dashboard-snapshot.json`
- `public/data/dashboard-snapshot.js`
- `public/data/analysis-package.json`

Planilha, linha bruta e dado de paciente **nunca** entram. O CI bloqueia se
entrarem (`scripts/check-forbidden-files.sh`).
