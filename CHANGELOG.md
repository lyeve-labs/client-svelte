# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
