import path from "node:path";
import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";

// El server usa imports con extensión .js (estilo nodenext/ESM). Este plugin
// resuelve esos imports a los archivos .ts correspondientes en los tests.
function resolveJsToTs(): Plugin {
  return {
    name: "resolve-js-to-ts",
    enforce: "pre",
    resolveId(source, importer) {
      if (source.startsWith(".") && source.endsWith(".js") && importer) {
        const ts = source.replace(/\.js$/, ".ts");
        return path.resolve(path.dirname(importer), ts);
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [resolveJsToTs()],
  test: {
    environment: "node",
    include: ["tests/**/*.spec.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
