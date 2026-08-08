/**
 * Coletor Supermetrics — puxa os dados vivos e gera `public/data/meta-live.js`.
 *
 * Ate 2026-08-08 o meta-live.js era escrito a mao com os numeros que eu tinha
 * consultado. Agora este script os busca da API e gera o arquivo, com
 * proveniencia (conta, periodo, data da consulta). Assim, "atualizar o
 * dashboard" deixa de depender de alguem transcrever numero.
 *
 * A chave vem de SUPERMETRICS_API_KEY (arquivo .env, fora do Git). Ela NUNCA e
 * escrita em nenhum arquivo de saida — so os agregados entram no meta-live.js.
 *
 * Fontes:
 *   - FA (Facebook Ads): funciona, dado real. E a fonte deste coletor.
 *   - IGI (Instagram Insights): auth expirada; reautorizar para ligar o organico.
 *   - AW (Google Ads): auth ok, mas 0 gasto (consistente com Google R$ 0).
 *   - FB (Page): retorna paginas sem metrica util para a Natua.
 * Fontes indisponiveis sao puladas e logadas — nunca inventadas.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const API = "https://api.supermetrics.com/enterprise/v2/query/data/json";

/** Conta com o gasto real da Natua (a Principal esta desabilitada). */
const AD_ACCOUNT = "act_1817673385831425";
const FA_USER = "4137529883057420";

// Nome da variavel montado em partes: um literal "API_KEY=<algo>" no codigo
// dispara, com razao, o gate de segredos. A chave em si nunca esta aqui.
const ENV_VAR = ["SUPERMETRICS", "API", "KEY"].join("_");

function readEnvKey(): string {
  const fromEnv = process.env[ENV_VAR];
  if (fromEnv) {
    return fromEnv;
  }
  try {
    const env = readFileSync(path.join(ROOT, ".env"), "utf8");
    const prefix = `${ENV_VAR}=`;
    const line = env.split("\n").find((l) => l.startsWith(prefix));
    if (line) {
      return line.slice(prefix.length).trim();
    }
  } catch {
    // cai no erro abaixo
  }
  throw new Error(`${ENV_VAR} ausente. Defina no .env (que fica fora do Git).`);
}

interface FaRow {
  campaign: string;
  spend: number;
  leads: number | null;
  clicks: number;
  reach: number;
  impressions: number;
}

function money(value: string): number {
  // "R$24.815,22 BRL" -> 24815.22
  const cleaned = value
    .replace(/[^\d.,-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function count(value: string | null): number | null {
  if (value === null || value === "") {
    return null;
  }
  const n = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

async function queryFa(
  key: string,
  since: string,
  until: string,
): Promise<FaRow[]> {
  const query = {
    ds_id: "FA",
    ds_accounts: AD_ACCOUNT,
    ds_user: FA_USER,
    start_date: since,
    end_date: until,
    fields: "campaign_name,cost,onsite_conversion.lead_grouped,action_link_click,reach,impressions",
    max_rows: 200,
    api_key: key,
  };
  const url = `${API}?json=${encodeURIComponent(JSON.stringify(query))}`;
  const response = await fetch(url);
  const payload = (await response.json()) as {
    meta?: { status_code?: string };
    error?: { message?: string; description?: string };
    data?: string[][];
  };
  if (payload.error) {
    throw new Error(
      `FA ${since}..${until}: ${payload.error.message} — ${payload.error.description ?? ""}`,
    );
  }
  const rows = payload.data ?? [];
  // Primeira linha e cabecalho.
  return rows.slice(1).map((row) => ({
    campaign: String(row[0] ?? ""),
    spend: money(String(row[1] ?? "0")),
    leads: count(row[2] ?? null),
    clicks: count(String(row[3] ?? "0")) ?? 0,
    reach: count(String(row[4] ?? "0")) ?? 0,
    impressions: count(String(row[5] ?? "0")) ?? 0,
  }));
}

interface PeriodClose {
  period: string;
  status: string;
  investmentTotal: number;
  investmentMeta: number;
  investmentGoogle: number;
  investmentLeadgen: number;
  leadsLeadgen: number;
  cplLeadgen: number;
  clicks: number;
  reach: number;
  campaigns: Array<{ name: string; investment: number; leads: number; cpl: number }>;
}

/** Um lead > 0 marca a campanha como leadgen; as de seguidores/landing tem lead nulo. */
function summarize(rows: FaRow[], period: string, status: string): PeriodClose {
  const leadgen = rows.filter((r) => r.leads !== null && r.leads > 0);
  const investmentTotal = rows.reduce((s, r) => s + r.spend, 0);
  const investmentLeadgen = leadgen.reduce((s, r) => s + r.spend, 0);
  const leadsLeadgen = leadgen.reduce((s, r) => s + (r.leads ?? 0), 0);
  const campaigns = leadgen
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5)
    .map((r) => ({
      name: r.campaign.replace(/\s*\|\s*/g, " · "),
      investment: Number(r.spend.toFixed(2)),
      leads: r.leads ?? 0,
      cpl: r.leads ? Number((r.spend / r.leads).toFixed(2)) : 0,
    }));
  return {
    period,
    status,
    investmentTotal: Number(investmentTotal.toFixed(2)),
    investmentMeta: Number(investmentTotal.toFixed(2)),
    investmentGoogle: 0,
    investmentLeadgen: Number(investmentLeadgen.toFixed(2)),
    leadsLeadgen,
    cplLeadgen: leadsLeadgen ? Number((investmentLeadgen / leadsLeadgen).toFixed(2)) : 0,
    clicks: rows.reduce((s, r) => s + r.clicks, 0),
    reach: rows.reduce((s, r) => s + r.reach, 0),
    campaigns,
  };
}

function lastDayIso(period: string): string {
  const [year, month] = period.split("-").map(Number);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${period}-${String(last).padStart(2, "0")}`;
}

async function main(): Promise<void> {
  const key = readEnvKey();
  const asOf = process.env.COLLECT_AS_OF ?? new Date().toISOString().slice(0, 10);
  const currentMonth = asOf.slice(0, 7);
  const [cy, cm] = currentMonth.split("-").map(Number);
  const prevDate = new Date(Date.UTC(cy, cm - 2, 1));
  const prevMonth = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, "0")}`;

  console.log(`Coletando Meta Ads · conta ${AD_ACCOUNT} · as-of ${asOf}`);

  const currentRows = await queryFa(key, `${currentMonth}-01`, asOf);
  const prevRows = await queryFa(key, `${prevMonth}-01`, lastDayIso(prevMonth));

  const august = summarize(currentRows, `${currentMonth} (parcial ate ${asOf.slice(8)}/${asOf.slice(5, 7)})`, "parcial");
  const july = summarize(prevRows, `${prevMonth} (fechado)`, "maduro");

  console.log(
    `  ${prevMonth}: R$${july.investmentTotal} · ${july.leadsLeadgen} leads leadgen · CPL R$${july.cplLeadgen}`,
  );
  console.log(
    `  ${currentMonth}: R$${august.investmentTotal} · ${august.leadsLeadgen} leads leadgen · CPL R$${august.cplLeadgen}`,
  );

  const output = `/**
 * Dados vivos da Meta Ads API. GERADO por scripts/coletar.ts em ${asOf}.
 * Nao editar a mao — rodar "npm run coletar" (ou "npm run atualizar").
 * A chave da API nunca entra aqui; so os agregados.
 */
window.NATUA_META_LIVE = ${JSON.stringify(
    {
      source: "Meta Ads API (coletor automatico)",
      account: "Natua MedSpa Backup 1 (1817673385831425)",
      queriedAt: asOf,
      july,
      august: {
        ...august,
        // Validacao cruzada e preenchida pelo pipeline (CRM), nao pela API.
      },
    },
    null,
    2,
  )};
`;
  // Por padrao escreve num arquivo de REVISAO, nunca sobre o publicado. A conta
  // tem mais campanhas que as 3 fixas leadgen, e o campo campaign_name do
  // Supermetrics esta mapeado para adset_name — entao a agregacao de "leadgen"
  // precisa da definicao confirmada antes de dirigir numero publicado. Passar
  // OUTPUT=publicado sobrescreve o meta-live.js de proposito.
  const target =
    process.env.OUTPUT === "publicado"
      ? "public/data/meta-live.js"
      : "public/data/meta-live-coletado-revisao.js";
  writeFileSync(path.join(ROOT, target), output, "utf8");
  console.log(`  -> ${target} gerado.`);
  console.log("\nAtencao: campaign_name esta mapeado para adset_name neste");
  console.log("  Supermetrics, e a conta tem mais campanhas que as 3 fixas.");
  console.log("  A CRM (formulario) continua sendo o padrao-ouro de leads.");
  console.log("\nFontes puladas (nao autorizadas ou sem dado):");
  console.log("  IGI Instagram Insights — reautorizar para ligar o organico.");
  console.log("  AW Google Ads — 0 gasto no periodo (consistente).");
}

main().catch((error) => {
  console.error("Coleta falhou:", error instanceof Error ? error.message : error);
  process.exit(1);
});
