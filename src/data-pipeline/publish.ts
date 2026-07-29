import { spawnSync } from "node:child_process";

const allowedFiles = [
  "public/data/dashboard-snapshot.json",
  "public/data/dashboard-snapshot.js",
  "public/data/analysis-package.json",
];
const expectedBranch = process.env.DASHBOARD_PUBLISH_BRANCH || "main";

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} falhou.`);
  }
}

function output(command: string, args: string[]): string {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} falhou.`);
  }
  return result.stdout.trim();
}

export function assertPublishReady(): void {
  const branch = output("git", ["branch", "--show-current"]);
  if (branch !== expectedBranch) {
    throw new Error(
      `Publicacao automatica exige a branch ${expectedBranch}; atual: ${branch || "detached HEAD"}.`,
    );
  }

  const changes = output("git", ["status", "--porcelain"]);
  if (changes) {
    throw new Error(
      "O repositorio precisa estar limpo antes de receber uma importacao com publicacao automatica.",
    );
  }
}

export function publishSnapshot(importId: string): boolean {
  const branch = output("git", ["branch", "--show-current"]);
  if (branch !== expectedBranch) {
    throw new Error(
      `Publicacao automatica exige a branch ${expectedBranch}; atual: ${branch || "detached HEAD"}.`,
    );
  }

  const stagedBefore = output("git", ["diff", "--cached", "--name-only"]);
  if (stagedBefore) {
    throw new Error(
      "Existem alteracoes previamente staged; publicacao automatica bloqueada.",
    );
  }
  const worktreeChanges = output("git", ["status", "--porcelain"])
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter((fileName) => !allowedFiles.includes(fileName));
  if (worktreeChanges.length) {
    throw new Error(
      `Alteracao fora da allowlist impede publicacao: ${worktreeChanges.join(", ")}.`,
    );
  }

  run("npm", ["run", "lint"]);
  run("npm", ["test"]);
  run("npm", ["run", "build"]);
  run("git", ["add", "--", ...allowedFiles]);

  const staged = output("git", ["diff", "--cached", "--name-only"]);
  if (!staged) {
    return false;
  }

  const unexpected = staged
    .split("\n")
    .filter((fileName) => !allowedFiles.includes(fileName));
  if (unexpected.length) {
    throw new Error(
      `Arquivo fora da allowlist de publicacao: ${unexpected.join(", ")}`,
    );
  }

  run("git", [
    "commit",
    "-m",
    `data(dashboard): publicar snapshot ${importId.slice(0, 18)}`,
  ]);
  run("git", ["push", "origin", `HEAD:${expectedBranch}`]);
  return true;
}
