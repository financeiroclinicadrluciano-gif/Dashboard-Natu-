import { normalizeText } from "./workbooks";

/**
 * Taxonomia fechada de canal de aquisicao.
 *
 * A planilha semanal grava canal em texto livre. Em 2026-08 apareceram 11 grafias
 * para 5 canais reais ("organico" e "organico perfil natua"; "formulario",
 * "formulario - mounjaro" e "formulario - trat obesidade"; "indicacao" e
 * "indicacao dra vivian"). Agregar por texto livre produz numero errado com
 * aparencia de certo, entao o canal e normalizado antes de qualquer soma.
 *
 * RECORRENCIA existe para separar recompra de aquisicao: contar paciente antigo
 * no denominador de CAC infla o resultado do marketing.
 */
export const CHANNELS = [
  "FORMULARIO",
  "TRAFEGO_PAGO",
  "ORGANICO",
  "BIO",
  "INDICACAO",
  "RECORRENCIA",
] as const;

export type Channel = (typeof CHANNELS)[number];

/** Canais que representam aquisicao nova e entram no denominador de CAC. */
export const ACQUISITION_CHANNELS: readonly Channel[] = [
  "FORMULARIO",
  "TRAFEGO_PAGO",
  "ORGANICO",
  "BIO",
  "INDICACAO",
];

export const CHANNEL_LABELS: Record<Channel, string> = {
  FORMULARIO: "Formulario",
  TRAFEGO_PAGO: "Trafego pago",
  ORGANICO: "Organico",
  BIO: "Link da bio",
  INDICACAO: "Indicacao",
  RECORRENCIA: "Recorrencia",
};

/**
 * Ordem importa: o primeiro padrao que casar vence. RECORRENCIA e INDICACAO vem
 * antes porque "paciente antigo indicado" e recorrencia, nao aquisicao, e porque
 * "indicacao dra vivian" nao pode cair em ORGANICO por conter nome de perfil.
 */
const CHANNEL_PATTERNS: Array<[Channel, RegExp]> = [
  ["RECORRENCIA", /\b(PACIENTE ANTIGO|RECORRENCIA|RETORNO|REATIVACAO)\b/],
  ["INDICACAO", /\b(INDICACAO|INDICADO|INDICOU)\b/],
  ["BIO", /\bBIO\b/],
  ["FORMULARIO", /\b(FORMULARIO|FORM)\b/],
  [
    "TRAFEGO_PAGO",
    /\b(TRAFEGO|CAMPANHA|ANUNCIO|ADS|MKT|MARKETING|PAGO|PATROCINAD[OA])\b/,
  ],
  ["ORGANICO", /\b(ORGANICO|PERFIL|STORIES|REELS|CONTEUDO)\b/],
];

export interface ChannelClassification {
  /** Canal canonico, ou null quando nenhuma regra casou. Nunca ha bucket "outros". */
  channel: Channel | null;
  /** Campanha/qualificador vindo de segmentos separados por hifen. */
  campaign: string | null;
  /** Texto original normalizado, preservado para auditoria. Nunca publicado. */
  raw: string;
}

/**
 * Classifica o texto livre de canal em canal canonico + campanha.
 *
 * "formulario - mounjaro"   -> { channel: FORMULARIO,   campaign: "MOUNJARO" }
 * "depoimento - mkt"        -> { channel: TRAFEGO_PAGO, campaign: "DEPOIMENTO" }
 * "organico perfil natua"   -> { channel: ORGANICO,     campaign: null }
 *
 * Texto que nao casa com nenhuma regra devolve channel null. O adaptador
 * transforma isso em issue explicita: canal desconhecido nunca vira "outros"
 * nem e distribuido entre os conhecidos.
 */
export function classifyChannel(value: unknown): ChannelClassification {
  const raw = normalizeText(value);
  if (!raw) {
    return { channel: null, campaign: null, raw: "" };
  }

  const segments = raw
    .split(/\s*-\s*/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  let channel: Channel | null = null;
  let matchedIndex = -1;

  for (const [index, segment] of segments.entries()) {
    const hit = CHANNEL_PATTERNS.find(([, pattern]) => pattern.test(segment));
    if (hit) {
      channel = hit[0];
      matchedIndex = index;
      break;
    }
  }

  if (!channel) {
    return { channel: null, campaign: null, raw };
  }

  const campaign =
    segments.filter((_, index) => index !== matchedIndex).join(" - ") || null;

  return { channel, campaign, raw };
}
