# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.1.0] - 2026-07-23

### Added

- Initial release.
- `createCmsClient` - factory for an `HttpClient` with base URL and dynamic request headers.
- `createAsyncStore` - generic reactive async data store using the `$state` rune (loading, data, error, refetch).
- `createAuthStore` - auth state store with login, logout, and session restore via lazy dynamic imports from `@lyeve/cms-client-rest`.