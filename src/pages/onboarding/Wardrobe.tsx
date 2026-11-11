import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { BeardStyle, BodyBuild, CharacterAppearance, FaceStyle, HairStyle } from '../../types'
import { Character, type CharacterViewApi } from '../../components/character/Character'
import { DYES, beardOf, bodyOf } from '../../data/character/look'
import { Icon } from '../../components/Icon'
import { BASES, HAIR_COLORS, HAIR_COLOR_LABEL, SKIN_TONES, newAppearance } from '../../data/character/bases'
import { ITEMS, PLACE_LABEL, SLOT_LABEL, type CharacterItem, type ItemSlot } from '../../data/character/items'
import { equipItem, isEquipped, isItemUnlocked, requirementLabel, unequipItem } from '../../services/game/items'
import { useGame } from '../../state/GameContext'
import { StepBar } from './StepBar'

type Tab = 'aparencia' | ItemSlot
const TABS: { id: Tab; label: string }[] = [
  { id: 'aparencia', label: 'Cabelo e rosto' },
  { id: 'tunica', label: SLOT_LABEL.tunica },
  { id: 'manto', label: SLOT_LABEL.manto },
  { id: 'calcado', label: SLOT_LABEL.calcado },
  { id: 'cinto', label: SLOT_LABEL.cinto },
  { id: 'acessorio', label: SLOT_LABEL.acessorio },
]

const HAIR: { id: HairStyle; label: string }[] = [
  { id: 'curto', label: 'Curto' },
  { id: 'longo', label: 'Longo' },
  { id: 'ondulado', label: 'Ondulado' },
  { id: 'cacheado', label: 'Cacheado' },
  { id: 'coque', label: 'Coque' },
  { id: 'tranca', label: 'Trança' },
  { id: 'raspado', label: 'Raspado' },
]
const FACES: { id: FaceStyle; label: string }[] = [
  { id: 'suave', label: 'Suave' },
  { id: 'marcante', label: 'Sobrancelhas marcantes' },
  { id: 'sardas', label: 'Sardas' },
]
const BODIES: { id: BodyBuild; label: string }[] = [
  { id: 'masculino', label: 'Masculino' },
  { id: 'feminino', label: 'Feminino' },
]
const BEARDS: { id: BeardStyle; label: string }[] = [
  { id: 'nenhuma', label: 'Sem barba' },
  { id: 'curta', label: 'Curta' },
  { id: 'cheia', label: 'Cheia' },
]

function DyePicker({ slot, draft, onChange }: { slot: 'tunica' | 'manto'; draft: CharacterAppearance; onChange: (v: number | undefined) => void }) {
  const cur = draft.dyes?.[slot]
  return (
    <fieldset className="field dye-field">
      <legend>Tingimento {slot === 'tunica' ? 'da túnica' : 'do manto'}</legend>
      <div className="swatches">
        <label className={`swatch swatch-original ${cur === undefined ? 'is-on' : ''}`} title="Cor original do item">
          <input type="radio" name={`dye-${slot}`} checked={cur === undefined} onChange={() => onChange(undefined)} />
          <span className="sr-only">Cor original</span>
        </label>
        {DYES.map((d, i) => (
          <label key={d.label} className={`swatch ${cur === i ? 'is-on' : ''}`} style={{ background: d.color }} title={d.label}>
            <input type="radio" name={`dye-${slot}`} checked={cur === i} onChange={() => onChange(i)} />
            <span className="sr-only">{d.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/**
 * Etapa 4 (criação) e guarda-roupa (edição). A prévia em corpo inteiro usa o
 * mesmo renderizador do jogo inteiro; nada é salvo até o jogador confirmar.
 */
export default function Wardrobe({ mode }: { mode: 'criar' | 'editar' }) {
  const { profile, progress, saveCharacter } = useGame()
  const navigate = useNavigate()
  const location = useLocation()
  const baseId = (location.state as { base?: string } | null)?.base ?? BASES[0].id
  const saved = profile?.character
  const [draft, setDraft] = useState<CharacterAppearance>(() => saved ?? newAppearance(baseId, profile?.nickname ?? ''))
  const [tab, setTab] = useState<Tab>('aparencia')
  const [flash, setFlash] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const changed = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved])
  const [created, setCreated] = useState(false)
  const viewer = useRef<CharacterViewApi>(null)
  const [spin, setSpin] = useState(false)

  // Só segue para a chegada depois que o personagem salvo estiver no estado.
  useEffect(() => {
    if (created && saved) navigate('/chegada', { replace: true })
  }, [created, saved, navigate])

  if (!profile) return <Navigate to="/entrar" replace />
  if (created) return null
  if (mode === 'criar' && saved) return <Navigate to="/guarda-roupa" replace />
  if (mode === 'editar' && !saved) return <Navigate to="/personagem" replace />

  const update = (next: CharacterAppearance) => {
    setDraft(next)
    setFlash((f) => f + 1)
    setStatus('')
  }

  const toggleItem = (item: CharacterItem) => {
    if (!isItemUnlocked(item, progress)) return
    update(isEquipped(draft, item.id) ? unequipItem(draft, item.id) : equipItem(draft, item.id))
  }

  const finish = () => {
    if (draft.name.trim().length < 2) {
      setError('Dê um nome ao seu personagem (pelo menos 2 letras).')
      setTab('aparencia')
      return
    }
    saveCharacter(draft)
    if (mode === 'criar') setCreated(true)
    else setStatus('Aparência salva. Ela já aparece em todas as telas do jogo.')
  }

  const items = ITEMS.filter((i) => i.slot === tab)
  const unlockedCount = ITEMS.filter((i) => isItemUnlocked(i, progress)).length

  return (
    <section className="onb wardrobe">
      <div className="container stack-lg">
        {mode === 'criar' && <StepBar current={4} />}
        <header className="page-header">
          <p className="eyebrow">{mode === 'criar' ? 'Personalização' : 'Guarda-roupa'}</p>
          <h1>{mode === 'criar' ? 'Personalize seu aventureiro' : 'Personalizar personagem'}</h1>
          <p className="page-header-lead">
            Vestimentas inspiradas nas roupas dos tempos bíblicos. {unlockedCount} de {ITEMS.length} itens desbloqueados; os
            demais são conquistados jogando.
          </p>
        </header>

        <div className="wardrobe-grid">
          <div className="wardrobe-preview panel">
            <div className="creator-glow" aria-hidden="true" />
            <div className={flash ? 'wardrobe-stage' : 'wardrobe-stage'}>
              <Character ref={viewer} live controls autoRotate={spin} appearance={draft} size={300} pose="idle" title={`Prévia de ${draft.name || 'seu personagem'}. Arraste para girar.`} />
            </div>
            <div className="view-controls" role="group" aria-label="Visualização do personagem">
              <button type="button" className="chip" onClick={() => viewer.current?.setView('frente')}>Frente</button>
              <button type="button" className="chip" onClick={() => viewer.current?.setView('lado')}>Lado</button>
              <button type="button" className="chip" onClick={() => viewer.current?.setView('costas')}>Costas</button>
              <button type="button" className={`chip ${spin ? 'is-on' : ''}`} aria-pressed={spin} onClick={() => { setSpin(!spin); viewer.current?.setAutoRotate(!spin) }}>Girar 360°</button>
              <button type="button" className="chip" aria-label="Aproximar" onClick={() => viewer.current?.zoom(0.8)}>+</button>
              <button type="button" className="chip" aria-label="Afastar" onClick={() => viewer.current?.zoom(1.25)}>−</button>
            </div>
            <p className="creator-name">{draft.name || 'Sem nome'}</p>
            <p className="small muted">{BASES.find((b) => b.id === draft.base)?.label}</p>
            <ul className="equipped-list small" aria-label="Itens equipados">
              {[draft.equipped.tunica, draft.equipped.manto, draft.equipped.calcado, draft.equipped.cinto, ...draft.equipped.acessorios]
                .filter(Boolean)
                .map((id) => <li key={id}>{ITEMS.find((i) => i.id === id)?.name}</li>)}
            </ul>
          </div>

          <div className="panel wardrobe-panel">
            <div className="tabs" role="tablist" aria-label="Categorias">
              {TABS.map((t) => (
                <button key={t.id} role="tab" id={`wt-${t.id}`} aria-selected={tab === t.id} aria-controls="wardrobe-tab" className={`tab ${tab === t.id ? 'is-on' : ''}`} onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            <div id="wardrobe-tab" role="tabpanel" aria-labelledby={`wt-${tab}`}>
              {tab === 'aparencia' ? (
                <div className="stack">
                  <div className="field">
                    <label htmlFor="char-name">Nome do personagem</label>
                    <input id="char-name" value={draft.name} maxLength={20} onChange={(e) => update({ ...draft, name: e.target.value })} placeholder="Ex.: Tobias, Lia, Ana..." />
                  </div>
                  <fieldset className="field">
                    <legend>Corpo</legend>
                    <div className="chips">
                      {BODIES.map((b) => (
                        <label key={b.id} className={`chip ${bodyOf(draft) === b.id ? 'is-on' : ''}`}>
                          <input type="radio" name="body" checked={bodyOf(draft) === b.id} onChange={() => update({ ...draft, body: b.id, beard: b.id === 'feminino' ? 'nenhuma' : draft.beard })} /> {b.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="field">
                    <legend>Tom de pele</legend>
                    <div className="swatches">
                      {SKIN_TONES.map((c, i) => (
                        <label key={c} className={`swatch ${draft.skin === i ? 'is-on' : ''}`} style={{ background: c }}>
                          <input type="radio" name="skin" checked={draft.skin === i} onChange={() => update({ ...draft, skin: i })} />
                          <span className="sr-only">Tom de pele {i + 1}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="field">
                    <legend>Rosto</legend>
                    <div className="chips">
                      {FACES.map((f) => (
                        <label key={f.id} className={`chip ${draft.face === f.id ? 'is-on' : ''}`}>
                          <input type="radio" name="face" checked={draft.face === f.id || (f.id === 'suave' && draft.face === 'barba')} onChange={() => update({ ...draft, face: f.id, beard: beardOf(draft) })} /> {f.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {bodyOf(draft) === 'masculino' && (
                    <fieldset className="field">
                      <legend>Barba</legend>
                      <div className="chips">
                        {BEARDS.map((b) => (
                          <label key={b.id} className={`chip ${beardOf(draft) === b.id ? 'is-on' : ''}`}>
                            <input type="radio" name="beard" checked={beardOf(draft) === b.id} onChange={() => update({ ...draft, beard: b.id, face: draft.face === 'barba' ? 'suave' : draft.face })} /> {b.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}
                  <fieldset className="field">
                    <legend>Estilo do cabelo</legend>
                    <div className="chips">
                      {HAIR.map((h) => (
                        <label key={h.id} className={`chip ${draft.hairStyle === h.id ? 'is-on' : ''}`}>
                          <input type="radio" name="hair" checked={draft.hairStyle === h.id} onChange={() => update({ ...draft, hairStyle: h.id })} /> {h.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="field">
                    <legend>Cor do cabelo</legend>
                    <div className="swatches">
                      {HAIR_COLORS.map((c, i) => (
                        <label key={c} className={`swatch ${draft.hairColor === i ? 'is-on' : ''}`} style={{ background: c }} title={HAIR_COLOR_LABEL[i]}>
                          <input type="radio" name="hairColor" checked={draft.hairColor === i} onChange={() => update({ ...draft, hairColor: i })} />
                          <span className="sr-only">{HAIR_COLOR_LABEL[i]}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              ) : (
                <>
                  {(tab === 'tunica' || (tab === 'manto' && draft.equipped.manto)) && (
                    <DyePicker slot={tab} draft={draft} onChange={(v) => update({ ...draft, dyes: { ...draft.dyes, [tab]: v } })} />
                  )}
                  {(tab === 'manto' || tab === 'cinto') && (
                    <button type="button" className={`chip none-chip ${draft.equipped[tab] === null ? 'is-on' : ''}`} onClick={() => update({ ...draft, equipped: { ...draft.equipped, [tab]: null } })}>
                      Sem {tab === 'manto' ? 'manto' : 'cinto'}
                    </button>
                  )}
                  <ul className="item-grid">
                    {items.map((item) => {
                      const unlocked = isItemUnlocked(item, progress)
                      const on = isEquipped(draft, item.id)
                      const removable = item.slot !== 'tunica' && item.slot !== 'calcado'
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            className={`item-card ${on ? 'is-on' : ''} ${unlocked ? '' : 'is-locked'}`}
                            aria-pressed={on}
                            aria-disabled={!unlocked}
                            aria-label={`${item.name}${item.slot === 'acessorio' ? ` (${PLACE_LABEL[item.place]})` : ''}. ${unlocked ? (on ? (removable ? 'Equipado; toque para retirar.' : 'Equipado.') : 'Toque para equipar.') : `Bloqueado: ${requirementLabel(item.unlock)}.`}`}
                            onClick={() => toggleItem(item)}
                          >
                            <span className="item-preview">
                              <Character appearance={equipItem(draft, item.id)} size={64} pose="still" portrait={item.slot === 'acessorio' && item.place === 'cabeca'} />
                              {!unlocked && <span className="item-lock"><Icon name="lock" size={18} /></span>}
                              {on && <span className="item-check"><Icon name="check" size={14} /></span>}
                            </span>
                            <strong>{item.name}</strong>
                            <span className="small muted">{unlocked ? item.description : requirementLabel(item.unlock)}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <p className="small" role="status" aria-live="polite">{status}</p>
        <div className="row-actions wardrobe-actions">
          {mode === 'criar' ? (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/personagem')}><Icon name="arrowLeft" /> Escolher outro personagem</button>
              <button type="button" className="btn btn-gold btn-lg" onClick={finish}>Finalizar personagem <Icon name="check" /></button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-ghost" disabled={!changed} onClick={() => saved && update(saved)}>Descartar alterações</button>
              <button type="button" className="btn btn-outline" disabled={!profile.previousCharacter} onClick={() => profile.previousCharacter && update(profile.previousCharacter)}>
                Restaurar aparência anterior
              </button>
              <button type="button" className="btn btn-gold btn-lg" disabled={!changed} onClick={finish}>Salvar aparência</button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
