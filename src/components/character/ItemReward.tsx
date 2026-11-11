import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { getItem, PLACE_LABEL, SLOT_LABEL } from '../../data/character/items'
import { equipItem, isEquipped, requirementLabel } from '../../services/game/items'
import { useGame } from '../../state/GameContext'
import { Icon } from '../Icon'
import { Character } from './Character'

/** Telas em que a recompensa pode aparecer (nunca no meio de uma partida). */
const SHOW_ON = [/^\/painel$/, /^\/resultado$/, /^\/historia$/, /^\/quiz$/, /^\/guarda-roupa$/]

/**
 * Tela de recompensa de item: mostra cada item recém-desbloqueado (fila em
 * `progress.items.unseen`) com prévia no personagem, o motivo e as opções
 * Equipar ou Guardar para depois.
 */
export function ItemReward() {
  const { profile, progress, equipNow, acknowledgeItems } = useGame()
  const { pathname } = useLocation()
  const btn = useRef<HTMLButtonElement>(null)
  const queue = progress.items.unseen.filter((id) => getItem(id))
  const id = queue[0]
  const item = id ? getItem(id) : undefined
  const active = Boolean(item && profile?.character && SHOW_ON.some((r) => r.test(pathname)))

  useEffect(() => {
    if (active) btn.current?.focus()
  }, [active, id])

  if (!active || !item || !profile?.character) return null
  const character = profile.character
  const already = isEquipped(character, item.id)

  return (
    <div className="modal-backdrop item-reward" role="dialog" aria-modal="true" aria-labelledby="ir-t" aria-describedby="ir-why">
      <div className="modal item-reward-modal">
        <p className="eyebrow">Novo item desbloqueado{queue.length > 1 ? ` · 1 de ${queue.length}` : ''}</p>
        <div className="item-reward-stage">
          <div className="item-reward-burst" aria-hidden="true" />
          <Character live appearance={equipItem(character, item.id)} size={150} pose="react" title={`${character.name} com ${item.name}`} />
        </div>
        <h2 id="ir-t">{item.name}</h2>
        <p className="small muted">{SLOT_LABEL[item.slot]}{item.slot === 'acessorio' ? ` · ${PLACE_LABEL[item.place]}` : ''} · {item.description}</p>
        <p id="ir-why" className="item-reward-why"><Icon name="laurel" size={16} /> Motivo: {requirementLabel(item.unlock)}</p>
        <div className="row-actions">
          <button
            ref={btn}
            type="button"
            className="btn btn-gold"
            onClick={() => {
              if (!already) equipNow(item.id)
              acknowledgeItems([item.id])
            }}
          >
            {already ? 'Continuar' : 'Equipar'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => acknowledgeItems([item.id])}>Guardar para depois</button>
          {queue.length > 1 && (
            <button type="button" className="btn btn-ghost" onClick={() => acknowledgeItems(queue)}>Guardar todos ({queue.length})</button>
          )}
        </div>
        <p className="small muted">Os itens guardados ficam no guarda-roupa.</p>
      </div>
    </div>
  )
}
