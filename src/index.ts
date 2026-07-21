// Re-exports for non-Svelte consumers (bundled by tsup).
// Implementation lives in runes.svelte.ts so Svelte's compiler handles
// $state runes natively via the "svelte" export condition.
export {
  createCmsClient,
  createAsyncStore,
  createMutation,
  createAuthStore,
  type SvelteCmsConfig,
  type AsyncStore,
  type AuthState,
  type AuthStore,
} from "./runes.js";
