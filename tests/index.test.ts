import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	createCmsClient,
	createAsyncStore,
	createAuthStore,
	type SvelteCmsConfig,
	type AsyncStore,
	type AuthStore,
} from '../src/index.js';

describe('createCmsClient', () => {
	it('returns an object with all HTTP methods', () => {
		const client = createCmsClient({});
		expect(typeof client.get).toBe('function');
		expect(typeof client.post).toBe('function');
		expect(typeof client.put).toBe('function');
		expect(typeof client.patch).toBe('function');
		expect(typeof client.delete).toBe('function');
	});

	it('prepends baseUrl', async () => {
		const fetchSpy = vi.fn().mockResolvedValue(new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } }));
		vi.stubGlobal('fetch', fetchSpy);

		const client = createCmsClient({ baseUrl: 'https://api.example.com' });
		await client.get('/schemas');

		expect(fetchSpy.mock.calls[0][0]).toBe('https://api.example.com/schemas');
		vi.unstubAllGlobals();
	});

	it('calls getHeaders on every request', async () => {
		const getHeaders = vi.fn().mockReturnValue({ Authorization: 'Bearer tok' });
		const fetchSpy = vi.fn().mockImplementation(() =>
			Promise.resolve(new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })));
		vi.stubGlobal('fetch', fetchSpy);

		const client = createCmsClient({ getHeaders });
		await client.get('/test');
		await client.get('/other');

		expect(getHeaders).toHaveBeenCalledTimes(2);
		const headers = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
		expect(headers.Authorization).toBe('Bearer tok');
		vi.unstubAllGlobals();
	});
});

describe('createAsyncStore', () => {
	let fetchSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchSpy = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ items: [1, 2, 3] }), { status: 200, headers: { 'content-type': 'application/json' } })
		);
		vi.stubGlobal('fetch', fetchSpy);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('starts in loading state', () => {
		const client = createCmsClient({});
		const store = createAsyncStore(() => Promise.resolve({ items: [1] }), client);
		expect(store.loading).toBe(true);
		expect(store.data).toBeNull();
		expect(store.error).toBeNull();
	});

	it('exposes shape (loading, data, error, refetch)', () => {
		const client = createCmsClient({});
		const store = createAsyncStore(() => Promise.resolve({ items: [1] }), client);
		expect(store).toHaveProperty('data');
		expect(store).toHaveProperty('error');
		expect(store).toHaveProperty('loading');
		expect(store).toHaveProperty('refetch');
		expect(typeof store.refetch).toBe('function');
	});

	it('fetcher receives the client', async () => {
		const client = createCmsClient({ baseUrl: 'http://test' });
		const fetcher = vi.fn().mockResolvedValue({ ok: true });
		createAsyncStore(fetcher, client);
		await vi.waitFor(() => expect(fetcher).toHaveBeenCalledWith(client));
	});
});

describe('createAuthStore', () => {
	it('starts unauthenticated', () => {
		const client = createCmsClient({});
		const auth = createAuthStore(client);
		expect(auth.user).toBeNull();
		expect(auth.token).toBeNull();
		expect(auth.isAuthenticated).toBe(false);
	});

	it('setUser updates state', () => {
		const client = createCmsClient({});
		const auth = createAuthStore(client);
		auth.setUser({ id: 'u1', email: 'a@b.com', roles: ['admin'] }, 'tok-123');
		expect(auth.isAuthenticated).toBe(true);
		expect(auth.token).toBe('tok-123');
		expect(auth.user?.email).toBe('a@b.com');
	});

	it('clear resets state', () => {
		const client = createCmsClient({});
		const auth = createAuthStore(client);
		auth.setUser({ id: 'u1', email: 'a@b.com', roles: ['admin'] }, 'tok');
		auth.clear();
		expect(auth.isAuthenticated).toBe(false);
		expect(auth.user).toBeNull();
		expect(auth.token).toBeNull();
	});

	it('load fetches current user', async () => {
		const fetchSpy = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ id: 'u1', email: 'a@b.com', roles: ['admin'] }), { status: 200, headers: { 'content-type': 'application/json' } })
		);
		vi.stubGlobal('fetch', fetchSpy);
		const client = createCmsClient({ baseUrl: 'http://test' });
		const auth = createAuthStore(client);
		await auth.load();
		expect(auth.user?.email).toBe('a@b.com');
		expect(fetchSpy.mock.calls[0][0]).toBe('http://test/api/admin/auth/me');
		vi.unstubAllGlobals();
	});

	it('load silently fails when not authenticated', async () => {
		const fetchSpy = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
		);
		vi.stubGlobal('fetch', fetchSpy);
		const client = createCmsClient({});
		const auth = createAuthStore(client);
		await auth.load();
		expect(auth.user).toBeNull();
		expect(auth.isAuthenticated).toBe(false);
		vi.unstubAllGlobals();
	});
});
