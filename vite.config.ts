import path from "path";
import { defineConfig } from "vite";

/**
 * O dashboard e uma pagina estatica que consome `public/data/dashboard-snapshot.js`
 * em tempo de execucao. Ate 2026-08-07 este arquivo carregava os plugins de React
 * e Tailwind para uma aplicacao em `src/` que montava em `#root` — um elemento que
 * nunca existiu no `index.html`. Aquele app nunca renderizou, nunca entrou no
 * bundle e carregava pacientes ficticios, KPIs fixos e a marca errada. Foi
 * removido; o historico dele continua no git.
 *
 * `src/data-pipeline/` nao passa por aqui: roda em Node, pelo `server.ts` e pela
 * CLI de atualizacao.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== "true",
    watch: process.env.DISABLE_HMR === "true" ? null : {},
  },
});
