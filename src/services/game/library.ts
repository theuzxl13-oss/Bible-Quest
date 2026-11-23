import type { Experience, Progress } from '../../types'

/**
 * Desbloqueia na Biblioteca os personagens e lugares de uma fase quando o
 * jogador chega até ela. Retorna o que é novo, para exibir um aviso.
 */
export function unlockForExperience(p: Progress, exp: Experience, now = new Date()) {
  const newCharacters = exp.characters.filter((id) => !p.library.characters[id])
  const newPlaces = exp.places.filter((id) => !p.library.places[id])
  if (newCharacters.length === 0 && newPlaces.length === 0) return { progress: p, newCharacters, newPlaces }
  const at = now.toISOString()
  const next: Progress = {
    ...p,
    library: {
      characters: { ...p.library.characters, ...Object.fromEntries(newCharacters.map((id) => [id, at])) },
      places: { ...p.library.places, ...Object.fromEntries(newPlaces.map((id) => [id, at])) },
    },
  }
  return { progress: next, newCharacters, newPlaces }
}
