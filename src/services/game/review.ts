import type { AnswerResult, Progress, Question, QuestionRecord } from '../../types'
import { STORY_SEQUENCE } from '../../data/story'
import { CHARACTERS } from '../../data/library/characters'
import { questionMentions } from '../../data/themes'

const WEAK_RATIO = 0.7

/*
 * REVISÃO INTELIGENTE
 * Registra cada resposta por pergunta e agrega por fase (assunto).
 * - Assunto fraco: aproveitamento < 70% com pelo menos 3 respostas.
 * - Assunto dominado: aproveitamento >= 90% com pelo menos 5 respostas e
 *   nenhuma pergunta com erro pendente.
 * - Perguntas para revisão: as que o jogador errou da última vez.
 */

export function recordAnswers(review: Progress['review'], results: AnswerResult[], now = new Date()): Progress['review'] {
  const next = { ...review }
  for (const r of results) {
    const prev: QuestionRecord = next[r.questionId] ?? { seen: 0, wrong: 0, lastWrong: false, lastSeen: '' }
    next[r.questionId] = {
      seen: prev.seen + 1,
      wrong: prev.wrong + (r.correct ? 0 : 1),
      lastWrong: !r.correct,
      lastSeen: now.toISOString(),
    }
  }
  return next
}

export interface TopicStat {
  experienceId: string
  title: string
  bookId: string
  answered: number
  correct: number
  ratio: number
  pending: number
}

export function topicStats(p: Progress, pool: Question[]): TopicStat[] {
  return STORY_SEQUENCE.map((e) => {
    const qs = pool.filter((q) => q.experienceId === e.id)
    let answered = 0
    let wrong = 0
    let pending = 0
    for (const q of qs) {
      const r = p.review[q.id]
      if (!r) continue
      answered += r.seen
      wrong += r.wrong
      if (r.lastWrong) pending++
    }
    const correct = answered - wrong
    return { experienceId: e.id, title: e.title, bookId: e.bookId, answered, correct, ratio: answered ? correct / answered : 0, pending }
  }).filter((t) => t.answered > 0)
}

export function weakTopics(p: Progress, pool: Question[]): TopicStat[] {
  return topicStats(p, pool)
    .filter((t) => t.answered >= 3 && (t.ratio < 0.7 || t.pending >= 2))
    .sort((a, b) => a.ratio - b.ratio || b.pending - a.pending)
}

export function masteredTopics(p: Progress, pool: Question[]): TopicStat[] {
  return topicStats(p, pool).filter((t) => t.answered >= 5 && t.ratio >= 0.9 && t.pending === 0)
}

/** Perguntas para revisar: erros pendentes primeiro, depois as mais erradas. */
export function reviewQuestions(p: Progress, pool: Question[], max = 8, experienceId?: string): Question[] {
  const scored = pool
    .filter((q) => (!experienceId || q.experienceId === experienceId) && p.review[q.id] && p.review[q.id].wrong > 0)
    .map((q) => ({ q, r: p.review[q.id] }))
    .sort((a, b) => Number(b.r.lastWrong) - Number(a.r.lastWrong) || b.r.wrong / b.r.seen - a.r.wrong / a.r.seen)
  return scored.slice(0, max).map((x) => x.q)
}

export function pendingErrors(p: Progress): number {
  return Object.values(p.review).filter((r) => r.lastWrong).length
}

export interface CharacterStat {
  characterId: string
  name: string
  seen: number
  wrong: number
  ratio: number
}

/**
 * Personagens bíblicos com desempenho abaixo de 70%: considera as perguntas
 * respondidas que mencionam o personagem (com pelo menos 3 respostas).
 */
export function weakCharacters(p: Progress, pool: Question[]): CharacterStat[] {
  const out: CharacterStat[] = []
  for (const c of CHARACTERS) {
    let seen = 0
    let wrong = 0
    for (const [id, r] of Object.entries(p.review)) {
      const q = pool.find((x) => x.id === id)
      if (!q || !questionMentions(q, c.id)) continue
      seen += r.seen
      wrong += r.wrong
    }
    if (seen >= 3 && (seen - wrong) / seen < WEAK_RATIO) out.push({ characterId: c.id, name: c.name, seen, wrong, ratio: (seen - wrong) / seen })
  }
  return out.sort((a, b) => a.ratio - b.ratio)
}

/** Perguntas sobre um personagem, priorizando as erradas. */
export function characterReviewQuestions(p: Progress, pool: Question[], characterId: string, max = 8): Question[] {
  const qs = pool.filter((q) => questionMentions(q, characterId))
  const wrongFirst = [...qs].sort((a, b) => Number(Boolean(p.review[b.id]?.lastWrong)) - Number(Boolean(p.review[a.id]?.lastWrong)))
  return wrongFirst.slice(0, max)
}
