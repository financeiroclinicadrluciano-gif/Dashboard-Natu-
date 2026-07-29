import path from "node:path";

import { PipelineRejectedError, processWorkbooks } from "./pipeline";
import { publishSnapshot } from "./publish";
import { activateResult, rollbackLatest, saveCandidate } from "./store";
import { readWorkbookDirectory } from "./workbooks";

function printSummary(
  title: string,
  result: ReturnType<typeof processWorkbooks>,
): void {
  const warnings = result.snapshot.validation.issues.filter(
    (issue) => issue.severity === "WARNING",
  );
  console.log(title);
  console.log(`Importacao: ${result.snapshot.importId}`);
  console.log(`Periodo principal: ${result.snapshot.primaryPeriod}`);
  console.log(`Fontes: ${result.snapshot.sources.length}`);
  console.log(
    `Metricas agregadas: ${Object.keys(result.snapshot.metrics).length}`,
  );
  console.log(`Analises: ${result.analysis.sections.length}`);
  console.log(`Alertas: ${warnings.length}`);
  for (const warning of warnings) {
    console.log(`- ${warning.code}: ${warning.message}`);
  }
}

async function main(): Promise<void> {
  const [command, directoryArg, ...flags] = process.argv.slice(2);

  if (command === "rollback") {
    const result = await rollbackLatest();
    printSummary("Rollback concluido.", result);
    if (flags.includes("--publish") || directoryArg === "--publish") {
      publishSnapshot(result.snapshot.importId);
    }
    return;
  }

  if (!["update", "check"].includes(command) || !directoryArg) {
    console.error(
      "Uso: npm run dashboard:update -- /diretorio [--publish]",
    );
    process.exitCode = 2;
    return;
  }

  const directory = path.resolve(directoryArg);
  const inputs = await readWorkbookDirectory(directory);

  try {
    const result = processWorkbooks(inputs);
    await saveCandidate(result);

    if (command === "check") {
      printSummary("Conferencia aprovada; snapshot ativo preservado.", result);
      return;
    }

    await activateResult(result);
    printSummary("Atualizacao aprovada e snapshot ativado.", result);
    if (flags.includes("--publish")) {
      publishSnapshot(result.snapshot.importId);
    }
  } catch (error) {
    if (error instanceof PipelineRejectedError) {
      console.error(error.message);
      for (const issue of error.issues) {
        console.error(`- ${issue.severity} ${issue.code}: ${issue.message}`);
      }
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Falha desconhecida no pipeline.",
  );
  process.exitCode = 1;
});

