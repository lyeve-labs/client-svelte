import { defineConfig } from "tsup";
import { readFile } from "node:fs/promises";
import { compileModule } from "svelte/compiler";

// esbuild does not know what a rune is. It stripped the types from
// runes.svelte.ts and emitted `$state(...)` verbatim, so dist/index.js and
// dist/index.cjs each carried seven raw rune calls and threw
// `ReferenceError: $state is not defined` for every consumer reaching the
// package through `import` or `require`. Only the "svelte" export condition
// worked, because there the consumer's own compiler handled the file, and the
// vitest config strips runes before the suite loads, so nothing here saw it.
//
// compileModule is the transform Svelte applies to a .svelte.js module: plain
// JS backed by svelte's reactivity runtime. svelte is already a peer
// dependency, so the output imports nothing a consumer lacks.
const svelteRunes = {
  name: "svelte-runes",
  setup(build: any) {
    build.onLoad({ filter: /\.svelte\.ts$/ }, async (args: any) => {
      const source = await readFile(args.path, "utf8");
      // esbuild is tsup's dependency, not ours; the plugin API hands us the
      // running instance so we do not have to declare it.
      const stripped = await build.esbuild.transform(source, {
        loader: "ts",
        format: "esm",
        target: "es2022",
      });
      const compiled = compileModule(stripped.code, {
        filename: args.path,
        generate: "client",
      });
      return { contents: compiled.js.code, loader: "js" };
    });
  },
};

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  // svelte/* so the compiled output's svelte/internal/client import stays
  // external; a bare "svelte" does not match the subpath.
  external: ["@lyeve-labs/client", "svelte", /^svelte\//],
  esbuildPlugins: [svelteRunes],
});
