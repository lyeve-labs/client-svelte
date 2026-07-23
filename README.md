# @lyeve/cms-client-svelte

Svelte 5 reactive stores for the LyEve CMS API. Thin wrapper around `@lyeve/cms-client` using Svelte 5 runes (`$state`).

No Provider needed - Svelte users just create a client and pass it around.

## Install

```sh
pnpm add @lyeve/cms-client @lyeve/cms-client-svelte
```

## Usage

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

### Authentication

```svelte
<script lang="ts">
  import { createCmsClient, createAuthStore } from '@lyeve/cms-client-svelte';

  const client = createCmsClient({ baseUrl: 'https://cms.example.com' });
  const auth = createAuthStore(client);

  function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const credentials = { email: data.get('email') as string, password: data.get('password') as string };

    // Call your auth endpoint, then store the result:
    const user = { id: '1', email: credentials.email, roles: ['admin'] };
    auth.setUser(user, 'jwt-token');
  }

  function handleLogout() {
    auth.clear();
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
  <button onclick={handleLogout}>Log out</button>
{/if}
```

## API

### `createCmsClient(config)`

Returns an `HttpClient` configured with base URL and dynamic headers:

```ts
const client = createCmsClient({
  baseUrl?: string;
  getHeaders?: () => Record<string, string>;
});
```

### `createAsyncStore(fetcher, client)`

Reactive async data store using Svelte 5 `$state` rune:

```ts
const store = createAsyncStore(
  (client) => getSchemas(client),
  client,
);
// store.data    - T | null
// store.error   - Error | null
// store.loading - boolean
// store.refetch - () => void
```

### `createAuthStore(client)`

Auth state store with reactive user, token, and methods to set/clear/restore sessions:

```ts
const auth = createAuthStore(client);
// auth.user            - { id, email, roles } | null
// auth.token           - string | null
// auth.isAuthenticated - boolean
// auth.setUser(user, token) - void
// auth.clear()             - void
// auth.load()              - Promise<void>
```

## License

MIT
