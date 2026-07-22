import { describe, it, expect, vi } from 'vitest';
import {
  createCmsClient,
  createAsyncStore,
  createAuthStore,
} from '../src/index.js';

describe('@lyeve/cms-client-svelte', () => {
  describe('createCmsClient', () => {
    it('returns an object with HTTP methods', () => {
      const client = createCmsClient({});
      expect(client).toHaveProperty('get');
      expect(client).toHaveProperty('post');
      expect(client).toHaveProperty('put');
      expect(client).toHaveProperty('patch');
      expect(client).toHaveProperty('delete');
      expect(typeof client.get).toBe('function');
      expect(typeof client.post).toBe('function');
      expect(typeof client.put).toBe('function');
      expect(typeof client.patch).toBe('function');
      expect(typeof client.delete).toBe('function');
    });

    it('prepends baseUrl to request paths', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(
        new Response('[]', { status: 200 }),
      );
      vi.spyOn(globalThis, 'fetch').mockImplementation(fetchSpy);

      const client = createCmsClient({ baseUrl: 'https://example.com/api' });
      await client.get('/schemas');

      const calledUrl = fetchSpy.mock.calls[0][0];
      expect(calledUrl).toBe('https://example.com/api/schemas');

      vi.restoreAllMocks();
    });

    it('calls getHeaders on every request', async () => {
      const getHeaders = vi.fn().mockReturnValue({ 'X-Custom': 'value' });
      const fetchSpy = vi.fn().mockResolvedValue(
        new Response('[]', { status: 200 }),
      );
      vi.spyOn(globalThis, 'fetch').mockImplementation(fetchSpy);

      const client = createCmsClient({
        baseUrl: 'https://example.com',
        getHeaders,
      });
      await client.get('/test');

      expect(getHeaders).toHaveBeenCalledTimes(1);
      const options = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(options.headers).toHaveProperty('X-Custom', 'value');

      vi.restoreAllMocks();
    });
  });

  describe('createAsyncStore', () => {
    it('returns a store with loading/data/error/refetch', async () => {
      const client = createCmsClient({});
      const store = createAsyncStore(
        () => Promise.resolve({ items: [1, 2, 3] }),
        client,
      );

      expect(store).toHaveProperty('data');
      expect(store).toHaveProperty('error');
      expect(store).toHaveProperty('loading');
      expect(store).toHaveProperty('refetch');
      expect(typeof store.refetch).toBe('function');
    });
  });

  describe('createAuthStore', () => {
    it('returns initial unauthenticated state', () => {
      const client = createCmsClient({});
      const auth = createAuthStore(client);

      expect(auth).toHaveProperty('user');
      expect(auth).toHaveProperty('token');
      expect(auth).toHaveProperty('isAuthenticated');
      expect(auth).toHaveProperty('setUser');
      expect(auth).toHaveProperty('clear');
      expect(auth).toHaveProperty('load');
      expect(typeof auth.setUser).toBe('function');
      expect(typeof auth.clear).toBe('function');
      expect(typeof auth.load).toBe('function');
      expect(auth.user).toBeNull();
      expect(auth.token).toBeNull();
      expect(auth.isAuthenticated).toBe(false);
    });
  });
});
