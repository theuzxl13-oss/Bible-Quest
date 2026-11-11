import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { QUESTIONS, questionsForChapter } from '../data/questions'
import { ALL_CHAPTERS, JOURNEYS } from '../data/journeys'
import { ART } from '../data/images'
import type { QuestionType } from '../types'

const TYPES: QuestionType[] = ['multiple', 'complete', 'truefalse', 'whoami', 'book', 'order', 'memory']

describe('banco de perguntas', () => {
  it('tem pelo menos 100 perguntas', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(100)
  })

  it('não tem ids repetidos', () => {
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('não tem enunciados repetidos', () => {
    const keys = QUESTIONS.map((q) => ('verse' in q && q.verse ? q.verse : q.prompt) + ('clues' in q && q.clues ? q.clues.join('|') : '') + ('pairs' in q ? JSON.stringify(q.pairs) : ''))
    const dup = keys.filter((k, i) => keys.indexOf(k) !== i)
    expect(dup).toEqual([])
  })

  it('cada pergunta tem explicação, referência, dificuldade e categoria', () => {
    for (const q of QUESTIONS) {
      expect(q.explanation.length, q.id).toBeGreaterThan(10)
      expect(q.reference, q.id).toMatch(/^(\d )?[A-ZÁÊÔÍÚ][a-záéíóúâêôãõç]+( dos Apóstolos)? \d+/)
      expect([1, 2, 3]).toContain(q.difficulty)
      expect(q.category).toBeTruthy()
    }
  })

  it('questões de escolha têm resposta válida e opções sem repetição', () => {
    for (const q of QUESTIONS) {
      if ('options' in q) {
        expect(q.options.length, q.id).toBeGreaterThanOrEqual(3)
        expect(new Set(q.options).size, q.id).toBe(q.options.length)
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0)
        expect(q.answer, q.id).toBeLessThan(q.options.length)
      }
      if (q.type === 'complete') expect(q.verse, q.id).toContain('____')
      if (q.type === 'whoami') expect(q.clues?.length, q.id).toBeGreaterThanOrEqual(2)
      if (q.type === 'order') expect(q.items.length, q.id).toBeGreaterThanOrEqual(4)
      if (q.type === 'memory') expect(q.pairs.length, q.id).toBeGreaterThanOrEqual(3)
    }
  })

  it('todas as 7 modalidades existem e cada jornada usa todas elas', () => {
    for (const j of JOURNEYS) {
      const types = new Set(QUESTIONS.filter((q) => q.journeyId === j.id).map((q) => q.type))
      for (const t of TYPES) expect(types.has(t), `${j.id} sem ${t}`).toBe(true)
    }
  })

  it('cada capítulo tem pelo menos 5 perguntas e cada pergunta aponta para um capítulo da própria jornada', () => {
    for (const c of ALL_CHAPTERS) expect(questionsForChapter(c.id).length, c.id).toBeGreaterThanOrEqual(5)
    for (const q of QUESTIONS) {
      const c = ALL_CHAPTERS.find((x) => x.id === q.chapterId)
      expect(c, q.id).toBeDefined()
      expect(c!.journeyId, q.id).toBe(q.journeyId)
    }
  })
})

describe('jornadas', () => {
  it('cinco jornadas com capítulos, narrativa, contexto e trechos bíblicos', () => {
    expect(JOURNEYS.map((j) => j.id)).toEqual(['criacao', 'noe', 'abraao', 'jose', 'moises'])
    for (const c of ALL_CHAPTERS) {
      expect(c.narrative.length).toBeGreaterThan(0)
      expect(c.context.length).toBeGreaterThan(0)
      expect(c.passages.length).toBeGreaterThan(0)
      for (const p of c.passages) expect(p.text.length).toBeLessThan(220) // apenas trechos curtos
    }
  })

  it('a narrativa dramatizada não contém citações diretas (aspas) atribuídas a personagens', () => {
    for (const c of ALL_CHAPTERS) for (const p of c.narrative) expect(p, c.id).not.toMatch(/["“”]/)
  })

  it('todas as imagens usadas existem no catálogo e no disco', () => {
    const keys = new Set([...JOURNEYS.map((j) => j.image), ...ALL_CHAPTERS.map((c) => c.image)])
    for (const k of Object.keys(ART)) keys.add(k)
    for (const k of keys) {
      expect(ART[k], k).toBeDefined()
      expect(existsSync(resolve(__dirname, `../../public/images/art/${k}.webp`)), k).toBe(true)
      expect(existsSync(resolve(__dirname, `../../public/images/art/${k}-sm.webp`)), k).toBe(true)
    }
  })
})
