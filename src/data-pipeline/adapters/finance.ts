import type { ValidationIssue } from "../model";
import {
  finiteNumber,
  inferWorkbookYear,
  normalizeText,
  sheetRows,
  type WorkbookInput,
} from "../workbooks";
import {
  labelRows,
  metric,
  requiredNumber,
  rowNumber,
  sourceSummary,
  type AdapterResult,
} from "./common";

function periodFromCell(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
  }

  const normalized = String(value ?? "").trim();
  const iso = normalized.match(/^(\d{4})-(\d{2})/);
  if (iso) {
    return `${iso[1]}-${iso[2]}`;
  }

  const brazilian = normalized.match(/^(\d{2})\/(\d{4})$/);
  return brazilian ? `${brazilian[2]}-${brazilian[1]}` : null;
}

function titleCase(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s)\p{L}/gu, (character) =>
      character.toLocaleUpperCase("pt-BR"),
    );
}

export function adaptFinance(input: WorkbookInput): AdapterResult {
  const issues: ValidationIssue[] = [];
  const base = sheetRows(input.workbook, "BASE");
  const headerIndex = base.findIndex((row) =>
    row.some((value) => normalizeText(value) === "MES_COMP"),
  );
  const headers = headerIndex >= 0 ? base[headerIndex] : [];
  const column = (name: string): number =>
    headers.findIndex((value) => normalizeText(value) === name);
  const valueColumn = column("VALOR_FINAL");
  const periodColumn = column("MES_COMP");
  const typeColumn = column("TIPO");
  const statusColumn = column("STATUS");
  const groupColumn = column("GRUPO_PC");
  const baseRows = headerIndex >= 0 ? base.slice(headerIndex + 1) : [];
  const availablePeriods = baseRows
    .map((row) => periodFromCell(row[periodColumn]))
    .filter((value): value is string => Boolean(value))
    .sort();
  const dashboard = sheetRows(input.workbook, "DASHBOARD");
  const start = dashboard[0]?.find(
    (value) => value instanceof Date,
  ) as Date | undefined;
  const period =
    availablePeriods.at(-1) ??
    (start
      ? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`
      : `${inferWorkbookYear(input)}-01`);
  const dreRows = labelRows(sheetRows(input.workbook, "REL DRE"), 1);

  const extract = (pattern: RegExp, label: string): number | null => {
    const value = rowNumber(dreRows, pattern, 3);
    return requiredNumber(
      value,
      "FINANCE_DRE_METRIC_MISSING",
      `Metrica ausente na REL DRE: ${label}.`,
      "finance",
      issues,
    );
  };

  const sales = extract(/^VENDAS OPERACIONAIS$/, "Vendas operacionais");
  const deductions = extract(
    /^DEDUCOES DAS RECEITAS$/,
    "Deducoes das receitas",
  );
  const variableCost = extract(/^CUSTO VARIAVEL$/, "Custo variavel");
  const grossProfit = extract(/^LUCRO BRUTO$/, "Lucro bruto");
  const fixedExpenses = extract(/^DESPESAS FIXAS$/, "Despesas fixas");
  const result =
    grossProfit !== null && fixedExpenses !== null
      ? grossProfit + fixedExpenses
      : null;
  const rowValue = (row: (typeof baseRows)[number]): number =>
    finiteNumber(row[valueColumn]) ?? 0;
  const currentRows = baseRows.filter(
    (row) => periodFromCell(row[periodColumn]) === period,
  );
  const cashIn = currentRows
    .filter((row) => normalizeText(row[typeColumn]) === "ENTRADA")
    .reduce((sum, row) => sum + rowValue(row), 0);
  const cashOut = Math.abs(
    currentRows
      .filter((row) => normalizeText(row[typeColumn]) === "SAIDA")
      .reduce((sum, row) => sum + rowValue(row), 0),
  );
  const due = baseRows
    .filter((row) => normalizeText(row[statusColumn]) === "A VENCER")
    .reduce((sum, row) => sum + Math.abs(rowValue(row)), 0);
  const overdue = baseRows
    .filter((row) => normalizeText(row[statusColumn]) === "VENCIDO")
    .reduce((sum, row) => sum + Math.abs(rowValue(row)), 0);
  const monthlyTotals = new Map<
    string,
    { cashIn: number; cashOut: number }
  >();

  for (const row of baseRows) {
    const rowPeriod = periodFromCell(row[periodColumn]);
    const type = normalizeText(row[typeColumn]);
    if (!rowPeriod || !["ENTRADA", "SAIDA"].includes(type)) {
      continue;
    }

    const current = monthlyTotals.get(rowPeriod) ?? {
      cashIn: 0,
      cashOut: 0,
    };
    if (type === "ENTRADA") {
      current.cashIn += rowValue(row);
    } else {
      current.cashOut += Math.abs(rowValue(row));
    }
    monthlyTotals.set(rowPeriod, current);
  }

  const maximumCashMovement = Math.max(
    1,
    ...[...monthlyTotals.values()].flatMap((item) => [
      item.cashIn,
      item.cashOut,
    ]),
  );
  const monthlyCashFlow = [...monthlyTotals]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([rowPeriod, totals]) => ({
      period: rowPeriod,
      cashIn: totals.cashIn,
      cashOut: totals.cashOut,
      cashInWidth: (totals.cashIn / maximumCashMovement) * 100,
      cashOutWidth: (totals.cashOut / maximumCashMovement) * 100,
    }));
  const outflowGroups = new Map<string, number>();

  for (const row of currentRows) {
    if (normalizeText(row[typeColumn]) !== "SAIDA") {
      continue;
    }
    const group = String(row[groupColumn] ?? "").trim();
    if (!group) {
      continue;
    }
    outflowGroups.set(
      group,
      (outflowGroups.get(group) ?? 0) + Math.abs(rowValue(row)),
    );
  }

  const largestOutflow = Math.max(1, ...outflowGroups.values());
  const outflowComposition = [...outflowGroups]
    .sort(([, left], [, right]) => right - left)
    .slice(0, 8)
    .map(([group, value]) => ({
      group: titleCase(group),
      value,
      width: (value / largestOutflow) * 100,
    }));
  const percentageOfSales = (value: number | null): number | null =>
    sales && value !== null ? value / sales : null;

  return {
    source: sourceSummary(
      "finance",
      input,
      period,
      base.filter((row) =>
        row.some((value) => value !== null && value !== ""),
      ).length,
    ),
    metrics: [
      metric({
        id: "finance.sales.current",
        label: "Vendas operacionais",
        value: sales,
        unit: "BRL",
        period,
        source: "finance",
        sheet: "REL DRE",
      }),
      metric({
        id: "finance.deductions.current",
        label: "Deducoes das receitas",
        value: deductions,
        unit: "BRL",
        period,
        source: "finance",
        sheet: "REL DRE",
      }),
      metric({
        id: "finance.variable_cost.current",
        label: "Custo variavel",
        value: variableCost,
        unit: "BRL",
        period,
        source: "finance",
        sheet: "REL DRE",
      }),
      metric({
        id: "finance.gross_profit.current",
        label: "Lucro bruto",
        value: grossProfit,
        unit: "BRL",
        period,
        source: "finance",
        sheet: "REL DRE",
      }),
      metric({
        id: "finance.fixed_expenses.current",
        label: "Despesas fixas",
        value: fixedExpenses,
        unit: "BRL",
        period,
        source: "finance",
        sheet: "REL DRE",
      }),
      metric({
        id: "finance.result.current",
        label: "Lucro bruto menos despesas fixas",
        value: result,
        unit: "BRL",
        period,
        source: "finance",
        sheet: "REL DRE",
        formula: "lucro bruto + despesas fixas",
        dependencies: [
          "finance.gross_profit.current",
          "finance.fixed_expenses.current",
        ],
      }),
      metric({
        id: "finance.cash_in.current",
        label: "Entradas de caixa",
        value: cashIn,
        unit: "BRL",
        period,
        source: "finance",
        sheet: "BASE",
        formula: "soma VALOR_FINAL onde TIPO = ENTRADA e MES_COMP = competencia",
      }),
      metric({
        id: "finance.cash_out.current",
        label: "Saidas de caixa",
        value: cashOut,
        unit: "BRL",
        period,
        source: "finance",
        sheet: "BASE",
        formula: "valor absoluto da soma onde TIPO = SAIDA e MES_COMP = competencia",
      }),
      metric({
        id: "finance.due.current",
        label: "Titulos a vencer",
        value: due,
        unit: "BRL",
        period,
        source: "finance",
        sheet: "BASE",
        formula: "soma absoluta de VALOR_FINAL onde Status = A VENCER",
      }),
      metric({
        id: "finance.overdue.current",
        label: "Titulos vencidos",
        value: overdue,
        unit: "BRL",
        period,
        source: "finance",
        sheet: "BASE",
        formula: "soma absoluta de VALOR_FINAL onde Status = VENCIDO",
      }),
      metric({
        id: "finance.deductions_rate.current",
        label: "Deducoes sobre vendas",
        value: percentageOfSales(deductions),
        unit: "PERCENT",
        period,
        source: "finance",
        sheet: "REL DRE",
        formula: "deducoes / vendas operacionais",
        dependencies: [
          "finance.deductions.current",
          "finance.sales.current",
        ],
      }),
      metric({
        id: "finance.variable_cost_rate.current",
        label: "Custo variavel sobre vendas",
        value: percentageOfSales(variableCost),
        unit: "PERCENT",
        period,
        source: "finance",
        sheet: "REL DRE",
        formula: "custo variavel / vendas operacionais",
        dependencies: [
          "finance.variable_cost.current",
          "finance.sales.current",
        ],
      }),
      metric({
        id: "finance.gross_margin.current",
        label: "Margem bruta",
        value: percentageOfSales(grossProfit),
        unit: "PERCENT",
        period,
        source: "finance",
        sheet: "REL DRE",
        formula: "lucro bruto / vendas operacionais",
        dependencies: [
          "finance.gross_profit.current",
          "finance.sales.current",
        ],
      }),
      metric({
        id: "finance.fixed_expenses_rate.current",
        label: "Despesas fixas sobre vendas",
        value: percentageOfSales(fixedExpenses),
        unit: "PERCENT",
        period,
        source: "finance",
        sheet: "REL DRE",
        formula: "despesas fixas / vendas operacionais",
        dependencies: [
          "finance.fixed_expenses.current",
          "finance.sales.current",
        ],
      }),
      metric({
        id: "finance.result_margin.current",
        label: "Resultado gerencial sobre vendas",
        value: percentageOfSales(result),
        unit: "PERCENT",
        period,
        source: "finance",
        sheet: "REL DRE",
        formula: "resultado gerencial / vendas operacionais",
        dependencies: [
          "finance.result.current",
          "finance.sales.current",
        ],
      }),
    ],
    breakdowns: {
      "finance.monthly_cash_flow": monthlyCashFlow,
      "finance.outflow_composition": outflowComposition,
    },
    issues,
  };
}
