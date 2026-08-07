import type {
  DashboardMetric,
  DashboardSnapshot,
  ValidationIssue,
} from "./model";

/**
 * Validacao logica do snapshot.
 *
 * Os gates que ja existiam olhavam a FORMA do dado: fonte presente, aba presente,
 * schema valido, sem PII. Nenhum deles olhava se os numeros fazem sentido entre si.
 * Um snapshot podia declarar CPL de R$ 17,00 com investimento de R$ 24.497,75 e
 * 1.441 leads — contas que dao R$ 17,00 — ou dar R$ 99,00 e passar igual.
 *
 * Aqui os numeros sao conferidos uns contra os outros. Tres familias:
 *
 * 1. IDENTIDADE — a metrica derivada tem que bater com a propria formula.
 *    Falha e CRITICAL: se `cpl != investimento / leads`, um dos tres esta errado.
 * 2. DOMINIO — taxa entre 0 e 1, dinheiro nao negativo, contagem inteira.
 *    Falha e CRITICAL: valor fora do dominio nao e "estranho", e impossivel.
 * 3. CONTINENCIA — subconjunto nunca maior que o conjunto (fechados <= atendidos).
 *    Falha e CRITICAL pelo mesmo motivo.
 *
 * Uma quarta familia, SERIE, compara meses e emite WARNING: variacao de 10x pode
 * ser real (a Natua dobrou investimento de abril para maio). Nao bloqueia, avisa.
 *
 * A tolerancia relativa de 0,5% existe porque as planilhas guardam valores ja
 * arredondados. Exigir igualdade de ponto flutuante reprovaria dado correto — e
 * gate que grita no caso certo e ruido.
 */

const RELATIVE_TOLERANCE = 0.005;
const ABSOLUTE_TOLERANCE = 0.01;

/**
 * Linhas do DRE que seguem a convencao contabil de custo negativo: deducoes,
 * custo variavel e despesas fixas entram com sinal negativo para que
 * `resultado = vendas + deducoes + custo + despesas` seja uma soma simples.
 *
 * Para elas, negativo e o esperado — e POSITIVO e que e anomalia, porque
 * inverteria o sinal na soma do resultado. As taxas derivadas herdam o sinal.
 *
 * A primeira versao deste gate exigia dinheiro nao negativo em tudo e reprovou
 * o financeiro correto em seis linhas. Gate que grita no caso certo e ruido.
 */
const SIGNED_COST_METRICS = new Set([
  "finance.deductions.current",
  "finance.variable_cost.current",
  "finance.fixed_expenses.current",
  "finance.deductions_rate.current",
  "finance.variable_cost_rate.current",
  "finance.fixed_expenses_rate.current",
]);

function valueOf(
  metrics: Record<string, DashboardMetric>,
  id: string,
): number | null {
  const found = metrics[id];
  return found && found.value !== null ? found.value : null;
}

function withinTolerance(actual: number, expected: number): boolean {
  const scale = Math.max(Math.abs(expected), Math.abs(actual), 1);
  return Math.abs(actual - expected) <= Math.max(
    ABSOLUTE_TOLERANCE,
    scale * RELATIVE_TOLERANCE,
  );
}

interface Identity {
  /** Metrica que deve ser igual ao resultado da conta. */
  target: string;
  /** Numerador e denominador, nesta ordem. */
  numerator: string;
  denominator: string;
  label: string;
}

/**
 * Toda metrica derivada publicada com formula. Se o painel mostra os tres
 * numeros, os tres tem que fechar entre si.
 */
const IDENTITIES: Identity[] = [
  {
    target: "marketing.cpl.total.current",
    numerator: "marketing.investment.total.current",
    denominator: "marketing.leads.meta.current",
    label: "CPL total = investimento total / leads Meta",
  },
  {
    target: "marketing.cost.mql.current",
    numerator: "marketing.investment.leadgen.current",
    denominator: "marketing.mql.current",
    label: "Custo por MQL = investimento leadgen / MQL",
  },
  {
    target: "marketing.rate.mql.current",
    numerator: "marketing.mql.current",
    denominator: "marketing.forms.valid.current",
    label: "Taxa de MQL = MQL / formularios validos",
  },
  {
    target: "marketing.cac.appointment.current",
    numerator: "marketing.investment.total.current",
    denominator: "marketing.appointments.marketing.current",
    label: "CAC = investimento total / agendamentos de marketing",
  },
  {
    target: "marketing.roi.consultation.current",
    numerator: "marketing.first_consultation.revenue.current",
    denominator: "marketing.investment.total.current",
    label: "ROI de consultas = receita de 1a consulta / investimento",
  },
  {
    target: "marketing.roi.treatments.current",
    numerator: "marketing.first_patient.treatments.current",
    denominator: "marketing.investment.total.current",
    label: "ROI de tratamentos = tratamentos de 1a consulta / investimento",
  },
  {
    target: "commercial.close_rate.current",
    numerator: "commercial.closed.current",
    denominator: "commercial.attended.current",
    label: "Conversao comercial = fechados / atendidos",
  },
  {
    target: "commercial.ticket_attended.current",
    numerator: "commercial.revenue.current",
    denominator: "commercial.attended.current",
    label: "Ticket por atendido = receita fechada / atendidos",
  },
  {
    target: "commercial.ticket_closed.current",
    numerator: "commercial.revenue.current",
    denominator: "commercial.closed.current",
    label: "Ticket por fechado = receita fechada / fechados",
  },
  {
    target: "weekly.ticket_average.current",
    numerator: "weekly.revenue.current",
    denominator: "weekly.attended.current",
    label: "Ticket medio semanal = faturamento / atendimentos",
  },
];

/** Subconjunto que nunca pode superar o conjunto. */
const CONTAINMENTS: Array<{ part: string; whole: string; label: string }> = [
  {
    part: "commercial.closed.current",
    whole: "commercial.attended.current",
    label: "fechados nao podem superar atendidos",
  },
  {
    part: "commercial.negotiating.current",
    whole: "commercial.attended.current",
    label: "pacientes em negociacao nao podem superar atendidos",
  },
  {
    part: "marketing.mql.current",
    whole: "marketing.forms.valid.current",
    label: "MQL nao pode superar formularios validos",
  },
  {
    part: "marketing.appointments.marketing.current",
    whole: "appointments.raw.current",
    label: "agendamentos de marketing nao podem superar o total de agendamentos",
  },
  {
    part: "weekly.acquisition.attended.current",
    whole: "weekly.attended.current",
    label: "atendimentos de aquisicao nao podem superar o total da semana",
  },
  {
    part: "weekly.attended.current",
    whole: "commercial.attended.current",
    label: "a semana nao pode ter mais atendimentos que o mes",
  },
];

/** Partes que somadas tem que reproduzir o todo. */
const COMPOSITIONS: Array<{ parts: string[]; whole: string; label: string }> = [
  {
    parts: [
      "marketing.investment.meta.current",
      "marketing.investment.google.current",
    ],
    whole: "marketing.investment.total.current",
    label: "investimento Meta + Google = investimento total",
  },
  {
    parts: [
      "commercial.closed.current",
      "commercial.negotiating.current",
      "commercial.not_closed.current",
      "commercial.missing_status.current",
    ],
    whole: "commercial.attended.current",
    label:
      "fechados + negociacao + nao fechados + sem status = atendidos",
  },
];

function checkIdentities(
  metrics: Record<string, DashboardMetric>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const identity of IDENTITIES) {
    const actual = valueOf(metrics, identity.target);
    const numerator = valueOf(metrics, identity.numerator);
    const denominator = valueOf(metrics, identity.denominator);

    // Metrica ausente ou SEM_BASE nao e violacao: e ausencia declarada.
    // Denominador zero tem gate proprio no contrato de dados.
    if (actual === null || numerator === null || !denominator) {
      continue;
    }

    const expected = numerator / denominator;
    if (!withinTolerance(actual, expected)) {
      issues.push({
        severity: "CRITICAL",
        code: "LOGIC_IDENTITY_BROKEN",
        message: `Numeros nao fecham entre si: ${identity.label}.`,
        details: {
          metric: identity.target,
          publicado: actual,
          calculado: Number(expected.toFixed(6)),
          numerador: numerator,
          denominador: denominator,
        },
      });
    }
  }
  return issues;
}

function checkDomains(
  metrics: Record<string, DashboardMetric>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const item of Object.values(metrics)) {
    if (item.value === null) {
      continue;
    }

    if (!Number.isFinite(item.value)) {
      issues.push({
        severity: "CRITICAL",
        code: "LOGIC_VALUE_NOT_FINITE",
        message: `Valor nao finito em ${item.id}.`,
        source: item.source,
        details: { metric: item.id },
      });
      continue;
    }

    const signedCost = SIGNED_COST_METRICS.has(item.id);

    // Taxa acima de 100% quase sempre significa denominador errado. O gate
    // aceita ate 1 exato; 1,0000001 de ponto flutuante entra na tolerancia.
    // Taxas de custo do DRE sao conferidas pelo limite inferior invertido.
    if (item.unit === "PERCENT") {
      const low = signedCost ? -1 - ABSOLUTE_TOLERANCE : -ABSOLUTE_TOLERANCE;
      const high = signedCost ? ABSOLUTE_TOLERANCE : 1 + ABSOLUTE_TOLERANCE;
      if (item.value < low || item.value > high) {
        issues.push({
          severity: "CRITICAL",
          code: "LOGIC_RATE_OUT_OF_RANGE",
          message: signedCost
            ? `Taxa de custo com sinal invertido em ${item.id}; a convencao do DRE e negativa.`
            : `Taxa fora do intervalo 0–100% em ${item.id}.`,
          source: item.source,
          details: { metric: item.id, value: item.value },
        });
      }
    }

    if (item.unit === "BRL") {
      // Linha de custo POSITIVA e o erro: ela inverteria o sinal na soma do
      // resultado e o DRE fecharia com lucro inflado.
      if (signedCost && item.value > ABSOLUTE_TOLERANCE) {
        issues.push({
          severity: "CRITICAL",
          code: "LOGIC_COST_SIGN_FLIPPED",
          message: `Linha de custo com sinal invertido em ${item.id}; a convencao do DRE e negativa.`,
          source: item.source,
          details: { metric: item.id, value: item.value },
        });
      } else if (!signedCost && item.value < 0) {
        issues.push({
          severity: "CRITICAL",
          code: "LOGIC_NEGATIVE_MONEY",
          message: `Valor monetario negativo em ${item.id}.`,
          source: item.source,
          details: { metric: item.id, value: item.value },
        });
      }
    }

    if (item.unit === "COUNT") {
      if (item.value < 0) {
        issues.push({
          severity: "CRITICAL",
          code: "LOGIC_NEGATIVE_COUNT",
          message: `Contagem negativa em ${item.id}.`,
          source: item.source,
          details: { metric: item.id, value: item.value },
        });
      } else if (!Number.isInteger(item.value)) {
        issues.push({
          severity: "WARNING",
          code: "LOGIC_FRACTIONAL_COUNT",
          message: `Contagem fracionaria em ${item.id}; confira se a celula e uma media.`,
          source: item.source,
          details: { metric: item.id, value: item.value },
        });
      }
    }

    if (item.unit === "RATIO" && item.value < 0) {
      issues.push({
        severity: "CRITICAL",
        code: "LOGIC_NEGATIVE_RATIO",
        message: `Multiplo negativo em ${item.id}.`,
        source: item.source,
        details: { metric: item.id, value: item.value },
      });
    }
  }
  return issues;
}

function checkContainments(
  metrics: Record<string, DashboardMetric>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const rule of CONTAINMENTS) {
    const part = valueOf(metrics, rule.part);
    const whole = valueOf(metrics, rule.whole);
    if (part === null || whole === null) {
      continue;
    }
    if (part > whole + ABSOLUTE_TOLERANCE) {
      issues.push({
        severity: "CRITICAL",
        code: "LOGIC_CONTAINMENT_BROKEN",
        message: `Subconjunto maior que o conjunto: ${rule.label}.`,
        details: {
          parte: rule.part,
          valorParte: part,
          todo: rule.whole,
          valorTodo: whole,
        },
      });
    }
  }
  return issues;
}

function checkCompositions(
  metrics: Record<string, DashboardMetric>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const rule of COMPOSITIONS) {
    const values = rule.parts.map((id) => valueOf(metrics, id));
    const whole = valueOf(metrics, rule.whole);
    if (whole === null || values.some((value) => value === null)) {
      continue;
    }
    const sum = values.reduce<number>((total, value) => total + (value ?? 0), 0);
    if (!withinTolerance(sum, whole)) {
      issues.push({
        severity: "CRITICAL",
        code: "LOGIC_COMPOSITION_BROKEN",
        message: `As partes nao somam o todo: ${rule.label}.`,
        details: {
          soma: Number(sum.toFixed(2)),
          todo: whole,
          diferenca: Number((sum - whole).toFixed(2)),
        },
      });
    }
  }
  return issues;
}

/**
 * Breakdowns publicados com participacao percentual precisam somar 100%. Um
 * profissional faltando na lista nao dispara nenhum outro gate — o total do
 * painel continua certo e o grafico fica errado em silencio.
 */
function checkShares(snapshot: DashboardSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [key, rows] of Object.entries(snapshot.breakdowns)) {
    const shares = rows
      .map((row) => row.share)
      .filter((value): value is number => typeof value === "number");
    if (shares.length !== rows.length || !shares.length) {
      continue;
    }
    const total = shares.reduce((sum, value) => sum + value, 0);
    if (Math.abs(total - 1) > RELATIVE_TOLERANCE) {
      issues.push({
        severity: "CRITICAL",
        code: "LOGIC_SHARES_NOT_100",
        message: `As participacoes de ${key} somam ${(total * 100).toFixed(1)}%, nao 100%.`,
        details: { breakdown: key, soma: Number(total.toFixed(4)) },
      });
    }
  }
  return issues;
}

/**
 * Serie historica: variacao brutal mes a mes pode ser real, entao e WARNING.
 * O que ela pega e coluna trocada, unidade errada e mes duplicado — erros que
 * nenhuma identidade aritmetica revela, porque a conta interna fecha.
 */
function checkSeries(snapshot: DashboardSnapshot): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const history = snapshot.breakdowns["marketing.history"];
  if (!history?.length) {
    return issues;
  }

  const periods = history.map((row) => String(row.period));
  const duplicated = periods.filter(
    (period, index) => periods.indexOf(period) !== index,
  );
  if (duplicated.length) {
    issues.push({
      severity: "CRITICAL",
      code: "LOGIC_DUPLICATE_PERIOD",
      message: "A serie historica tem o mesmo periodo mais de uma vez.",
      details: { periodos: [...new Set(duplicated)].join(", ") },
    });
  }

  const watched = ["investment", "leads", "mql", "appointments"] as const;
  for (let index = 1; index < history.length; index += 1) {
    for (const field of watched) {
      const before = history[index - 1][field];
      const after = history[index][field];
      if (typeof before !== "number" || typeof after !== "number" || !before) {
        continue;
      }
      const ratio = after / before;
      if (ratio > 10 || ratio < 0.1) {
        issues.push({
          severity: "WARNING",
          code: "LOGIC_SERIES_JUMP",
          message: `Variacao de mais de 10x em ${field} entre ${history[index - 1].period} e ${history[index].period}.`,
          details: {
            campo: field,
            anterior: before,
            atual: after,
            fator: Number(ratio.toFixed(2)),
          },
        });
      }
    }
  }

  return issues;
}

/**
 * Roda as quatro familias. Chamado pelo pipeline depois dos adaptadores e antes
 * do schema: um snapshot que nao fecha consigo mesmo nao chega a ser publicado.
 */
export function validateLogic(snapshot: {
  metrics: Record<string, DashboardMetric>;
  breakdowns: DashboardSnapshot["breakdowns"];
}): ValidationIssue[] {
  const full = snapshot as DashboardSnapshot;
  return [
    ...checkIdentities(snapshot.metrics),
    ...checkDomains(snapshot.metrics),
    ...checkContainments(snapshot.metrics),
    ...checkCompositions(snapshot.metrics),
    ...checkShares(full),
    ...checkSeries(full),
  ];
}
