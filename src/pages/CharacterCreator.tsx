import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { CharacterConfig } from '../types'
import {
  ACCESSORY_OPTIONS,
  ARCHETYPES,
  Adventurer,
  DEFAULT_CHARACTER,
  HAIR_COLORS,
  HAIR_OPTIONS,
  OUTFIT_COLORS,
  OUTFIT_OPTIONS,
  SKIN_TONES,
} from '../components/Adventurer'
import { ArtImage } from '../components/ArtImage'
import { Icon } from '../components/Icon'
import { Notice } from '../components/ui'
import { useGame } from '../state/GameContext'

function Swatches({ label, colors, value, onChange }: { label: string; colors: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <fieldset className="field">
      <legend>{label}</legend>
      <div className="swatches">
        {colors.map((c, i) => (
          <label key={c} className={`swatch ${value === i ? 'is-on' : ''}`} style={{ background: c }}>
            <input type="radio" name={label} checked={value === i} onChange={() => onChange(i)} />
            <span className="sr-only">{label} {i + 1}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Chips<T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset className="field">
      <legend>{label}</legend>
      <div className="chips">
        {options.map((o) => (
          <label key={o.id} className={`chip ${value === o.id ? 'is-on' : ''}`}>
            <input type="radio" name={label} checked={value === o.id} onChange={() => onChange(o.id)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]

export default function CharacterCreator() {
  const { profile, saveCharacter } = useGame()
  const navigate = useNavigate()
  const location = useLocation()
  const editing = Boolean(profile?.character)
  const [c, setC] = useState<CharacterConfig>(() => profile?.character ?? { ...DEFAULT_CHARACTER, name: profile?.nickname ?? '' })
  const [error, setError] = useState('')
  const set = <K extends keyof CharacterConfig>(k: K, v: CharacterConfig[K]) => setC((x) => ({ ...x, [k]: v }))

  const randomize = () =>
    setC((x) => ({
      ...x,
      skin: Math.floor(Math.random() * SKIN_TONES.length),
      hair: pick(HAIR_OPTIONS).id,
      hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
      outfit: pick(OUTFIT_OPTIONS).id,
      outfitColor: Math.floor(Math.random() * OUTFIT_COLORS.length),
      accessory: pick(ACCESSORY_OPTIONS).id,
    }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (c.name.trim().length < 2) {
      setError('Dê um nome ao seu personagem (pelo menos 2 letras).')
      return
    }
    saveCharacter(c)
    const from = (location.state as { from?: string } | null)?.from
    navigate(editing ? '/perfil' : from && from !== '/personagem' ? from : '/historia', { replace: true })
  }

  return (
    <section className="creator">
      <ArtImage art="abraham-journey" className="hero-bg" priority decorative />
      <div className="hero-shade" />
      <div className="container creator-grid">
        <div className="creator-preview panel">
          <p className="eyebrow">{editing ? 'Editar personagem' : 'Antes de partir'}</p>
          <h1>{editing ? 'Seu aventureiro' : 'Crie seu aventureiro'}</h1>
          <div className="creator-stage" aria-live="polite">
            <div className="creator-glow" aria-hidden="true" />
            <Adventurer config={c} size={190} className="adv-idle" title={`Prévia de ${c.name || 'seu personagem'}`} />
            <p className="creator-name">{c.name || 'Sem nome'}</p>
            <p className="small muted">{ARCHETYPES.find((a) => a.id === c.archetype)?.label}</p>
          </div>
          <Notice tone="info" icon="compass">
            Seu personagem é um aventureiro que acompanha a jornada e conhece os acontecimentos das Escrituras. Ele não
            representa nenhum personagem bíblico.
          </Notice>
        </div>

        <form className="panel creator-form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="char-name">Nome do personagem</label>
            <input id="char-name" value={c.name} maxLength={20} onChange={(e) => set('name', e.target.value)} placeholder="Ex.: Tobias, Lia, Ana..." />
          </div>

          <fieldset className="field">
            <legend>Estilo de aventureiro</legend>
            <div className="archetypes">
              {ARCHETYPES.map((a) => (
                <label key={a.id} className={`archetype ${c.archetype === a.id ? 'is-on' : ''}`}>
                  <input type="radio" name="archetype" checked={c.archetype === a.id} onChange={() => setC((x) => ({ ...x, ...a.preset, archetype: a.id }))} />
                  <Adventurer config={{ ...c, ...a.preset, archetype: a.id }} size={64} portrait />
                  <strong>{a.label}</strong>
                  <span className="small muted">{a.description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Swatches label="Tom de pele" colors={SKIN_TONES} value={c.skin} onChange={(v) => set('skin', v)} />
          <Chips label="Cabelo" options={HAIR_OPTIONS} value={c.hair} onChange={(v) => set('hair', v)} />
          <Swatches label="Cor do cabelo" colors={HAIR_COLORS} value={c.hairColor} onChange={(v) => set('hairColor', v)} />
          <Chips label="Vestimenta" options={OUTFIT_OPTIONS} value={c.outfit} onChange={(v) => set('outfit', v)} />
          <Swatches label="Cor da vestimenta" colors={OUTFIT_COLORS} value={c.outfitColor} onChange={(v) => set('outfitColor', v)} />
          <Chips label="Acessório" options={ACCESSORY_OPTIONS} value={c.accessory} onChange={(v) => set('accessory', v)} />

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="row-actions">
            <button type="button" className="btn btn-outline" onClick={randomize}>Sortear aparência</button>
            <button type="submit" className="btn btn-gold btn-lg">
              {editing ? 'Salvar aparência' : 'Começar a jornada'} <Icon name="arrowRight" />
            </button>
          </div>
          {editing && <p className="small muted">Mudar a aparência não altera seu progresso, XP ou conquistas.</p>}
        </form>
      </div>
    </section>
  )
}
