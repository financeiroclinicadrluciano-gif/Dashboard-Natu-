import fs from "node:fs/promises";
import path from "node:path";

import {
  analysisPackageSchema,
  dashboardSnapshotSchema,
  type AnalysisPackage,
  type DashboardSnapshot,
  type PipelineResult,
} from "./model";

const root = process.cwd();
const runtimeRoot = path.join(root, ".runtime");
const candidateRoot = path.join(runtimeRoot, "imports");
const historyRoot = path.join(runtimeRoot, "history");
const publicDataRoot = path.join(root, "public", "data");

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function safeJavaScript(value: unknown): string {
  const json = JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `window.NATUA_DASHBOARD_DATA = ${json};\n`;
}

export async function saveCandidate(result: PipelineResult): Promise<void> {
  await fs.mkdir(candidateRoot, { recursive: true });
  await writeJson(
    path.join(candidateRoot, `${result.snapshot.importId}.json`),
    result,
  );
}

export async function activateResult(result: PipelineResult): Promise<void> {
  if (result.snapshot.validation.status !== "APPROVED") {
    throw new Error("Snapshot rejeitado nao pode ser ativado.");
  }

  await saveCandidate(result);
  await fs.mkdir(historyRoot, { recursive: true });
  await writeJson(
    path.join(historyRoot, `${result.snapshot.importId}.json`),
    result,
  );
  await writeJson(
    path.join(publicDataRoot, "dashboard-snapshot.json"),
    result.snapshot,
  );
  await writeJson(
    path.join(publicDataRoot, "analysis-package.json"),
    result.analysis,
  );
  await fs.mkdir(publicDataRoot, { recursive: true });
  await fs.writeFile(
    path.join(publicDataRoot, "dashboard-snapshot.js"),
    safeJavaScript({
      snapshot: result.snapshot,
      analysis: result.analysis,
    }),
    "utf8",
  );
}

export async function loadCandidate(
  importId: string,
): Promise<PipelineResult> {
  const content = await fs.readFile(
    path.join(candidateRoot, `${path.basename(importId)}.json`),
    "utf8",
  );
  const parsed = JSON.parse(content) as {
    snapshot: unknown;
    analysis: unknown;
  };
  return {
    snapshot: dashboardSnapshotSchema.parse(parsed.snapshot),
    analysis: analysisPackageSchema.parse(parsed.analysis),
  };
}

export async function listHistory(): Promise<
  Array<{
    importId: string;
    generatedAt: string;
    primaryPeriod: string;
  }>
> {
  await fs.mkdir(historyRoot, { recursive: true });
  const files = (await fs.readdir(historyRoot)).filter((name) =>
    name.endsWith(".json"),
  );
  const items = [];

  for (const fileName of files) {
    const parsed = JSON.parse(
      await fs.readFile(path.join(historyRoot, fileName), "utf8"),
    ) as { snapshot: DashboardSnapshot; analysis: AnalysisPackage };
    items.push({
      importId: parsed.snapshot.importId,
      generatedAt: parsed.snapshot.generatedAt,
      primaryPeriod: parsed.snapshot.primaryPeriod,
    });
  }

  return items.sort((left, right) =>
    right.generatedAt.localeCompare(left.generatedAt),
  );
}

export async function rollbackLatest(): Promise<PipelineResult> {
  const history = await listHistory();
  if (history.length < 2) {
    throw new Error("Nao existe snapshot anterior para rollback.");
  }

  const previous = await fs.readFile(
    path.join(historyRoot, `${history[1].importId}.json`),
    "utf8",
  );
  const parsed = JSON.parse(previous) as {
    snapshot: unknown;
    analysis: unknown;
  };
  const result = {
    snapshot: dashboardSnapshotSchema.parse(parsed.snapshot),
    analysis: analysisPackageSchema.parse(parsed.analysis),
  };
  await activateResult(result);
  return result;
}
