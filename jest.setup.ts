/**
 * Test environment polyfills.
 *
 * The app reads/writes `localStorage` in several utilities. Jest runs in Node,
 * where there is no DOM and therefore no Storage API. We install a minimal,
 * standards-compliant in-memory shim so utility tests can exercise the real
 * storage code paths without touching a real browser.
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length(): number {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
}

const globalAny = globalThis as unknown as {
  localStorage: Storage
  sessionStorage: Storage
}

globalAny.localStorage = new MemoryStorage()
globalAny.sessionStorage = new MemoryStorage()
