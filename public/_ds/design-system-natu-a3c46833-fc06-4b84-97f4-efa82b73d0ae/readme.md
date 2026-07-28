# Natuá MedSpa — Design System

**Norte:** *Precisão que acolhe. Evolução que permanece.*

Natuá is a premium medical spa (MedSpa) led by Dr. Luciano Alves Neves. Its brand is built to read as **coordinated medicine, adult warmth, and monitored results** — not generic aesthetics or supplement marketing. The system exists to make every surface feel clinical, coordinated, and human, and to communicate the four verbs of the practice: **Investigar → Direcionar → Acompanhar → Sustentar**. The flagship offering is the **Plano DOC 365**, a year-long coordinated weight and maintenance program.

The signature visual device is the **Linha de Diagnóstico** — a thin gold line with progression nodes that connects phases, data, and decisions.

## Sources
Everything here is derived from the provided handoff package (read-only), not invented:
- Local mounted codebase: `claude-design/` (Vite + React + TypeScript design catalog).
- Upload: `uploads/Natua-Design-System-Claude-Design-Package/` (same package: `source/` app, `docs/`, `tokens/tokens.json`, preview PNGs).
- Key docs read: `DESIGN-DIRECTION.md`, `docs/BRAND-FOUNDATIONS.md`, `docs/CONTENT-AND-VOICE.md`, `docs/COMPONENTS.md`, and the source CSS (`src/styles/tokens.css`, `fonts.css`, `base.css`, `catalog.css`) + components (`BrandMark.tsx`, `PatternCards.tsx`).
- Fonts, brand symbol SVGs, and clinic photography were copied verbatim from `source/public/assets/`.

## Fonts
- **Playfair Display** (500, 600) — editorial display / brand titles.
- **Poppins** (400, 500, 600) — interface, data, body, commands.
- **SFMono-Regular** (system mono, no webfont) — tokens, counters, technical values.

No substitutions were needed — all webfonts were provided and are shipped from `assets/fonts/`.

---

## CONTENT FUNDAMENTALS
How Natuá writes (see `guidelines/brand-voice.card.html`; source: `docs/CONTENT-AND-VOICE.md`):

- **Voice:** clear, adult, firm without aggression, medical without unnecessary jargon, welcoming without infantilizing, premium without ostentation. Portuguese (pt-BR).
- **Address:** speaks to the patient as *você*; the practice speaks as *nós/observamos* ("Na avaliação, observamos composição corporal…"). Authority is shown by demonstration, never self-centered openings ("Como especialista, eu…" is avoided).
- **Structure of a message:** real scene the person recognizes → cause/mechanism they haven't understood → new way to see the problem → how Natuá investigates or monitors → next step with a concrete reason.
- **Casing:** sentence case for body and headings; **UPPERCASE only for eyebrows/labels** (tracked, `letter-spacing: 0.14em`). Display headlines set in Playfair, sentence case.
- **Responsible clinical language:** prefer "pode influenciar", "precisa ser avaliado", "quando indicado", "resultados variam por pessoa". Avoid "cura", "garantia", "resultado certo", clinical numbers without source/context.
- **CTA** must give a reason: *"Se você quer entender o que pode estar travando seu caso… agende uma avaliação."*
- **Emoji:** never. **Guide phrases** are load-bearing, e.g. *"A manutenção não começa quando você emagrece. Ela começa quando o plano é desenhado."*

---

## VISUAL FOUNDATIONS
(see the Colors / Type / Spacing / Brand cards in the Design System tab; source: `DESIGN-DIRECTION.md`, `catalog.css`)

- **Color:** Forest greens = authority/stability/brand surfaces; Medicinal green (forest-500/600) = action/confirmation; Mineral ivory + graphite = clarity and text; **Gold = signal only** (progress, criterion, the one decisive CTA) — never a dominant fill, never the whole lockup, never gradient/glow; Coral = risk/attention; Blue = information only. Max 1–2 background colors per composition. Dark surfaces use `--forest-950`/`--forest-900`.
- **Type:** Playfair Display for editorial/brand headlines (weight 500, tight line-height 1.05–1.15), Poppins for everything functional (line-height 1.65 body). Fluid scale `--type-display`→`--type-label`.
- **Spacing:** 4px base grid (`--space-1`…`--space-32`). Generous negative space; large uncontained areas to breathe. Content widths 760 / 1180 / 1440.
- **Backgrounds:** solid color fields (ivory or forest), and **full-bleed real photography** with a forest *protection gradient* (`rgb(6 19 15 / ~74%)`) behind copy — never on bare photography without a stable contrast zone. No decorative gradients, orbs, or textures.
- **Borders:** thin, precise, 1px hairlines (`--border-default`/`--border-inverse`), often used as structural dividers rather than boxes.
- **Corner radii:** **0–8px only** (`--radius-none/sm/md/lg`); pill (`999px`) reserved for badges and toggles.
- **Shadows:** restrained, cool green-black cast (`--shadow-sm/md/lg`). Cards default to a **1px border, not a shadow**; shadow is opt-in (`elevated`).
- **Cards:** allowed only for repeated/structured items (professionals, treatments, metrics, testimonials, tools) — never to float every section. Radius 8px.
- **Motion:** short, functional reveals; `--duration-fast 140ms` / `--duration-base 220ms`, ease `cubic-bezier(0.2,0,0,1)`. The Linha de Diagnóstico may advance on scroll. **No bounce, no decorative parallax.** Respects `prefers-reduced-motion`.
- **Hover states:** buttons lift `translateY(-1px)` + shift to an adjacent tone (e.g. forest-800 → forest-700); ghost/secondary fill with `--forest-50`; on dark, subtle `rgb(255 255 255 / 8%)`. **Press:** returns to `translateY(0)` (no shrink). **Focus:** 3px `--gold-400` outline, 3px offset.
- **Imagery vibe:** real people and real clinic environments, natural/warm controlled light, serene (never euphoric) expressions, negative space for copy. Never generic scales, isolated tape measures, or faceless bodies.
- **Transparency/blur:** used sparingly — sticky nav uses `backdrop-filter: blur` over `rgb(6 19 15 / 0.9)`; overlays use flat forest scrims, not blur.

---

## ICONOGRAPHY
- The source uses **[Lucide](https://lucide.dev)** (`lucide-react`) — thin, consistent 1.5–2px stroke line icons. Cards and UI kits load Lucide from CDN (`unpkg.com/lucide`) and pass icons into components via slots (`iconLeft`/`iconRight`, `icon`). Common glyphs seen in source: `ArrowRight`, `Stethoscope`, `Activity`, `Dumbbell`, `HeartPulse`, `ClipboardCheck`.
- **No custom icon font or SVG sprite** ships with the brand. The only bespoke SVG is the **brand symbol** (a stylized leaf/plant), provided in `assets/brand/` (forest + ivory) and inlined into the `BrandMark` component with `currentColor` so it recolors on light/dark.
- **No emoji, no unicode-glyph icons.** Icon sizes track text: ~16–18px inline, ~22–28px feature.

---

## Components
Reusable primitives (namespace `window.DesignSystemNatu_a3c468`), grouped by concern under `components/`:

**Actions** — `Button` (primary · secondary · ghost · accent · inverse-ghost; sizes sm/md/lg), `IconButton` (default · inverse).
**Forms** — `Field` (labeled input, hint/error), `Select`, `Switch`, `SegmentedControl`.
**Feedback** — `Badge` (brand · success · info · warning · neutral), `StatusMessage` (warning · info · success · danger).
**Brand** — `BrandMark` (lockup, inverse/compact), `Eyebrow` (default · gold), `DiagnosticLine` (the signature progression line).
**Layout** — `Card` (bordered or elevated).

The inventory mirrors the source's real component set (buttons, icon buttons, badges, fields, selects, toggles, segmented control, status messages, brand mark, eyebrow) plus one **intentional addition**: `DiagnosticLine`, promoting the brand's documented signature device into a reusable primitive.

## Index / manifest
- `styles.css` — entry point (consumers link this). `@import`s only.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css` (@font-face), `base.css`.
- `assets/` — `fonts/` (Poppins, Playfair woff2), `brand/` (leaf symbol SVGs), `photography/` (Dr. Luciano clinic images).
- `components/` — `actions/`, `forms/`, `feedback/`, `brand/`, `layout/` (each: `.jsx`, `.d.ts`, `.prompt.md`, one `@dsCard` HTML).
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand).
- `ui_kits/marketing/` — interactive recreation of the Natuá marketing site + booking flow (`index.html`, `site.jsx`, `README.md`).
- `thumbnail.html` — homepage tile.
- `SKILL.md` — Agent Skills entry for downloadable use.

*Note: `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` are generated by the compiler — do not edit.*
