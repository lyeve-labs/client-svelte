/**
 * Ambient type declarations for Svelte 5 runes used in `.ts` source files.
 *
 * When the Svelte compiler processes these files (via the esbuild plugin at
 * build time, or the consumer's SvelteKit pipeline from the `svelte` export
 * condition), `$state`, `$derived`, and `$effect` are transformed into
 * compiler-managed reactive primitives. These declarations allow TypeScript
 * to type-check the source without the Svelte preprocessor.
 *
 * @see https://svelte.dev/docs/svelte/runes
 */

/**
 * Declares a reactive state variable.
 * @template T - The type of the state value.
 * @param initial - The initial value.
 */
declare function $state<T>(initial: T): T;

/**
 * Declares a derived value that updates when its dependencies change.
 * @template T - The type of the derived value.
 * @param expression - The expression to derive.
 */
declare function $derived<T>(expression: T): T;

/**
 * Runs a side-effect function when its dependencies change.
 * @param fn - The effect function, optionally returning a cleanup function.
 */
declare function $effect(fn: () => void | (() => void)): void;
