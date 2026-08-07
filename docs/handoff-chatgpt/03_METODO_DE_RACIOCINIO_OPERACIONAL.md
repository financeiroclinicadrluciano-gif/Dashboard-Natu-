# MÉTODO DE RACIOCÍNIO OPERACIONAL

Este documento descreve como analisar o projeto de forma reproduzível. Ele substitui a necessidade de qualquer “raciocínio oculto” de uma IA.

## Sequência mental padrão

### Passo 1 — Definir o objeto
Perguntar internamente: qual métrica está sendo atualizada? Qual período? Qual conta? Qual escopo de campanha? É parcial ou fechamento?

### Passo 2 — Identificar a fonte que tem autoridade
Usar a hierarquia do Manual. Uma fonte mais baixa não substitui silenciosamente uma mais alta.

### Passo 3 — Testar equivalência conceitual
Antes de comparar dois números, verificar se representam o mesmo conceito.
Exemplos de erros que devem ser bloqueados:
- Resultados Meta vs Leads Meta;
- Leads Meta vs formulários válidos;
- agendamentos vs comparecimentos;
- tratamentos fechados vs caixa recebido;
- alcance único vs soma de alcance diário.

### Passo 4 — Testar equivalência temporal
Numerador e denominador precisam cobrir o mesmo período. Se um arquivo começa em 02/07, não inventar 01/07; preservar o fechamento aprovado anterior ou deixar pendente.

### Passo 5 — Limpar e normalizar
- remover testes;
- normalizar telefone;
- padronizar datas;
- normalizar nomes/IDs somente para matching, preservando o dado original;
- deduplicar conforme a chave aprovada.

### Passo 6 — Reconciliar
Criar pontes entre fontes:
- Meta leads ↔ formulários auditáveis;
- formulários ↔ MQL;
- agendamentos ↔ origem;
- comparecimentos ↔ Closer;
- fechamentos ↔ receita;
- Support ↔ caixa, sem substituir Closer.

### Passo 7 — Calcular explicitamente
Toda métrica derivada deve poder ser reexecutada. Guardar numerador, denominador e resultado.

### Passo 8 — Classificar a certeza
- CONFIRMADO: número direto da fonte correta ou manual confirmado.
- CÁLCULO: derivação exata de números confirmados.
- INFERÊNCIA: leitura analítica que não é dado bruto.
- PENDÊNCIA: falta uma fonte ou reconciliação.

### Passo 9 — Não “corrigir” conflito por intuição
Se duas fontes diferem, registrar o conflito. Se a hierarquia resolver, usar a fonte superior e manter a divergência documentada. Se não resolver, interromper o cálculo afetado.

### Passo 10 — Preservar arquivo e layout
Alterar apenas o necessário. Em julho, o layout manual do usuário é parte da regra operacional.

### Passo 11 — Validar
- fórmulas;
- formatação monetária/percentual/x;
- ausência de #REF!, #VALUE!, #DIV/0!, #N/A, #NAME?;
- inspeção visual;
- coerência das somas.

## Pseudocódigo
```text
para cada KPI solicitado:
    resolver período e escopo
    escolher fonte oficial
    obter número bruto
    se houver conflito:
        registrar conflito
        aplicar hierarquia ou marcar pendência
    se KPI for derivado:
        validar numerador e denominador
        calcular
    marcar status = confirmado | cálculo | inferência | pendência

antes de entregar:
    reconciliar totais
    verificar duplicidades
    verificar fórmulas
    revisar visual
    salvar nova versão
    atualizar log e baseline
```

## Regra de prudência
Na dúvida entre “preencher” e “deixar vazio”, deixar vazio e registrar a pendência. O custo de um campo em branco é menor que o custo de um KPI incorreto.
