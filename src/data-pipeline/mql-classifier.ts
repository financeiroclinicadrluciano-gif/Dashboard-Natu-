/**
 * Classificador automatico de MQL por cargo.
 *
 * A regua vem de `03-PROJETOS/03.1-NATUA/5-Natua-Trafego-Pago/arquivos/
 * 02-METRICAS-MQL-CAC-ROI-GUARDRAILS.md`: MQL e definido por cargo/profissao,
 * poder aquisitivo provavel e autonomia de decisao — nunca por dor ou urgencia.
 *
 * Regras, na ordem:
 *   1. cargo vazio ou lixo ("." , "sim", "0") -> NAO_MQL (sem sinal);
 *   2. sinal forte de MQL presente -> MQL, mesmo que tambem haja termo de
 *      NAO_MQL ("medica aposentada" e MQL: a profissao ganha da situacao);
 *   3. termo de NAO_MQL presente -> NAO_MQL;
 *   4. nenhum match -> NAO_MQL. "Na duvida, NAO_MQL" e regra do guardrail.
 *
 * As listas sao explicitas e exportadas para auditoria. Ha um conflito conhecido
 * entre o guardrail (inclui medico/engenheiro) e a memoria da regua estrita (os
 * excluiu); o padrao segue o guardrail e `STRICT_EXCLUSIONS` documenta o que a
 * variante estrita tiraria. Trocar a regua e mudar estas listas, nada mais.
 */

export type MqlClass = "MQL" | "NAO_MQL";

export interface MqlVerdict {
  classification: MqlClass;
  /** Termo que decidiu, para o veredito ser auditavel. */
  matched: string | null;
  reason:
    | "sinal_forte"
    | "termo_nao_mql"
    | "sem_sinal"
    | "cargo_vazio";
}

/**
 * Sinais fortes de MQL como PREFIXO de palavra: o radical casa qualquer flexao
 * de genero/numero no inicio de uma palavra (empresari -> empresaria/o). O match
 * e por palavra, nao por substring cru — senao "coordenador" viraria "coo" e
 * "assistente social" viraria "socia". Foi o bug da primeira versao.
 */
export const MQL_SIGNALS: readonly string[] = [
  "empresari",
  "empreendedor",
  "proprietari",
  "diretor",
  "executiv",
  "presidente",
  "gerente",
  "gestor",
  "medic",
  "dentista",
  "odontolog",
  "cirurgi",
  "advogad",
  "juiz",
  "engenheir",
  "arquitet",
  "veterinari",
  "investidor",
  "coronel",
  "comandante",
];

/**
 * Sinais fortes que so valem como PALAVRA INTEIRA — curtos ou ambiguos demais
 * para prefixo. "socio" nao pode casar "sociologo"; "ceo" nao pode casar
 * "cerimonialista".
 */
export const MQL_EXACT_SIGNALS: readonly string[] = [
  "dono",
  "socio",
  "socia",
  "socios",
  "socias",
  "ceo",
  "cfo",
  "coo",
  "cto",
];

/** Sinais de MQL que so existem como FRASE (duas palavras ou mais). */
export const MQL_PHRASES: readonly string[] = [
  "dona de empresa",
  "dono de empresa",
  "dona de clinica",
  "dono de clinica",
  "profissional liberal",
  "gerente geral",
];

/** Sinais de NAO_MQL que so existem como FRASE. */
export const NON_MQL_PHRASES: readonly string[] = [
  "do lar",
  "dona de casa",
  "assistente social",
];

/**
 * Termos de NAO_MQL: operacional, baixa autonomia de compra, sem sinal
 * financeiro. Radicais sem genero.
 */
export const NON_MQL_SIGNALS: readonly string[] = [
  "aposentad",
  "pensionist",
  "professor",
  "pedagog",
  "estudante",
  "estagiari",
  "desempregad",
  "secretari",
  "caixa",
  "atendente",
  "auxiliar",
  "assistente",
  "diarist",
  "domestic",
  "faxineir",
  "cozinheir",
  "motorista",
  "vendedor",
  "manicure",
  "cabeleireir",
  "costureir",
  "cuidador",
  "recepcionist",
  "operad",
  "mecanic",
  "pedreiro",
  "porteiro",
  "seguranca",
  "balconist",
  "garcom",
  "garconete",
  "tecnic",
  "enfermeir",
  "farmaceutic",
  "nutricionist",
  "fisioterapeut",
];

/** O que a variante estrita (memoria mql-natua-regua-estrita) removeria de MQL. */
export const STRICT_EXCLUSIONS: readonly string[] = [
  "medic",
  "engenheir",
  "dentista",
  "veterinari",
];

/** Cargos-lixo que nao carregam sinal nenhum. */
const JUNK = new Set(["", ".", "-", "sim", "nao", "0", "x", "n/a", "na"]);

export function normalizeRole(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Palavras do cargo normalizado, para match por palavra. */
function words(normalized: string): string[] {
  return normalized.split(/[\s/]+/).filter(Boolean);
}

/** Um radical casa se alguma palavra COMECA com ele. */
function matchPrefix(tokens: string[], radicals: readonly string[]): string | null {
  for (const token of tokens) {
    const hit = radicals.find((radical) => token.startsWith(radical));
    if (hit) {
      return hit;
    }
  }
  return null;
}

/** Um sinal exato casa se for uma palavra inteira do cargo. */
function matchExact(tokens: string[], exact: readonly string[]): string | null {
  for (const token of tokens) {
    if (exact.includes(token)) {
      return token;
    }
  }
  return null;
}

/** Uma frase casa se aparecer inteira no cargo normalizado. */
function matchPhrase(normalized: string, phrases: readonly string[]): string | null {
  return phrases.find((phrase) => normalized.includes(phrase)) ?? null;
}

export interface ClassifyOptions {
  /** Aplica a variante estrita, removendo STRICT_EXCLUSIONS dos sinais fortes. */
  strict?: boolean;
}

export function classifyMql(
  role: unknown,
  options: ClassifyOptions = {},
): MqlVerdict {
  const normalized = normalizeRole(role);

  if (!normalized || JUNK.has(normalized)) {
    return { classification: "NAO_MQL", matched: null, reason: "cargo_vazio" };
  }

  const tokens = words(normalized);
  const prefixes = options.strict
    ? MQL_SIGNALS.filter((signal) => !STRICT_EXCLUSIONS.includes(signal))
    : MQL_SIGNALS;

  const strong =
    matchPhrase(normalized, MQL_PHRASES) ??
    matchPrefix(tokens, prefixes) ??
    matchExact(tokens, MQL_EXACT_SIGNALS);
  if (strong) {
    return { classification: "MQL", matched: strong, reason: "sinal_forte" };
  }

  const weak =
    matchPhrase(normalized, NON_MQL_PHRASES) ??
    matchPrefix(tokens, NON_MQL_SIGNALS);
  if (weak) {
    return { classification: "NAO_MQL", matched: weak, reason: "termo_nao_mql" };
  }

  return { classification: "NAO_MQL", matched: null, reason: "sem_sinal" };
}

export interface MqlTally {
  total: number;
  mql: number;
  naoMql: number;
  /** Leads MQL por termo que decidiu — auditoria de quais cargos entraram. */
  byMatch: Record<string, number>;
  /** Quantos NAO_MQL cairam por "sem sinal" (cargo desconhecido). */
  semSinal: number;
}

export function tallyMql(
  roles: Iterable<unknown>,
  options: ClassifyOptions = {},
): MqlTally {
  const tally: MqlTally = {
    total: 0,
    mql: 0,
    naoMql: 0,
    byMatch: {},
    semSinal: 0,
  };
  for (const role of roles) {
    tally.total += 1;
    const verdict = classifyMql(role, options);
    if (verdict.classification === "MQL") {
      tally.mql += 1;
      const key = verdict.matched ?? "(sem termo)";
      tally.byMatch[key] = (tally.byMatch[key] ?? 0) + 1;
    } else {
      tally.naoMql += 1;
      if (verdict.reason === "sem_sinal") {
        tally.semSinal += 1;
      }
    }
  }
  return tally;
}
