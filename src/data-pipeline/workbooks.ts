import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";

import type { SourceRole, ValidationIssue } from "./model";

export type CellValue = string | number | boolean | Date | null;
export type SheetRows = CellValue[][];

export interface WorkbookInput {
  fileName: string;
  buffer: Buffer;
  sha256: string;
  workbook: XLSX.WorkBook;
}

export interface ClassifiedWorkbooks {
  inputs: Map<SourceRole, WorkbookInput>;
  issues: ValidationIssue[];
  importId: string;
}

export function normalizeText(value: unknown): string {
  return String(value ?? "")
    .replace(/ª/g, "A")
    .replace(/º/g, "O")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalized = value
    .replace(/\s/g, "")
    .replace(/^R\$/i, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function sheetRows(
  workbook: XLSX.WorkBook,
  sheetName: string,
): SheetRows {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return [];
  }

  return XLSX.utils.sheet_to_json<CellValue[]>(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });
}

export function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export function createWorkbookInput(
  fileName: string,
  buffer: Buffer,
): WorkbookInput {
  return {
    fileName: path.basename(fileName),
    buffer,
    sha256: sha256(buffer),
    workbook: XLSX.read(buffer, { type: "buffer", cellDates: true }),
  };
}

export async function readWorkbookDirectory(
  directory: string,
): Promise<WorkbookInput[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const workbookFiles = entries
    .filter(
      (entry) =>
        entry.isFile() && /\.(xlsx|xlsm|xls)$/i.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort();

  return Promise.all(
    workbookFiles.map(async (fileName) => {
      const buffer = await fs.readFile(path.join(directory, fileName));
      return createWorkbookInput(fileName, buffer);
    }),
  );
}

function headerSignature(input: WorkbookInput, sheetName: string): string {
  return sheetRows(input.workbook, sheetName)
    .slice(0, 8)
    .flat()
    .map(normalizeText)
    .join("|");
}

export function detectWorkbookRole(input: WorkbookInput): SourceRole | null {
  const sheets = input.workbook.SheetNames.map(normalizeText);
  const allHeaders = input.workbook.SheetNames.map((sheetName) =>
    headerSignature(input, sheetName),
  ).join("|");

  if (
    sheets.some((name) =>
      /^MARKETING (JANEIRO|FEVEREIRO|MARCO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)/.test(
        name,
      ),
    ) &&
    sheets.some((name) => name.startsWith("TRAFEGO")) &&
    sheets.some((name) => name.startsWith("ORGANICO"))
  ) {
    return "marketing";
  }

  if (
    sheets.includes("DASHBOARD") &&
    allHeaders.includes("JORNADA") &&
    allHeaders.includes("FECHOU/NAO FECHOU/NEGOCIACAO")
  ) {
    return "closer";
  }

  if (
    allHeaders.includes("ORIGEM") &&
    allHeaders.includes("AGENDAMENTO") &&
    allHeaders.includes("CONSULTA") &&
    allHeaders.includes("PROFISS")
  ) {
    return "appointments";
  }

  if (
    allHeaders.includes("CREATED_TIME") &&
    allHeaders.includes("LEAD_STATUS") &&
    (allHeaders.includes("PHONE_NUMBER") || allHeaders.includes("TELEFONE"))
  ) {
    return "form";
  }

  if (
    sheets.includes("REL DRE") &&
    sheets.includes("BASE") &&
    allHeaders.includes("DEMONSTRATIVO DE RESULTADO")
  ) {
    return "finance";
  }

  return null;
}

export function classifyWorkbooks(
  workbooks: WorkbookInput[],
): ClassifiedWorkbooks {
  const inputs = new Map<SourceRole, WorkbookInput>();
  const issues: ValidationIssue[] = [];

  for (const input of workbooks) {
    const role = detectWorkbookRole(input);
    if (!role) {
      issues.push({
        severity: "CRITICAL",
        code: "UNRECOGNIZED_WORKBOOK",
        message: `Arquivo nao reconhecido pelo contrato: ${input.fileName}.`,
      });
      continue;
    }

    if (inputs.has(role)) {
      issues.push({
        severity: "CRITICAL",
        code: "DUPLICATE_SOURCE",
        message: `Mais de um arquivo foi classificado como ${role}.`,
        source: role,
      });
      continue;
    }

    inputs.set(role, input);
  }

  const required: SourceRole[] = [
    "marketing",
    "closer",
    "appointments",
    "form",
    "finance",
  ];

  for (const role of required) {
    if (!inputs.has(role)) {
      issues.push({
        severity: "CRITICAL",
        code: "MISSING_SOURCE",
        message: `Fonte obrigatoria ausente: ${role}.`,
        source: role,
      });
    }
  }

  return {
    inputs,
    issues,
    importId: `${new Date().toISOString().slice(0, 10)}-${randomUUID()}`,
  };
}

const monthNumbers: Record<string, number> = {
  JANEIRO: 1,
  FEVEREIRO: 2,
  MARCO: 3,
  ABRIL: 4,
  MAIO: 5,
  JUNHO: 6,
  JULHO: 7,
  AGOSTO: 8,
  SETEMBRO: 9,
  OUTUBRO: 10,
  NOVEMBRO: 11,
  DEZEMBRO: 12,
};

export function periodFromSheetName(
  sheetName: string,
  fallbackYear: number,
): string | null {
  const normalized = normalizeText(sheetName);
  const monthName = Object.keys(monthNumbers).find((month) =>
    normalized.includes(month),
  );
  if (!monthName) {
    return null;
  }

  return `${fallbackYear}-${String(monthNumbers[monthName]).padStart(2, "0")}`;
}

export function previousPeriod(period: string): string {
  const [year, month] = period.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function inferWorkbookYear(input: WorkbookInput): number {
  const years: number[] = [];

  for (const sheetName of input.workbook.SheetNames) {
    const rows = sheetRows(input.workbook, sheetName).slice(0, 40);
    for (const value of rows.flat()) {
      if (value instanceof Date && Number.isFinite(value.getTime())) {
        years.push(value.getFullYear());
      } else {
        const matches = String(value ?? "").match(/\b20\d{2}\b/g);
        for (const match of matches ?? []) {
          years.push(Number(match));
        }
      }
    }
  }

  return years.length ? Math.max(...years) : new Date().getFullYear();
}
