import { useState, type FormEvent } from 'react'
import type { Experience } from '../types'
import { BOOKS } from '../data/bible/canon'
import { ART } from '../data/images'

const paras = (s: string) => s.split(/\n\s*\n|\n/).map((x) => x.trim()).filter(Boolean)

/** Valida um rascunho de experiência. Retorna a lista de problemas. */
export function validateExperience(e: Experience): string[] {
  const errs: string[] = []
  if (e.title.trim().length < 3) errs.push('Título obrigatório.')
  if (!e.scope.trim()) errs.push('Passagem (escopo) obrigatória.')
  if (e.intro.length === 0) errs.push('Escreva a introdução.')
  if (e.narrative.length === 0) errs.push('Escreva a narrativa dramatizada.')
  if (e.references.length === 0) errs.push('Informe ao menos uma referência bíblica.')
  if (e.learning.length === 0) errs.push('Escreva o aprendizado.')
  if (e.passages.some((p) => !p.reference || !p.text)) errs.push('Trechos devem estar no formato "Referência | texto".')
  return errs
}

export function ExperienceEditor({ initial, onSave, onCancel }: { initial?: Experience; onSave: (e: Experience) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [bookId, setBookId] = useState(initial?.bookId ?? 'levitico')
  const [scope, setScope] = useState(initial?.scope ?? '')
  const [image, setImage] = useState(initial?.image ?? 'place-raheh')
  const [intro, setIntro] = useState(initial?.intro.join('\n') ?? '')
  const [narrative, setNarrative] = useState(initial?.narrative.join('\n') ?? '')
  const [passages, setPassages] = useState(initial?.passages.map((p) => `${p.reference} | ${p.text}`).join('\n') ?? '')
  const [references, setReferences] = useState(initial?.references.join('\n') ?? '')
  const [learning, setLearning] = useState(initial?.learning.join('\n') ?? '')
  const [errors, setErrors] = useState<string[]>([])

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const e: Experience = {
      id: initial?.id ?? `rascunho-${Date.now().toString(36)}`,
      bookId,
      order: initial?.order ?? 0,
      title: title.trim(),
      scope: scope.trim(),
      image,
      intro: paras(intro),
      narrative: paras(narrative),
      passages: paras(passages).map((l) => {
        const [reference, ...rest] = l.split('|')
        return { reference: (reference ?? '').trim(), text: rest.join('|').trim() }
      }),
      references: paras(references),
      learning: paras(learning),
      characters: initial?.characters ?? [],
      places: initial?.places ?? [],
    }
    const errs = validateExperience(e)
    setErrors(errs)
    if (errs.length === 0) onSave(e)
  }

  return (
    <form className="panel stack admin-form" onSubmit={submit} aria-label="Rascunho de experiência">
      <h3>{initial ? 'Editar rascunho' : 'Novo rascunho de experiência'}</h3>
      <div className="form-grid">
        <label className="field"><span>Título</span><input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span>Livro</span>
          <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
            {BOOKS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <label className="field"><span>Passagem</span><input value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Ex.: Levítico 16" /></label>
        <label className="field"><span>Imagem</span>
          <select value={image} onChange={(e) => setImage(e.target.value)}>
            {Object.values(ART).map((a) => <option key={a.key} value={a.key}>{a.title} ({a.artist})</option>)}
          </select>
        </label>
      </div>
      <label className="field"><span>1. Introdução (um parágrafo por linha)</span><textarea rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} /></label>
      <label className="field"><span>2. Narrativa dramatizada (sem falas atribuídas a personagens)</span><textarea rows={3} value={narrative} onChange={(e) => setNarrative(e.target.value)} /></label>
      <label className="field"><span>3. Trechos bíblicos em domínio público ("Referência | texto", um por linha)</span><textarea rows={3} value={passages} onChange={(e) => setPassages(e.target.value)} /></label>
      <label className="field"><span>3. Referências para leitura (uma por linha)</span><textarea rows={2} value={references} onChange={(e) => setReferences(e.target.value)} /></label>
      <label className="field"><span>4. Aprendizado (um parágrafo por linha)</span><textarea rows={3} value={learning} onChange={(e) => setLearning(e.target.value)} /></label>
      {errors.length > 0 && <ul className="form-error" role="alert">{errors.map((er) => <li key={er}>{er}</li>)}</ul>}
      <div className="row-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-gold">Salvar rascunho neste navegador</button>
      </div>
    </form>
  )
}
