/** In-memory stand-in for `@/lib/cache`, shared by tests that persist small JSON values. */
export function createMemoryCache() {
  const store = new Map<string, unknown>();
  return {
    store,
    getCacheJson: jest.fn(async (key: string) => (store.has(key) ? store.get(key) : null)),
    setCacheJson: jest.fn(async (key: string, value: unknown) => {
      store.set(key, value);
    }),
  };
}
