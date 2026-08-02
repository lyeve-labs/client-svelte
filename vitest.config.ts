import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Absolute path to this package's src/, so the rune-strip guard below cannot go
// stale if the directory is renamed.
const SRC_DIR = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  plugins: [
    {
      name: "svelte-runes-strip",
      enforce: "pre",
      transform(code: string, id: string) {
        if (!id.startsWith(SRC_DIR)) return;
        // Strip Svelte 5 runes so vitest (no Svelte compiler) can load the source.
        // Replaces `let x = $state<T>(val)` with `let x = val`
        // and `$derived(...)` with `(...)` and `$effect(...)` with a noop.
        let out = code;
        // typed: $state<Foo>(expr) > expr
        out = out.replace(/\$state\s*<[^>]*>\s*\(/g, "(");
        // untyped: $state(expr) > expr
        out = out.replace(/\$state\s*\(/g, "(");
        out = out.replace(/\$derived\s*\(/g, "(");
        out = out.replace(/\$effect\s*\(/g, "(()=>{})(");
        if (out !== code) return { code: out };
      },
    },
  ],
  test: {
    include: ["tests/**/*.test.ts"],
    globals: true,
  },
});
