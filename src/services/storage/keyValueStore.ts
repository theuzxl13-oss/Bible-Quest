/** Abstração mínima de armazenamento chave/valor. */
export interface KeyValueStore {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}

/** Armazena no localStorage do navegador. Falhas (modo privado, cota) não quebram o jogo. */
export class BrowserLocalStore implements KeyValueStore {
  private fallback = new MemoryStore()

  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return this.fallback.get(key)
    }
  }

  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      this.fallback.set(key, value)
    }
  }

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch {
      this.fallback.remove(key)
    }
  }
}

export class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>()
  get(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null
  }
  set(key: string, value: string) {
    this.data.set(key, value)
  }
  remove(key: string) {
    this.data.delete(key)
  }
}
