import { createClient, type HttpClient } from "@lyeve/cms-client";

// Client factory

export interface SvelteCmsConfig {
  /** Base URL prepended to every request path. */
  baseUrl?: string;
  /**
   * Callback returning headers added to every request.
   * Called on every request so auth tokens can be refreshed without
   * recreating the client.
   */
  getHeaders?: () => Record<string, string>;
}

/**
 * Creates an HttpClient pre-configured with base URL and dynamic request
 * headers. No Provider needed - Svelte callers just pass the client around.
 *
 * @example
 * ```ts
 * const client = createCmsClient({
 *   baseUrl: 'https://cms.example.com',
 *   getHeaders: () => ({ Authorization: `Bearer ${token}` }),
 * });
 * ```
 */
export function createCmsClient(config: SvelteCmsConfig): HttpClient {
  const base = config.baseUrl ?? "";
  return createClient((url, init) => {
    const fullUrl = typeof url === "string" ? `${base}${url}` : url;
    return fetch(fullUrl, {
      ...init,
      headers: { ...init?.headers, ...config.getHeaders?.() },
    });
  });
}

// Generic async store

export interface AsyncStore<T> {
  readonly data: T | null;
  readonly error: Error | null;
  readonly loading: boolean;
  refetch: () => void;
}

/**
 * Reactive async data store using the $state rune.
 * Fires the fetcher immediately and exposes reactive loading/data/error
 * getters that Svelte components can read directly in markup.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const schemas = createAsyncStore((c) => getSchemas(c), client);
 * </script>
 * {#if schemas.loading}...{/if}
 * ```
 */
export function createAsyncStore<T>(
  fetcher: (client: HttpClient) => Promise<T>,
  client: HttpClient,
): AsyncStore<T> {
  let data = $state<T | null>(null);
  let error = $state<Error | null>(null);
  let loading = $state(true);

  async function fetch() {
    loading = true;
    try {
      data = await fetcher(client);
      error = null;
    } catch (e) {
      error = e as Error;
    } finally {
      loading = false;
    }
  }

  fetch();

  return {
    get data() {
      return data;
    },
    get error() {
      return error;
    },
    get loading() {
      return loading;
    },
    refetch: fetch,
  };
}

/**
 * Reactive mutation primitive using the $state rune.
 * Returns data/error/loading state and a run function that triggers the
 * mutation. Unlike createAsyncStore, the mutation does not fire immediately.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const createArticle = createMutation(
 *     (c, vars: { title: string }) => createArticle(c, vars),
 *     client,
 *   );
 * </script>
 * <button onclick={() => createArticle.run({ title: 'Hello' })}>
 *   {createArticle.loading ? 'Saving...' : 'Create'}
 * </button>
 * ```
 */
export function createMutation<T, V>(
  mutator: (client: HttpClient, vars: V) => Promise<T>,
  client: HttpClient,
) {
  let data = $state<T | null>(null);
  let error = $state<Error | null>(null);
  let loading = $state(false);

  async function run(vars: V): Promise<T> {
    loading = true;
    error = null;
    try {
      const result = await mutator(client, vars);
      data = result;
      return result;
    } catch (e) {
      error = e as Error;
      throw e;
    } finally {
      loading = false;
    }
  }

  return {
    get data() {
      return data;
    },
    get error() {
      return error;
    },
    get loading() {
      return loading;
    },
    run,
  };
}

// Auth store

export interface AuthState {
  user: { id: string; email: string; roles: string[] } | null;
  token: string | null;
}

export interface AuthStore {
  readonly user: AuthState["user"];
  readonly token: string | null;
  readonly isAuthenticated: boolean;
  /** Set the current user and token after a successful login. */
  setUser: (user: AuthState["user"], token: string | null) => void;
  /** Clear auth state (e.g. after logout). */
  clear: () => void;
  /** Try to load the current user from the server using the stored token. */
  load: () => Promise<void>;
}

/**
 * Simple reactive auth store. The caller is responsible for calling
 * {@link AuthStore.setUser} after login and {@link AuthStore.clear} after
 * logout. Use {@link AuthStore.load} on app start to restore a session
 * from an existing cookie.
 */
export function createAuthStore(client: HttpClient): AuthStore {
  let state = $state<AuthState>({ user: null, token: null });

  return {
    get user() {
      return state.user;
    },
    get token() {
      return state.token;
    },
    get isAuthenticated() {
      return state.token !== null;
    },
    setUser(user: AuthState["user"], token: string | null) {
      state = { user, token };
    },
    clear() {
      state = { user: null, token: null };
    },
    async load() {
      try {
        const user = await client.get<{
          id: string;
          email: string;
          roles: string[];
        }>("/api/admin/auth/me");
        state = { ...state, user };
      } catch {
        /* not logged in */
      }
    },
  };
}
