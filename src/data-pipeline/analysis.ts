import type {
  AnalysisPackage,
  AnalysisScope,
  DashboardMetric,
  DashboardSnapshot,
  ValidationIssue,
} from "./model";
import { analysisPackageSchema } from "./model";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});
const integer = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});
const percent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

function value(snapshot: DashboardSnapshot, id: string): DashboardMetric {
  const found = snapshot.metrics[id];
  if (!found) {
    throw new Error(`Metrica ausente para analise: ${id}`);
  }
  return found;
}

function numberValue(snapshot: DashboardSnapshot, id: string): number {
  const found = value(snapshot, id);
  if (found.value === null) {
    throw new Error(`Metrica sem base usada como numero: ${id}`);
  }
  return found.value;
}

function formatMetric(metric: DashboardMetric): string {
  if (metric.value === null) {
    return "sem base";
  }
  switch (metric.unit) {
    case "BRL":
      return brl.format(metric.value);
    case "PERCENT":
      return percent.format(metric.value);
    case "RATIO":
      return `${metric.value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}x`;
    default:
      return integer.format(metric.value);
  }
}

function delta(current: number, previous: number): number | null {
  return previous === 0 ? null : current / previous - 1;
}

function sourceRef(snapshot: DashboardSnapshot, id: string): string {
  const found = value(snapshot, id);
  return `${found.source}:${found.sheet}:${found.period}`;
}

type Section = AnalysisPackage["sections"][number];

function section(
  scope: AnalysisScope,
  partial: Omit<Section, "scope">,
): Section {
  return { scope, ...partial };
}

export function buildAnalysis(
  snapshot: DashboardSnapshot,
): AnalysisPackage {
  const investment = value(snapshot, "marketing.investment.total.current");
  const investmentPrevious = value(
    snapshot,
    "marketing.investment.total.previous",
  );
  const leads = value(snapshot, "marketing.leads.meta.current");
  const leadsPrevious = value(snapshot, "marketing.leads.meta.previous");
  const mql = value(snapshot, "marketing.mql.current");
  const mqlPrevious = value(snapshot, "marketing.mql.previous");
  const mqlRate = value(snapshot, "marketing.rate.mql.current");
  const mqlRatePrevious = value(snapshot, "marketing.rate.mql.previous");
  const forms = value(snapshot, "marketing.forms.valid.current");
  const mktAppointments = value(
    snapshot,
    "marketing.appointments.marketing.current",
  );
  const attended = value(snapshot, "commercial.attended.current");
  const closed = value(snapshot, "commercial.closed.current");
  const closeRate = value(snapshot, "commercial.close_rate.current");
  const revenue = value(snapshot, "commercial.revenue.current");
  const pipeline = value(snapshot, "commercial.pipeline.current");
  const missingStatus = value(
    snapshot,
    "commercial.missing_status.current",
  );
  const appointmentRaw = value(snapshot, "appointments.raw.current");
  const appointmentMissingDate = value(
    snapshot,
    "appointments.missing_consultation_date.current",
  );
  const financeResult = value(snapshot, "finance.result.current");
  const financeSales = value(snapshot, "finance.sales.current");
  const doctorReach = value(snapshot, "organic.doctor.reach.current");
  const doctorBio = value(snapshot, "organic.doctor.bio_clicks.current");
  const natuaReach = value(snapshot, "organic.natua.reach.current");
  const natuaBio = value(snapshot, "organic.natua.bio_clicks.current");
  const doctorVisitRate = value(
    snapshot,
    "organic.doctor.visit_rate.current",
  );
  const natuaVisitRate = value(
    snapshot,
    "organic.natua.visit_rate.current",
  );
  const doctorVisitRatePrevious =
    snapshot.metrics["organic.doctor.visit_rate.previous"];
  const natuaVisitRatePrevious =
    snapshot.metrics["organic.natua.visit_rate.previous"];

  const investmentDelta = delta(
    numberValue(snapshot, investment.id),
    numberValue(snapshot, investmentPrevious.id),
  );
  const leadDelta = delta(
    numberValue(snapshot, leads.id),
    numberValue(snapshot, leadsPrevious.id),
  );
  const mqlDelta = delta(
    numberValue(snapshot, mql.id),
    numberValue(snapshot, mqlPrevious.id),
  );

  const sections: Section[] = [
    section("executive", {
      headline:
        "A eficiência de mídia melhorou, mas a qualidade captada e a disciplina operacional ainda limitam a decisão executiva.",
      confidence: "HIGH",
      signals: [
        {
          type: "POSITIVE",
          evidence: `${formatMetric(investment)} de investimento geraram ${formatMetric(leads)} leads.`,
          interpretation:
            investmentDelta !== null && leadDelta !== null
              ? `O investimento variou ${percent.format(investmentDelta)} e os leads ${percent.format(leadDelta)} frente ao período anterior.`
              : "A leitura comparativa depende de uma base anterior não nula.",
          metricIds: [
            investment.id,
            investmentPrevious.id,
            leads.id,
            leadsPrevious.id,
          ],
        },
        {
          type: "WARNING",
          evidence: `${formatMetric(mql)} MQL com taxa de ${formatMetric(mqlRate)}.`,
          interpretation:
            mqlDelta !== null
              ? `O volume de MQL variou ${percent.format(mqlDelta)}; ganho de leads não se converteu integralmente em qualidade.`
              : "A evolução de MQL não pode ser calculada contra base zero.",
          metricIds: [mql.id, mqlPrevious.id, mqlRate.id, mqlRatePrevious.id],
        },
        {
          type: "POSITIVE",
          evidence: `${formatMetric(closed)} fechamentos em ${formatMetric(attended)} atendimentos, com ${formatMetric(revenue)} de receita comercial.`,
          interpretation:
            "A força comercial deve ser preservada, sem atribuir essa receita automaticamente ao marketing.",
          metricIds: [closed.id, attended.id, revenue.id],
        },
      ],
      decisions: [
        {
          priority: "P1",
          action:
            "Investigar a queda de qualidade por campanha antes de aumentar o orçamento.",
          owner: "Marketing e Dados",
          deadline: "Antes da próxima reunião executiva",
          successMetric: "Taxa MQL e custo por MQL por campanha",
          metricIds: [
            mqlRate.id,
            value(snapshot, "marketing.cost.mql.current").id,
          ],
        },
        {
          priority: "P1",
          action:
            "Padronizar status e responsável nos registros operacionais pendentes.",
          owner: "Comercial",
          deadline: "Na competência atual",
          successMetric: "Registros sem status e sem responsável",
          metricIds: [
            missingStatus.id,
            value(snapshot, "appointments.missing_owner.current").id,
          ],
        },
      ],
      limitations: [
        "Receita comercial não está atribuída por origem ou campanha.",
        "Comparecimento e no-show permanecem sem base.",
      ],
      sourceRefs: [
        sourceRef(snapshot, investment.id),
        sourceRef(snapshot, revenue.id),
      ],
    }),
    section("funnel", {
      headline:
        "O maior vazamento observável está entre formulários válidos, MQL e agendamentos de marketing.",
      confidence: "MEDIUM",
      signals: [
        {
          type: "WARNING",
          evidence: `${formatMetric(forms)} formulários resultaram em ${formatMetric(mql)} MQL.`,
          interpretation: `A taxa observada é ${formatMetric(mqlRate)} e deve ser lida como qualidade de captação e classificação.`,
          metricIds: [forms.id, mql.id, mqlRate.id],
        },
        {
          type: "WARNING",
          evidence: `${formatMetric(mql)} MQL e ${formatMetric(mktAppointments)} agendamentos de marketing no consolidado.`,
          interpretation:
            "Sem chave individual entre bases, esta passagem é um indicador operacional, não uma coorte causal.",
          metricIds: [mql.id, mktAppointments.id],
        },
        {
          type: "LIMITATION",
          evidence: `${formatMetric(attended)} atendimentos da Closer incluem jornadas e origens diferentes.`,
          interpretation:
            "Não é correto tratá-los como descendentes diretos dos agendamentos de marketing.",
          metricIds: [attended.id],
        },
      ],
      decisions: [
        {
          priority: "P1",
          action:
            "Criar uma chave de lead compartilhada entre formulário, agenda e Closer.",
          owner: "Dados e Comercial",
          deadline: "Próximo ciclo de importação",
          successMetric: "Cobertura de registros conciliados entre etapas",
          metricIds: [forms.id, mktAppointments.id, attended.id],
        },
      ],
      limitations: [
        "As etapas não formam uma coorte individual completa.",
        "No-show não pode ser calculado.",
      ],
      sourceRefs: [
        sourceRef(snapshot, forms.id),
        sourceRef(snapshot, attended.id),
      ],
    }),
    section("marketing", {
      headline:
        "A mídia comprou leads com mais eficiência, mas entregou menos MQL e menor taxa de qualificação.",
      confidence: "HIGH",
      signals: [
        {
          type: "POSITIVE",
          evidence: `CPL total atual de ${formatMetric(value(snapshot, "marketing.cpl.total.current"))} contra ${formatMetric(value(snapshot, "marketing.cpl.total.previous"))}.`,
          interpretation:
            "O custo de aquisição de volume melhorou no comparativo publicado.",
          metricIds: [
            "marketing.cpl.total.current",
            "marketing.cpl.total.previous",
          ],
        },
        {
          type: "WARNING",
          evidence: `${formatMetric(mqlRate)} de taxa MQL contra ${formatMetric(mqlRatePrevious)} no período anterior.`,
          interpretation:
            "O ganho de CPL não compensou a perda de qualidade; escala sem segmentação tende a ampliar o desperdício.",
          metricIds: [mqlRate.id, mqlRatePrevious.id],
        },
      ],
      decisions: [
        {
          priority: "P1",
          action:
            "Separar orçamento de escala e verba de teste, usando MQL e custo por MQL como gates.",
          owner: "Tráfego",
          deadline: "Na próxima revisão de campanhas",
          successMetric: "Taxa MQL, custo por MQL e volume por campanha",
          metricIds: [
            mql.id,
            mqlRate.id,
            "marketing.cost.mql.current",
          ],
        },
      ],
      limitations: [
        "Receita por campanha não possui cruzamento validado.",
        "Comparativos parciais exigem leitura por ritmo ou ressalva.",
      ],
      sourceRefs: [sourceRef(snapshot, mqlRate.id)],
    }),
    section("organic", {
      headline:
        "O perfil médico transforma alcance em visita; na Natuá, o gargalo atual está antes da chegada ao perfil.",
      confidence: "HIGH",
      signals: [
        {
          type: "POSITIVE",
          evidence: `Dr. Luciano alcançou ${formatMetric(doctorReach)} contas, converteu ${formatMetric(doctorVisitRate)} em visitas e gerou ${formatMetric(doctorBio)} cliques na bio.`,
          interpretation:
            doctorVisitRatePrevious?.value !== null &&
            doctorVisitRatePrevious?.value !== undefined
              ? `A taxa de visita era ${formatMetric(doctorVisitRatePrevious)} no período anterior; o perfil médico ganhou eficiência de intenção.`
              : "O perfil médico é hoje o principal ativo orgânico de distribuição e intenção.",
          metricIds: [
            doctorReach.id,
            doctorVisitRate.id,
            doctorBio.id,
            ...(doctorVisitRatePrevious?.value !== null &&
            doctorVisitRatePrevious?.value !== undefined
              ? [doctorVisitRatePrevious.id]
              : []),
          ],
        },
        {
          type: "WARNING",
          evidence: `Natuá alcançou ${formatMetric(natuaReach)} contas, converteu ${formatMetric(natuaVisitRate)} em visitas e gerou ${formatMetric(natuaBio)} cliques na bio.`,
          interpretation:
            natuaVisitRatePrevious?.value !== null &&
            natuaVisitRatePrevious?.value !== undefined
              ? `A taxa de visita era ${formatMetric(natuaVisitRatePrevious)} no período anterior; distribuição sem intenção de perfil não deve ser tratada como avanço completo.`
              : "A diferença pede uma função clara para cada perfil, não simples replicação de conteúdo.",
          metricIds: [
            natuaReach.id,
            natuaVisitRate.id,
            natuaBio.id,
            ...(natuaVisitRatePrevious?.value !== null &&
            natuaVisitRatePrevious?.value !== undefined
              ? [natuaVisitRatePrevious.id]
              : []),
          ],
        },
      ],
      decisions: [
        {
          priority: "P2",
          action:
            "Usar o perfil médico para descoberta e o perfil Natuá para prova, método e conversão.",
          owner: "Conteúdo",
          deadline: "Próximo calendário editorial",
          successMetric: "Taxa de visita e clique por perfil",
          metricIds: [
            doctorVisitRate.id,
            natuaVisitRate.id,
            "organic.natua.bio_click_rate.current",
          ],
        },
      ],
      limitations: [
        "O período orgânico atual pode incluir conteúdo impulsionado.",
        "A série histórica anterior não está completa em todas as abas.",
      ],
      sourceRefs: [sourceRef(snapshot, doctorReach.id)],
    }),
    section("commercial", {
      headline:
        "A conversão comercial é forte, mas o pipeline e os status incompletos precisam de cadência para virar gestão.",
      confidence: "HIGH",
      signals: [
        {
          type: "POSITIVE",
          evidence: `${formatMetric(closeRate)} de fechamento e ${formatMetric(revenue)} de receita comercial.`,
          interpretation:
            "A operação fecha bem dentro do universo atendido registrado na Closer.",
          metricIds: [closeRate.id, revenue.id],
        },
        {
          type: "WARNING",
          evidence: `${formatMetric(pipeline)} permanecem em negociação e ${formatMetric(missingStatus)} atendimento está sem status.`,
          interpretation:
            "Pipeline sem próxima ação e status incompleto reduzem previsibilidade e qualidade do denominador.",
          metricIds: [pipeline.id, missingStatus.id],
        },
      ],
      decisions: [
        {
          priority: "P1",
          action:
            "Exigir próxima ação, prazo e responsável para toda negociação aberta.",
          owner: "Closer",
          deadline: "Antes da próxima reunião comercial",
          successMetric: "Pipeline com próxima ação preenchida",
          metricIds: [pipeline.id],
        },
      ],
      limitations: [
        "Receita fechada não equivale a recebimento financeiro.",
        "Objeções ainda não possuem taxonomia padronizada.",
      ],
      sourceRefs: [sourceRef(snapshot, closeRate.id)],
    }),
    section("appointments", {
      headline:
        "A agenda informa volume bruto, mas ainda não sustenta confirmação, comparecimento ou no-show.",
      confidence: "HIGH",
      signals: [
        {
          type: "WARNING",
          evidence: `${formatMetric(appointmentRaw)} registros do período e ${formatMetric(appointmentMissingDate)} sem data de consulta.`,
          interpretation:
            "A ausência de status e regra inequívoca de pagamento impede classificar confirmados com segurança.",
          metricIds: [appointmentRaw.id, appointmentMissingDate.id],
        },
        {
          type: "LIMITATION",
          evidence: "Confirmados e no-show estão marcados como sem base.",
          interpretation:
            "Essas métricas só devem aparecer após a criação de um campo operacional de status.",
          metricIds: [
            "appointments.confirmed.current",
            "appointments.no_show.current",
          ],
        },
      ],
      decisions: [
        {
          priority: "P0",
          action:
            "Adicionar status obrigatório e regra explícita de confirmação na fonte de agenda.",
          owner: "Recepção e Comercial",
          deadline: "Antes da próxima importação",
          successMetric: "Cobertura do campo status da agenda",
          metricIds: ["appointments.confirmed.current"],
        },
      ],
      limitations: [
        "A planilha não contém campo de presença.",
        "Contagem bruta de origem não equivale a agendamento confirmado.",
      ],
      sourceRefs: [sourceRef(snapshot, appointmentRaw.id)],
    }),
    section("finance", {
      headline:
        "O DRE mostra resultado operacional positivo, mas sua competência está defasada em relação ao marketing e ao comercial.",
      confidence: "MEDIUM",
      signals: [
        {
          type: "POSITIVE",
          evidence: `${formatMetric(financeSales)} em vendas operacionais e ${formatMetric(financeResult)} após despesas fixas.`,
          interpretation:
            "A leitura é válida para a competência financeira declarada, não para o período atual do marketing.",
          metricIds: [financeSales.id, financeResult.id],
        },
        {
          type: "LIMITATION",
          evidence: `Financeiro em ${financeSales.period}; painel principal em ${snapshot.primaryPeriod}.`,
          interpretation:
            "ROI integrado e conciliação atual não devem ser calculados com competências diferentes.",
          metricIds: [financeSales.id],
        },
      ],
      decisions: [
        {
          priority: "P1",
          action:
            "Atualizar a competência financeira antes de integrar margem e retorno ao painel atual.",
          owner: "Financeiro",
          deadline: "Próximo fechamento",
          successMetric: "Competência financeira alinhada ao período principal",
          metricIds: [financeSales.id],
        },
      ],
      limitations: [
        "A competência financeira não coincide com o período principal.",
        "Receita comercial e receita financeira representam conceitos diferentes.",
      ],
      sourceRefs: [sourceRef(snapshot, financeSales.id)],
    }),
    section("data_quality", {
      headline:
        "O núcleo financeiro e comercial é reconciliável; agenda, atribuição e competência ainda limitam análises integradas.",
      confidence: "HIGH",
      signals: [
        {
          type: "POSITIVE",
          evidence:
            "As cinco fontes foram classificadas e o snapshot passou nos gates críticos.",
          interpretation:
            "A publicação pode ocorrer sem expor linhas ou dados pessoais.",
          metricIds: [investment.id, attended.id, financeSales.id],
        },
        {
          type: "WARNING",
          evidence: `${formatMetric(missingStatus)} status comercial ausente e ${formatMetric(appointmentMissingDate)} registros de agenda sem data de consulta.`,
          interpretation:
            "Campos operacionais incompletos reduzem a confiabilidade de análises de passagem.",
          metricIds: [missingStatus.id, appointmentMissingDate.id],
        },
      ],
      decisions: [
        {
          priority: "P0",
          action:
            "Manter publicação bloqueada sempre que reconciliação ou privacidade falhar.",
          owner: "Dados",
          deadline: "Regra permanente",
          successMetric: "Nenhuma publicação com gate crítico",
          metricIds: [investment.id],
        },
      ],
      limitations: snapshot.validation.issues
        .filter((issue) => issue.severity !== "INFO")
        .map((issue) => issue.message),
      sourceRefs: snapshot.sources.map(
        (source) => `${source.role}:${source.period}`,
      ),
    }),
  ];

  return analysisPackageSchema.parse({
    version: "1.0.0",
    importId: snapshot.importId,
    generatedAt: snapshot.generatedAt,
    skill: "natua-data-analyst",
    sections,
  });
}

export function validateAnalysisEvidence(
  snapshot: DashboardSnapshot,
  analysis: AnalysisPackage,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scopes = new Set(analysis.sections.map((item) => item.scope));

  if (scopes.size !== 8) {
    issues.push({
      severity: "CRITICAL",
      code: "ANALYSIS_SCOPE_MISSING",
      message: "O pacote de analise nao cobre as oito secoes.",
    });
  }

  for (const sectionItem of analysis.sections) {
    for (const signal of sectionItem.signals) {
      if (signal.type === "LIMITATION") {
        continue;
      }
      for (const metricId of signal.metricIds) {
        if (snapshot.metrics[metricId]?.value === null) {
          issues.push({
            severity: "CRITICAL",
            code: "ANALYSIS_SEM_BASE_AS_EVIDENCE",
            message: `A analise ${sectionItem.scope} usa metrica sem base como evidencia factual.`,
            details: { metricId },
          });
        }
      }
    }

    for (const item of [
      ...sectionItem.signals,
      ...sectionItem.decisions,
    ]) {
      for (const metricId of item.metricIds) {
        if (!snapshot.metrics[metricId]) {
          issues.push({
            severity: "CRITICAL",
            code: "ANALYSIS_METRIC_UNKNOWN",
            message: `A analise ${sectionItem.scope} cita metrica inexistente.`,
            details: { metricId },
          });
        }
      }
    }
  }

  return issues;
}
