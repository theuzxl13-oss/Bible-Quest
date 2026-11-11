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
import { CHARACTERS, getCharacter } from '../data/library/characters'
import { getPlace } from '../data/library/places'
import { BOOK_INFO } from '../data/library/books'
import { WORLDS } from '../data/worlds'
import { TIMELINE } from '../data/timeline'
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
  it('a jornada começa em Gênesis', () => {
    expect(STORY_SEQUENCE[0].id).toBe('gn-criacao')
    expect(STORY_SEQUENCE[0].bookId).toBe('genesis')
  })

  it('a sequência respeita a ordem dos livros do cânon', () => {
    const idx = STORY_SEQUENCE.map((e) => BOOKS.findIndex((b) => b.id === e.bookId))
    expect(idx).toEqual([...idx].sort((a, b) => a - b))
  })

  it('Gênesis tem 20 fases e toda fase tem de 5 a 10 perguntas', () => {
    expect(experiencesOf('genesis')).toHaveLength(20)
    for (const e of STORY_SEQUENCE) {
      const n = questionsForExperience(e.id).length
      expect(n, e.id).toBeGreaterThanOrEqual(5)
      expect(n, e.id).toBeLessThanOrEqual(10)
    }
  })

  it('as fases variam os tipos de exercício (pelo menos 3 tipos por fase)', () => {
    for (const e of STORY_SEQUENCE) expect(new Set(questionsForExperience(e.id).map((q) => q.type)).size, e.id).toBeGreaterThanOrEqual(3)
  })

  it('personagens e lugares das fases existem na Biblioteca', () => {
    for (const e of STORY_SEQUENCE) {
      for (const c of e.characters) expect(getCharacter(c), `${e.id}:${c}`).toBeDefined()
      for (const p of e.places) expect(getPlace(p), `${e.id}:${p}`).toBeDefined()
    }
    for (const c of CHARACTERS) {
      expect(c.references.length, c.id).toBeGreaterThan(0)
      expect(STORY_SEQUENCE.some((e) => e.characters.includes(c.id)), `${c.id} não aparece em nenhuma fase`).toBe(true)
      for (const r of c.relations) expect(getCharacter(r.id), `${c.id} -> ${r.id}`).toBeDefined()
    }
  })

  it('cada livro do cânon tem ficha na Biblioteca e pertence a exatamente um mundo', () => {
    for (const b of BOOKS) {
      expect(BOOK_INFO[b.id], b.id).toBeDefined()
      expect(WORLDS.filter((w) => w.books.includes(b.id)), b.id).toHaveLength(1)
    }
  })

  it('a linha do tempo classifica toda data e aponta para fases e livros existentes', () => {
    for (const t of TIMELINE) {
      expect(['biblico', 'estimado', 'debatido']).toContain(t.dating.kind)
      if (t.experienceId) expect(getExperience(t.experienceId), t.id).toBeDefined()
      for (const b of t.books) expect(BOOKS.some((x) => x.id === b), `${t.id}:${b}`).toBe(true)
    }
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
  it('tem pelo menos 190 perguntas, sem ids nem enunciados repetidos', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(190)
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    const keys = QUESTIONS.map((q) => ('verse' in q && q.verse ? q.verse : q.prompt) + ('clues' in q && q.clues ? q.clues.join('|') : '') + ('pairs' in q ? JSON.stringify(q.pairs) : '') + ('items' in q ? q.items.join('|') : ''))
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([])
  })

  it('cada pergunta é válida, tem livro existente, explicação e referência', () => {
    for (const q of QUESTIONS) {
      if (q.type !== 'memory' && q.type !== 'match') expect(validateQuestion(q), q.id).toEqual([])
      expect(BOOKS.some((b) => b.id === q.bookId), q.id).toBe(true)
      expect(q.reference, q.id).toMatch(/^(\d )?[A-ZÁÊÔÍÚ][a-záéíóúâêôãõç]+( dos Apóstolos)? \d+/)
      if (q.type === 'memory' || q.type === 'match') expect(q.pairs.length, q.id).toBeGreaterThanOrEqual(3)
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
  it('tem 10 modalidades, cada uma com perguntas suficientes para uma rodada', () => {
    expect(FREE_MODES.map((m) => m.id)).toEqual(['aleatorias', 'verdadeiro-falso', 'complete', 'quem-sou-eu', 'contra-o-tempo', 'ordem', 'livro', 'personagem', 'tema', 'dificuldade'])
    for (const m of FREE_MODES) {
      const need = m.id === 'contra-o-tempo' ? 20 : m.id === 'personagem' || m.id === 'tema' ? 5 : m.roundSize
      expect(freeModePool(m.id, QUESTIONS).length, m.id).toBeGreaterThanOrEqual(need)
    }
  })
})

describe('imagens', () => {
  it('todas as imagens usadas existem no catálogo e no disco', () => {
    const keys = new Set([
      ...STORY_SEQUENCE.map((e) => e.image),
      ...CHARACTERS.map((c) => c.image),
      ...WORLDS.map((w) => w.art),
      ...QUESTIONS.flatMap((q) => (q.image ? [q.image] : [])),
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
