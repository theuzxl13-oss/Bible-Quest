import type { Progress } from '../../types'
import { JOURNEYS } from '../../data/journeys'

/** Uma jornada é liberada quando a anterior tem todos os capítulos concluídos. */
export function isJourneyUnlocked(journeyId: string, progress: Progress): boolean {
  const idx = JOURNEYS.findIndex((j) => j.id === journeyId)
  if (idx < 0) return false
  if (idx === 0) return true
  return JOURNEYS[idx - 1].chapters.every((c) => progress.chapters[c.id]?.completed)
}

/** Um capítulo é liberado quando a jornada está liberada e o capítulo anterior foi concluído. */
export function isChapterUnlocked(chapterId: string, progress: Progress): boolean {
  const journey = JOURNEYS.find((j) => j.chapters.some((c) => c.id === chapterId))
  if (!journey || !isJourneyUnlocked(journey.id, progress)) return false
  const idx = journey.chapters.findIndex((c) => c.id === chapterId)
  if (idx === 0) return true
  return Boolean(progress.chapters[journey.chapters[idx - 1].id]?.completed)
}

export function journeyCompletion(journeyId: string, progress: Progress) {
  const journey = JOURNEYS.find((j) => j.id === journeyId)
  if (!journey) return { done: 0, total: 0, stars: 0, maxStars: 0 }
  const done = journey.chapters.filter((c) => progress.chapters[c.id]?.completed).length
  const stars = journey.chapters.reduce((s, c) => s + (progress.chapters[c.id]?.bestStars ?? 0), 0)
  return { done, total: journey.chapters.length, stars, maxStars: journey.chapters.length * 3 }
}

export type Medal = 'ouro' | 'prata' | 'bronze' | null

/** Medalha da jornada conforme a média de estrelas. */
export function journeyMedal(journeyId: string, progress: Progress): Medal {
  const c = journeyCompletion(journeyId, progress)
  if (c.total === 0 || c.done < c.total) return null
  const ratio = c.stars / c.maxStars
  if (ratio === 1) return 'ouro'
  if (ratio >= 2 / 3) return 'prata'
  return 'bronze'
}

/** Próximo capítulo disponível e ainda não concluído. */
export function nextChapter(progress: Progress) {
  for (const j of JOURNEYS) {
    for (const c of j.chapters) {
      if (!progress.chapters[c.id]?.completed && isChapterUnlocked(c.id, progress)) return c
    }
  }
  return null
}
