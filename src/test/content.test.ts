import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { QUESTIONS, questionsForExperience } from '../data/questions'
import { BOOKS, booksOf, CANON_EVANGELICO } from '../data/bible/canon'
import { STORY_SEQUENCE, experiencesOf, getExperience } from '../data/story'
import { ART } from '../data/images'
import { GROUP_INFO } from '../data/bible/canon'
import { FREE_MODES, freeModePool } from '../services/game/freeModes'
import { validateQuestion } from '../services/content'
import type { QuestionType } from '../types'

const TYPES: QuestionType[] = ['multiple', 'complete', 'truefalse', 'whoami', 'book', 'order', 'memory']

describe('cânon', () => {
  it('tem 66 livros: 39 no AT e 27 no NT, de Gênesis a Apocalipse, sem ids repetidos', () => {
    expect(CANON_EVANGELICO.books).toHaveLength(66)
    expect(booksOf('AT')).toHaveLength(39)
    expect(booksOf('NT')).toHaveLength(27)
    expect(BOOKS[0].name).toBe('Gênesis')
    expect(booksOf('AT').at(-1)!.name).toBe('Malaquias')
    expect(booksOf('NT')[0].name).toBe('Mateus')
    expect(BOOKS.at(-1)!.name).toBe('Apocalipse')
    expect(new Set(BOOKS.map((b) => b.id)).size).toBe(66)
    expect(BOOKS.reduce((s, b) => s + b.chapters, 0)).toBe(1189)
  })
})

describe('Modo História: conteúdo', () => {
  it('Gênesis tem pelo menos 15 experiências e a jornada começa em Gênesis', () => {
    expect(experiencesOf('genesis').length).toBeGreaterThanOrEqual(15)
    expect(STORY_SEQUENCE[0].id).toBe('gn-criacao')
    expect(STORY_SEQUENCE[0].bookId).toBe('genesis')
  })

  it('a sequência respeita a ordem dos livros do cânon', () => {
    const idx = STORY_SEQUENCE.map((e) => BOOKS.findIndex((b) => b.id === e.bookId))
    expect(idx).toEqual([...idx].sort((a, b) => a - b))
  })

  it('cada experiência tem as 4 partes de leitura, referências e ao menos 5 perguntas', () => {
    expect(new Set(STORY_SEQUENCE.map((e) => e.id)).size).toBe(STORY_SEQUENCE.length)
    for (const e of STORY_SEQUENCE) {
      expect(e.intro.length, e.id).toBeGreaterThan(0)
      expect(e.narrative.length, e.id).toBeGreaterThan(0)
      expect(e.passages.length, e.id).toBeGreaterThan(0)
      expect(e.references.length, e.id).toBeGreaterThan(0)
      expect(e.learning.length, e.id).toBeGreaterThan(0)
      for (const p of e.passages) expect(p.text.length, p.reference).toBeLessThan(220)
      expect(questionsForExperience(e.id).length, e.id).toBeGreaterThanOrEqual(5)
    }
  })

  it('a narrativa dramatizada não contém falas citadas (aspas)', () => {
    for (const e of STORY_SEQUENCE) for (const p of e.narrative) expect(p, e.id).not.toMatch(/["“”]/)
  })

  it('as referências citam o livro da experiência', () => {
    for (const e of STORY_SEQUENCE) {
      const name = BOOKS.find((b) => b.id === e.bookId)!.name
      expect(e.scope.startsWith(name), e.id).toBe(true)
    }
  })
})

describe('banco de perguntas', () => {
  it('tem pelo menos 150 perguntas, sem ids nem enunciados repetidos', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(150)
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    const keys = QUESTIONS.map((q) => ('verse' in q && q.verse ? q.verse : q.prompt) + ('clues' in q && q.clues ? q.clues.join('|') : '') + ('pairs' in q ? JSON.stringify(q.pairs) : '') + ('items' in q ? q.items.join('|') : ''))
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([])
  })

  it('cada pergunta é válida, tem livro existente, explicação e referência', () => {
    for (const q of QUESTIONS) {
      if (q.type !== 'memory') expect(validateQuestion(q), q.id).toEqual([])
      expect(BOOKS.some((b) => b.id === q.bookId), q.id).toBe(true)
      expect(q.reference, q.id).toMatch(/^(\d )?[A-ZÁÊÔÍÚ][a-záéíóúâêôãõç]+( dos Apóstolos)? \d+/)
      if (q.type === 'memory') expect(q.pairs.length, q.id).toBeGreaterThanOrEqual(3)
    }
  })

  it('perguntas de experiência pertencem ao livro da experiência', () => {
    for (const q of QUESTIONS.filter((x) => x.experienceId)) {
      const e = getExperience(q.experienceId)
      expect(e, q.id).toBeDefined()
      expect(e!.bookId, q.id).toBe(q.bookId)
    }
  })

  it('há perguntas do Modo Livre sobre outros livros além de Gênesis e Êxodo', () => {
    const books = new Set(QUESTIONS.filter((q) => !q.experienceId).map((q) => q.bookId))
    expect(books.size).toBeGreaterThanOrEqual(10)
  })

  it('todas as 7 modalidades de pergunta existem', () => {
    const types = new Set(QUESTIONS.map((q) => q.type))
    for (const t of TYPES) expect(types.has(t), t).toBe(true)
  })
})

describe('Modo Livre', () => {
  it('tem 7 modalidades, cada uma com perguntas suficientes para uma rodada', () => {
    expect(FREE_MODES.map((m) => m.id)).toEqual(['aleatorias', 'verdadeiro-falso', 'complete', 'quem-sou-eu', 'contra-o-tempo', 'ordem', 'livro'])
    for (const m of FREE_MODES) {
      const need = m.id === 'contra-o-tempo' ? 20 : m.roundSize
      expect(freeModePool(m.id, QUESTIONS).length, m.id).toBeGreaterThanOrEqual(need)
    }
  })
})

describe('imagens', () => {
  it('todas as imagens usadas existem no catálogo e no disco', () => {
    const keys = new Set([
      ...STORY_SEQUENCE.map((e) => e.image),
      ...Object.values(GROUP_INFO).map((g) => g.image),
      ...FREE_MODES.map((m) => m.image),
      ...Object.keys(ART),
    ])
    for (const k of keys) {
      expect(ART[k], k).toBeDefined()
      expect(existsSync(resolve(__dirname, `../../public/images/art/${k}.webp`)), k).toBe(true)
      expect(existsSync(resolve(__dirname, `../../public/images/art/${k}-sm.webp`)), k).toBe(true)
    }
  })
})
