/** Gerador pseudoaleatório determinístico (mulberry32). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function shuffle<T>(list: readonly T[], rand: () => number = Math.random): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Embaralha garantindo que o resultado seja diferente da ordem original (quando possível). */
export function shuffleNotIdentity<T>(list: readonly T[], rand: () => number = Math.random): T[] {
  if (list.length < 2) return [...list]
  for (let i = 0; i < 10; i++) {
    const s = shuffle(list, rand)
    if (s.some((v, idx) => v !== list[idx])) return s
  }
  return [...list.slice(1), list[0]]
}
