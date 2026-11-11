import { useState, type FormEvent } from 'react'
import type { Difficulty, Question, QuestionCategory, QuestionType } from '../types'
import { BOOKS } from '../data/bible/canon'
import { STORY_SEQUENCE } from '../data/story'
import { QUESTION_TYPE_LABEL, DIFFICULTY_LABEL } from '../data/questions'
import { validateQuestion } from '../services/content'

const EDITABLE_TYPES: QuestionType[] = ['multiple', 'complete', 'truefalse', 'whoami', 'book', 'order']
const CATEGORIES: QuestionCategory[] = ['narrativa', 'personagens', 'versiculos', 'historia', 'geografia', 'cronologia', 'livros']

interface Draft {
  id: string
  bookId: string
  experienceId: string
  type: QuestionType
  difficulty: Difficulty
  category: QuestionCategory
  prompt: string
  verse: string
  options: string
  answerIndex: number
  answerBool: boolean
  clues: string
  items: string
  explanation: string
  reference: string
}

function toDraft(q?: Question): Draft {
  return {
    id: q?.id ?? `local-${Date.now().toString(36)}`,
    bookId: q?.bookId ?? 'genesis',
    experienceId: q?.experienceId ?? '',
    type: q?.type ?? 'multiple',
    difficulty: q?.difficulty ?? 1,
    category: q?.category ?? 'narrativa',
    prompt: q?.prompt ?? '',
    verse: q && 'verse' in q ? (q.verse ?? '') : '',
    options: q && 'options' in q ? q.options.join('\n') : '',
    answerIndex: q && 'options' in q ? q.answer : 0,
    answerBool: q?.type === 'truefalse' ? q.answer : true,
    clues: q && 'clues' in q && q.clues ? q.clues.join('\n') : '',
    items: q?.type === 'order' ? q.items.join('\n') : '',
    explanation: q?.explanation ?? '',
    reference: q?.reference ?? '',
  }
}

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)

function fromDraft(d: Draft): Question {
  const base = {
    id: d.id,
    bookId: d.bookId,
    experienceId: d.experienceId || undefined,
    difficulty: d.difficulty,
    category: d.category,
    prompt: d.prompt.trim(),
    explanation: d.explanation.trim(),
    reference: d.reference.trim(),
  }
  if (d.type === 'truefalse') return { ...base, type: 'truefalse', answer: d.answerBool }
  if (d.type === 'order') return { ...base, type: 'order', items: lines(d.items) }
  return {
    ...base,
    type: d.type as 'multiple',
    options: lines(d.options),
    answer: d.answerIndex,
    ...(d.type === 'complete' ? { verse: d.verse.trim() } : {}),
    ...(d.type === 'whoami' ? { clues: lines(d.clues) } : {}),
  }
}

export function QuestionEditor({ initial, onSave, onCancel }: { initial?: Question; onSave: (q: Question) => void; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(() => toDraft(initial))
  const [errors, setErrors] = useState<string[]>([])
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))
  const isChoice = ['multiple', 'complete', 'whoami', 'book'].includes(d.type)
  const opts = lines(d.options)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = fromDraft(d)
    const errs = validateQuestion(q)
    setErrors(errs)
    if (errs.length === 0) onSave(q)
  }

  return (
    <form className="panel stack admin-form" onSubmit={submit} aria-label={initial ? 'Editar pergunta local' : 'Nova pergunta local'}>
      <h3>{initial ? 'Editar pergunta local' : 'Nova pergunta local'}</h3>
      <div className="form-grid">
        <label className="field"><span>Modalidade</span>
          <select value={d.type} onChange={(e) => set('type', e.target.value as QuestionType)}>
            {EDITABLE_TYPES.map((t) => <option key={t} value={t}>{QUESTION_TYPE_LABEL[t]}</option>)}
          </select>
        </label>
        <label className="field"><span>Livro</span>
          <select value={d.bookId} onChange={(e) => set('bookId', e.target.value)}>
            {BOOKS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <label className="field"><span>Experiência (opcional)</span>
          <select value={d.experienceId} onChange={(e) => set('experienceId', e.target.value)}>
            <option value="">Nenhuma (só Modo Livre)</option>
            {STORY_SEQUENCE.filter((x) => x.bookId === d.bookId).map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
          </select>
        </label>
        <label className="field"><span>Dificuldade</span>
          <select value={d.difficulty} onChange={(e) => set('difficulty', Number(e.target.value) as Difficulty)}>
            {([1, 2, 3] as const).map((n) => <option key={n} value={n}>{DIFFICULTY_LABEL[n]}</option>)}
          </select>
        </label>
        <label className="field"><span>Categoria</span>
          <select value={d.category} onChange={(e) => set('category', e.target.value as QuestionCategory)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="field"><span>Referência bíblica</span>
          <input value={d.reference} onChange={(e) => set('reference', e.target.value)} placeholder="Ex.: Gênesis 1:1" />
        </label>
      </div>
      <label className="field"><span>Enunciado</span>
        <input value={d.prompt} onChange={(e) => set('prompt', e.target.value)} placeholder="Pergunta, afirmação ou instrução" />
      </label>
      {d.type === 'complete' && (
        <label className="field"><span>Trecho com lacuna (use ____)</span>
          <textarea rows={2} value={d.verse} onChange={(e) => set('verse', e.target.value)} placeholder="Apenas textos em domínio público ou licenciados" />
        </label>
      )}
      {d.type === 'whoami' && (
        <label className="field"><span>Pistas (uma por linha, da mais difícil para a mais fácil)</span>
          <textarea rows={3} value={d.clues} onChange={(e) => set('clues', e.target.value)} />
        </label>
      )}
      {isChoice && (
        <>
          <label className="field"><span>Alternativas (uma por linha)</span>
            <textarea rows={4} value={d.options} onChange={(e) => set('options', e.target.value)} />
          </label>
          <label className="field"><span>Resposta correta</span>
            <select value={d.answerIndex} onChange={(e) => set('answerIndex', Number(e.target.value))}>
              {opts.length === 0 && <option value={0}>Preencha as alternativas</option>}
              {opts.map((o, i) => <option key={i} value={i}>{o}</option>)}
            </select>
          </label>
        </>
      )}
      {d.type === 'truefalse' && (
        <label className="field"><span>Resposta correta</span>
          <select value={d.answerBool ? 'v' : 'f'} onChange={(e) => set('answerBool', e.target.value === 'v')}>
            <option value="v">Verdadeiro</option>
            <option value="f">Falso</option>
          </select>
        </label>
      )}
      {d.type === 'order' && (
        <label className="field"><span>Acontecimentos na ordem correta (um por linha)</span>
          <textarea rows={5} value={d.items} onChange={(e) => set('items', e.target.value)} />
        </label>
      )}
      <label className="field"><span>Explicação</span>
        <textarea rows={2} value={d.explanation} onChange={(e) => set('explanation', e.target.value)} />
      </label>
      {errors.length > 0 && (
        <ul className="form-error" role="alert">{errors.map((er) => <li key={er}>{er}</li>)}</ul>
      )}
      <div className="row-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-gold">Salvar neste navegador</button>
      </div>
    </form>
  )
}
