import json, collections, sys
snap=json.load(open('public/data/dashboard-snapshot.json'))
m=snap['metrics']
UN={'COUNT':'quantidade','BRL':'moeda (BRL)','PERCENT':'percentual','RATIO':'multiplo (x)','DAYS':'dias'}
SRC={'marketing':'Relatorio de marketing','closer':'Closer validada','appointments':'Agendamentos',
     'form':'Formulario/CRM','finance':'Financeiro (DRE + BASE)','weekly':'Planilha semanal'}
by=collections.defaultdict(list)
for k,v in sorted(m.items()): by[v['source']].append(v)
out=[]
out.append("# Dicionario de metricas\n")
out.append("> **Gerado a partir de `public/data/dashboard-snapshot.json`**, nao escrito a mao.")
out.append("> Metrica que nao existe no snapshot nao aparece aqui; metrica nova aparece sozinha")
out.append("> na proxima geracao. Regenerar com `npm run docs:metricas`.\n")
out.append(f"Snapshot de referencia: `{snap['importId']}` · periodo `{snap['primaryPeriod']}` · {len(m)} metricas.\n")
out.append("## Como ler\n")
out.append("| Coluna | Significado |")
out.append("|---|---|")
out.append("| **ID** | chave estavel; e por ela que a UI e os testes referenciam a metrica |")
out.append("| **Unidade** | `quantidade`, `moeda (BRL)`, `percentual`, `multiplo (x)` ou `dias`. ROI e multiplo, nunca percentual |")
out.append("| **Formula** | vazio = valor lido direto da fonte; preenchido = calculado a partir das dependencias |")
out.append("| **Estado** | `VALIDATED` tem fonte auditavel · `SEM_BASE` nao tem e **nao pode ser estimada** |")
out.append("| **Aba** | a aba exata de onde o numero saiu |\n")
sb=collections.Counter(v['status'] for v in m.values())
out.append(f"Estado atual: **{sb.get('VALIDATED',0)} VALIDATED · {sb.get('WARNING',0)} WARNING · {sb.get('SEM_BASE',0)} SEM_BASE**.\n")
out.append("---\n")
for src in ['marketing','closer','appointments','form','finance','weekly']:
    if src not in by: continue
    out.append(f"## Fonte: {SRC[src]} (`{src}`) — {len(by[src])} metricas\n")
    out.append("| ID | Rotulo | Unidade | Formula | Estado | Aba |")
    out.append("|---|---|---|---|---|---|")
    for v in by[src]:
        f=(v.get('formula') or '').replace('|','\\|') or '—'
        note=' ⚠️' if v['status']=='SEM_BASE' else ''
        out.append(f"| `{v['id']}` | {v['label']} | {UN.get(v['unit'],v['unit'])} | `{f}` | {v['status']}{note} | {v['sheet']} |")
    out.append("")
sem=[v for v in m.values() if v['status']=='SEM_BASE']
if sem:
    out.append("---\n\n## Metricas SEM_BASE — e por que continuam assim\n")
    out.append("Nenhuma destas pode ser preenchida por estimativa. Sem fonte auditavel, o valor e `null`.\n")
    out.append("| ID | Motivo declarado |")
    out.append("|---|---|")
    for v in sorted(sem,key=lambda x:x['id']):
        out.append(f"| `{v['id']}` | {v.get('note') or 'Sem justificativa registrada — corrigir no adaptador.'} |")
    out.append("")
out.append("---\n")
out.append("Regras de calculo que governam esta tabela: `docs/contrato-de-dados.md`.")
out.append("Cobertura contra os indicadores pedidos pelos setores: `docs/cobertura-indicadores.md`.")
open('docs/dicionario-de-metricas.md','w').write("\n".join(out)+"\n")
print(f"gerado: {len(m)} metricas, {sb.get('SEM_BASE',0)} SEM_BASE")
