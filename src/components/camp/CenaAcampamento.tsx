import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { CharacterAppearance } from '../../types'
import { appearanceKey } from '../../data/character/look'
import { resolveQuality } from '../../character3d/quality'
import { useGame } from '../../state/GameContext'
import { Character } from '../character/Character'
import { Icon, type IconName } from '../Icon'
import type { AlvoAcampamento, CampHandle } from '../../character3d/acampamento'
import type { Pose3D } from '../../character3d/rig'

/*
 * Cena do acampamento: 3D (Three.js) quando o aparelho permite; caso contrário
 * (qualidade "2D" ou sem WebGL), um cenário ilustrado em camadas com o
 * personagem 2D. Os rótulos clicáveis são botões de verdade nos dois casos.
 */

export interface RotuloAcampamento {
  id: AlvoAcampamento
  label: string
  detalhe?: string
  icon: IconName
  /** Número em destaque (ex.: baús prontos). */
  badge?: number
}

export interface CenaApi {
  gesto(p: Pose3D, s?: number): void
}

interface Props {
  appearance: CharacterAppearance
  elementos: string[]
  bauPronto: boolean
  rotulos: RotuloAcampamento[]
  onSelect(alvo: AlvoAcampamento): void
}

type Estado = 'carregando' | 'pronto' | '2d'

export const CenaAcampamento = forwardRef<CenaApi, Props>(function CenaAcampamento({ appearance, elementos, bauPronto, rotulos, onSelect }, ref) {
  const { settings } = useGame()
  const quality = resolveQuality(settings.graphics)
  const reduced = settings.reduceMotion || (typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches))
  const [estado, setEstado] = useState<Estado>(quality === '2d' ? '2d' : 'carregando')
  const palco = useRef<HTMLDivElement>(null)
  const handle = useRef<CampHandle | null>(null)
  const els = useRef(new Map<AlvoAcampamento, HTMLElement>())
  const selecionar = useRef(onSelect)
  selecionar.current = onSelect
  const ultima = useRef(appearance)
  ultima.current = appearance

  useImperativeHandle(ref, () => ({ gesto: (p, s) => handle.current?.gesto(p, s) }), [])

  const chaveElementos = elementos.join(',')
  useEffect(() => {
    if (quality === '2d' || !palco.current) return
    let cancelado = false
    const el = palco.current
    import('../../character3d/acampamento')
      .then(({ createCamp }) => {
        if (cancelado) return
        handle.current = createCamp(el, ultima.current, {
          quality,
          reduced,
          elementos,
          bauPronto,
          rotulos: els.current,
          onSelect: (a) => selecionar.current(a),
          onReady: () => !cancelado && setEstado('pronto'),
        })
      })
      .catch((e) => {
        console.warn('Cena 3D do acampamento indisponível; usando o cenário 2D.', e)
        if (!cancelado) setEstado('2d')
      })
    return () => {
      cancelado = true
      handle.current?.dispose()
      handle.current = null
    }
  }, [quality, reduced, chaveElementos, bauPronto]) // eslint-disable-line react-hooks/exhaustive-deps

  const chave = appearanceKey(appearance)
  useEffect(() => {
    handle.current?.setAppearance(appearance)
  }, [chave]) // eslint-disable-line react-hooks/exhaustive-deps

  const em2d = estado === '2d'
  return (
    <div className={`camp-scene ${em2d ? 'is-2d' : 'is-3d'} ${estado === 'carregando' ? 'is-loading' : ''} ${bauPronto ? 'has-chest' : ''}`}>
      {em2d ? (
        <div className="camp-paint" aria-hidden="true">
          <span className="camp-paint-sun" />
          <span className="camp-paint-mountains" />
          <span className="camp-paint-city" />
          <span className="camp-paint-hills" />
          <span className="camp-paint-ground" />
          <span className="camp-paint-tent" />
          <span className="camp-paint-fire"><i /><i /><i /></span>
          <span className="camp-paint-table" />
          <span className="camp-paint-board" />
          <span className={`camp-paint-chest ${bauPronto ? 'is-open' : ''}`} />
        </div>
      ) : (
        <div ref={palco} className="camp-canvas-host" />
      )}

      <div className="home-char camp-hero">
        {em2d ? (
          <Character appearance={appearance} size={230} pose="idle" title={`${appearance.name}, seu personagem`} />
        ) : (
          <span className="character sr-only" role="img" aria-label={`${appearance.name}, seu personagem`} data-appearance={chave} />
        )}
      </div>

      <div className="camp-labels">
        {rotulos.map((r) => (
          <button
            key={r.id}
            type="button"
            ref={(el) => {
              if (el) els.current.set(r.id, el)
              else els.current.delete(r.id)
            }}
            className={`camp-label camp-label-${r.id}`}
            data-visivel={em2d ? 'sim' : 'nao'}
            onClick={() => onSelect(r.id)}
            aria-label={r.detalhe ? `${r.label}: ${r.detalhe}` : r.label}
          >
            <span className="camp-label-icon" aria-hidden="true"><Icon name={r.icon} size={18} /></span>
            <span className="camp-label-text">{r.label}</span>
            {r.badge ? <span className="camp-badge" aria-hidden="true">{r.badge}</span> : null}
          </button>
        ))}
      </div>

      {estado === 'carregando' && (
        <p className="camp-loading" role="status">
          <span className="camp-loading-fire" aria-hidden="true" /> Montando o acampamento…
        </p>
      )}
    </div>
  )
})
