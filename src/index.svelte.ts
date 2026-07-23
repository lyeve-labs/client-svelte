// Re-exports for SvelteKit consumers (compiles runes from source).
// All implementation lives in index.ts.
export {
  createCmsClient,
  createAsyncStore,
  createAuthStore,
  type SvelteCmsConfig,
  type AsyncStore,
  type AuthState,
  type AuthStore,
} from './index.js';
