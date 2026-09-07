# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.6] - 2026-09-07

### Fixed

- The published bundles shipped Svelte runes uncompiled. `dist/index.js` and
  `dist/index.cjs` each carried seven raw `$state(...)` calls and threw
  `ReferenceError: $state is not defined` on a consumer's first import, so only
  the `svelte` export condition worked, where the consumer's own compiler
  handled the file. `.svelte.ts` modules now go through Svelte's
  `compileModule` at build time and both entries load and run under plain node.
  Svelte is already a peer dependency, so the compiled output needs nothing a
  consumer does not already have.
- The test suite stripped the runes with a regex before loading the source, so
  it exercised a rewrite rather than the artifact. It compiles them now, and
  the cases run against real reactivity.

## [0.1.5] - 2026-09-02

### Changed

- CONTRIBUTING documents the branch model. It covered commits and releases but never said which branch a change starts from: work branches off `dev` and the PR goes back into `dev`, while `main` takes merges and carries the release tags.

## [0.1.4] - 2026-08-12

### Changed

- Move to node 24 and pnpm 10.33.4.
- Build against client 0.3.0, and raise the `@lyeve-labs/client` peer floor to
  0.2.1. The previous floor allowed 0.1.x, which was never published to the registry.

### Fixed

- Point the README, contributing guide, and security policy at the published
  `@lyeve-labs` scope. They still named the retired `@lyeve/cms-*` packages, so
  every documented install command resolved to a package that does not exist.

## [0.1.3] - 2026-08-04

### Fixed

- Compile the rune store by naming it `runes.svelte.ts` so the Svelte compiler processes it.
- Split the `types` export condition so TypeScript resolves `.d.ts` under `import` and `.d.cts` under `require`.

## [0.1.2] - 2026-07-28

Published with no user-facing changes; repository tooling only.

## [0.1.1] - 2026-07-24

### Fixed

- Removed `svelte/compiler` `compileModule` plugin from tsup config, which broke on TypeScript generics. Runes are now handled by SvelteKit's compiler via the `svelte` export condition, not tsup.
- `createAuthStore` now exposes `setUser`/`clear`/`load` methods instead of `login`/`logout` (the old methods implied an HTTP call the store doesn't make).
- README and CHANGELOG updated to match the actual API.

## [0.1.0] - 2026-07-23

### Added

- Initial release.
- `createCmsClient` - factory for an `HttpClient` with base URL and dynamic request headers.
- `createAsyncStore` - generic reactive async data store using the `$state` rune (loading, data, error, refetch).
- `createAuthStore` - auth state store with `setUser`, `clear`, and `load` (session restore).
