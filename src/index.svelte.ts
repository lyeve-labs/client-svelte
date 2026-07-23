// SvelteKit entry point (svelte export condition).
// Svelte's compiler handles $state runes from this file.
export {
	createCmsClient,
	createAsyncStore,
	createMutation,
	createAuthStore,
	type SvelteCmsConfig,
	type AsyncStore,
	type AuthState,
	type AuthStore,
} from './runes.js';
