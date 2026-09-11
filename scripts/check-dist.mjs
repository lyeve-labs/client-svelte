// Fails the build when dist references a @lyeve* package that is not this
// package itself and not a declared dependency. Catches the case that shipped
// broken 0.1.x/0.2.x tarballs: a scope rename landed in src but the published
// artifact still imported the retired @lyeve-labs/* packages, so consumers hit
// ERR_MODULE_NOT_FOUND on first import.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const declared = new Set([
  pkg.name,
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]);

// Sourcemaps embed the original source text, so a stale specifier there is
// cosmetic. Only emitted code and type declarations can break a consumer.
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : join(dir, e.name),
  );
}

const files = walk("dist").filter((f) => !f.endsWith(".map"));
const specifier = /(?:from|require\()\s*["'](@lyeve[^"']*)["']/g;
const bad = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  for (const [, spec] of src.matchAll(specifier)) {
    if (!declared.has(spec)) bad.push(`${file}: ${spec}`);
  }
}

// Load what we are about to publish. A package can pass every static check and
// still throw on the consumer's first import: this one shipped seven raw
// `$state(...)` calls in both bundles and nothing noticed, because the suite
// runs against src and the linters read text. Importing the artifact is the
// only check that would have failed.
const entries = [
  ["import", pkg.exports?.["."]?.import?.default ?? pkg.module],
  ["require", pkg.exports?.["."]?.require?.default ?? pkg.main],
];
for (const [condition, entry] of entries) {
  if (!entry) continue;
  const url = pathToFileURL(join(process.cwd(), entry)).href;
  try {
    const mod =
      condition === "require"
        ? createRequire(import.meta.url)(join(process.cwd(), entry))
        : await import(url);
    if (Object.keys(mod).filter((k) => k !== "default").length === 0) {
      console.error(`${pkg.name}: ${entry} loaded but exports nothing`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`${pkg.name}: ${entry} throws on ${condition}:`);
    console.error(`  ${err.message}`);
    process.exit(1);
  }
}

// A rune that reaches dist is a package that throws on import. esbuild strips
// the types from a .svelte.ts module and emits $state(...) verbatim, so the
// artifact looked fine and failed on the consumer's first import; the vitest
// config rewrites runes out of src before the suite loads, so the tests could
// not see it either. tsup.config.ts runs the module through svelte's
// compileModule now, and this refuses the build if that ever stops happening.
const runes = [];
for (const file of files) {
  if (file.endsWith(".d.ts") || file.endsWith(".d.cts")) continue;
  const src = readFileSync(file, "utf8");
  for (const [, rune] of src.matchAll(
    /(?:^|[^.\w$])(\$state|\$derived|\$effect|\$props|\$bindable|\$inspect)\s*[(.]/g,
  )) {
    runes.push(`${file}: ${rune}`);
  }
}

if (runes.length) {
  console.error(`${pkg.name}: dist carries uncompiled Svelte runes:`);
  for (const line of [...new Set(runes)]) console.error(`  ${line}`);
  console.error(
    "These throw ReferenceError on import. compileModule must run over every .svelte.ts entry.",
  );
  process.exit(1);
}

if (bad.length) {
  console.error(`${pkg.name}: dist imports undeclared @lyeve packages:`);
  for (const line of [...new Set(bad)]) console.error(`  ${line}`);
  console.error(
    "Declare them in dependencies/peerDependencies, or fix the import.",
  );
  process.exit(1);
}
