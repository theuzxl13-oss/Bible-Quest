/** XP total necessário para alcançar o nível `level` (nível 1 = 0 XP). */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * level
}

export function levelFromXp(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp)
  const start = xpForLevel(level)
  const end = xpForLevel(level + 1)
  return { level, current: xp - start, needed: end - start, ratio: (xp - start) / (end - start) }
}

const TITLES = ['Peregrino', 'Aprendiz', 'Discípulo', 'Leitor fiel', 'Escriba', 'Sábio', 'Ancião', 'Mestre das Escrituras']

export function levelTitle(level: number): string {
  return TITLES[Math.min(level, TITLES.length) - 1]
}
