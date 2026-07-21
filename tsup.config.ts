import { defineConfig } from 'tsup';
import { compileModule } from 'svelte/compiler';
import fs from 'node:fs/promises';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ['@lyeve/cms-client', 'svelte'],
  esbuildPlugins: [
    {
      name: 'svelte-runes',
      setup(build) {
        build.onLoad({ filter: /\.ts$/ }, async (args) => {
          const content = await fs.readFile(args.path, 'utf8');
          // Only compile files that contain Svelte 5 runes
          if (!/\$state|\$derived|\$effect/.test(content)) return;
          try {
            const result = compileModule(content, {
              filename: args.path,
              dev: false,
              generate: 'client',
            });
            return { contents: result.js.code, loader: 'js' };
          } catch {
            // Fall through to default esbuild handling
            return;
          }
        });
      },
    },
  ],
});
