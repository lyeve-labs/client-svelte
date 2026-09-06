import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Absolute path to this package's src/, so the rune-strip guard below cannot go
// stale if the directory is renamed.
const SRC_DIR = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  plugins: [
    {
      // Compile .svelte.ts through Svelte, the same transform tsup applies.
      //
      // This used to be a regex that deleted the runes so vitest could load the
      // source without a compiler. The suite then exercised a rune-free rewrite
      // that is not the shipped artifact, which is how 171 lines of green tests
      // sat beside a dist that threw ReferenceError on import. Compiling means
      // the tests run the semantics the consumer gets.
      name: "svelte-compile-module",
      enforce: "pre",
      async transform(code: string, id: string) {
        if (!id.startsWith(SRC_DIR) || !/\.svelte\.ts$/.test(id)) return;
        const { compileModule } = await import("svelte/compiler");
        // typescript rather than esbuild: pnpm's layout does not expose
        // tsup's or vitest's own esbuild to this config, and typescript is
        // already a devDependency here.
        const ts = (await import("typescript")).default;
        const stripped = ts.transpileModule(code, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            verbatimModuleSyntax: false,
          },
          fileName: id,
        });
        const compiled = compileModule(stripped.outputText, {
          filename: id,
          generate: "client",
        });
        return { code: compiled.js.code, map: compiled.js.map };
      },
    },
  ],
  test: {
    include: ["tests/**/*.test.ts"],
    globals: true,
  },
});
