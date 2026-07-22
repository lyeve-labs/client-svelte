# Changelog

## [0.1.0] - 2026-07-22

### Added

- Initial release.
- `createCmsClient` - factory for an `HttpClient` with base URL and dynamic request headers.
- `createAsyncStore` - generic reactive async data store using the `$state` rune (loading, data, error, refetch).
- `createAuthStore` - auth state store with login, logout, and session restore via lazy dynamic imports from `@lyeve/cms-client-rest`.
