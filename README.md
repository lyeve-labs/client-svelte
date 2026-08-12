# @lyeve/cms-client-svelte

Svelte 5 reactive stores for the LyEve CMS API. Thin wrapper around
`@lyeve/cms-client` using Svelte 5 runes (`$state`).

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Svelte 5](https://img.shields.io/badge/svelte-5-ff3e00.svg)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org)

```bash
pnpm add @lyeve/cms-client @lyeve/cms-client-svelte
```

```svelte
<script lang="ts">
  import { createCmsClient, createAsyncStore } from '@lyeve/cms-client-svelte';
  import { getSchemas } from '@lyeve/cms-client-rest';

  const client = createCmsClient({
    baseUrl: 'https://cms.example.com',
    getHeaders: () => ({ Authorization: `Bearer ${token}` }),
  });

  const schemas = createAsyncStore((client) => getSchemas(client), client);
</script>

{#if schemas.loading}
  <p>Loading...</p>
{:else if schemas.error}
  <p>Error: {schemas.error.message}</p>
{:else}
  <ul>
    {#each schemas.data ?? [] as schema}
      <li>{schema.name}</li>
    {/each}
  </ul>
{/if}
```

No Provider needed. Create a client, pass it in, done.

---

## What's in the box

- **createCmsClient:** factory that returns a configured `HttpClient` with
  base URL and dynamic headers.
- **createAsyncStore:** reactive async data store built on `$state`. Returns
  `{ data, error, loading, refetch }`. All reactive, no boilerplate.
- **createAuthStore:** auth state store with reactive `user`, `token`, and
  `isAuthenticated`. Methods to `setUser`, `clear`, and `load` from storage.
- **Svelte 5 native:** built on runes. No legacy stores, no `writable`.

## Requirements

- **Node 20** or newer
- **Svelte 5.0** or newer
- **[@lyeve/cms-client](https://www.npmjs.com/package/@lyeve/cms-client)** `>=0.2.1`

## Install

```bash
pnpm add @lyeve/cms-client @lyeve/cms-client-svelte
# or npm install @lyeve/cms-client @lyeve/cms-client-svelte
# or yarn add @lyeve/cms-client @lyeve/cms-client-svelte
```

## Use

### Data fetching

```svelte
<script lang="ts">
  import { createCmsClient, createAsyncStore } from '@lyeve/cms-client-svelte';
  import { getSchemas } from '@lyeve/cms-client-rest';

  const client = createCmsClient({
    baseUrl: 'https://cms.example.com',
    getHeaders: () => ({ Authorization: `Bearer ${token}` }),
  });

  const schemas = createAsyncStore((c) => getSchemas(c), client);
</script>

{#if schemas.loading}
  <p>Loading...</p>
{:else if schemas.error}
  <p>Error: {schemas.error.message}</p>
{:else}
  <ul>
    {#each schemas.data ?? [] as schema}
      <li>{schema.name}</li>
    {/each}
  </ul>
{/if}

<button onclick={() => schemas.refetch()}>Reload</button>
```

### Authentication

```svelte
<script lang="ts">
  import { createCmsClient, createAuthStore } from '@lyeve/cms-client-svelte';

  const client = createCmsClient({ baseUrl: 'https://cms.example.com' });
  const auth = createAuthStore(client);

  function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const credentials = {
      email: data.get('email') as string,
      password: data.get('password') as string,
    };
    // Call your auth endpoint, then store the result:
    const user = { id: '1', email: credentials.email, roles: ['admin'] };
    auth.setUser(user, 'jwt-token');
  }
</script>

{#if !auth.isAuthenticated}
  <form onsubmit={handleLogin}>
    <input type="email" name="email" required />
    <input type="password" name="password" required />
    <button type="submit">Log in</button>
  </form>
{:else}
  <p>Welcome, {auth.user?.email}</p>
  <button onclick={() => auth.clear()}>Log out</button>
{/if}
```

## API

### createCmsClient(config)

```ts
function createCmsClient(config: {
  baseUrl?: string;
  getHeaders?: () => Record<string, string>;
}): HttpClient;
```

### createAsyncStore(fetcher, client)

```ts
function createAsyncStore<T>(
  fetcher: (client: HttpClient) => Promise<T>,
  client: HttpClient,
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
};
```

All fields are reactive (`$state` rune).

### createAuthStore(client)

```ts
function createAuthStore(client: HttpClient): {
  user: { id: string; email: string; roles: string[] } | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  clear: () => void;
  load: () => Promise<void>;
};
```

## Local development

```bash
pnpm install            # install dependencies
pnpm test               # run unit tests
pnpm check              # type-check
pnpm build              # tsup + publint -> dist/
```

## Project layout

```
src/
  index.ts           # public API (re-exports)
  index.svelte.ts    # Svelte 5 entry point
  runes.ts           # createAsyncStore, createAuthStore
  ambient.d.ts       # type declarations
tests/               # vitest test suite
```

## Versioning

`@lyeve/cms-client-svelte` follows [SemVer](https://semver.org). While under `1.0`,
breaking changes bump the **minor** version; additive changes bump the **patch**.
Every release is logged in [`CHANGELOG.md`](CHANGELOG.md).

## Contributing

Bug reports and feature requests are welcome. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the development setup and conventions.

## License

MIT. See [`LICENSE`](LICENSE).
