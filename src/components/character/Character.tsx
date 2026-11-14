import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { CharacterAppearance } from '../../types'
import { appearanceKey } from '../../data/character/look'
import { resolveQuality } from '../../character3d/quality'
import type { ViewerHandle, View } from '../../character3d/runtime'
import { useGame } from '../../state/GameContext'
import { Character2D, type CharacterPose } from './Character2D'

export type { CharacterPose }

/*
 * RENDERIZADOR ÚNICO DO PERSONAGEM
 * Toda tela desenha o personagem por aqui. Conforme a qualidade gráfica:
 * - "ao vivo" (live): personagem 3D animado, com rotação e zoom quando há controles;
 * - imagem: o MESMO modelo 3D renderizado em imagem (miniaturas, mapas, topo),
 *   para não abrir dezenas de contextos WebGL;
 * - 2D: desenho em camadas (aparelhos sem WebGL ou opção "2D").
 * Em todos os casos o elemento raiz expõe `data-appearance` com a identidade
 * completa da aparência, para verificar a consistência entre telas.
 */

export interface CharacterProps {
  appearance: CharacterAppearance
  /** Largura em pixels. Corpo inteiro tem proporção 3:4; retrato, 1:1. */
  size?: number
  pose?: CharacterPose
  portrait?: boolean
  className?: string
  title?: string
  /** Personagem 3D animado (usar só em telas de destaque). */
  live?: boolean
  /** Permite girar e aproximar com o dedo ou o mouse (exige live). */
  controls?: boolean
  autoRotate?: boolean
}

export interface CharacterViewApi {
  setView(v: View): void
  zoom(f: number): void
  setAutoRotate(on: boolean): void
}

type Runtime = typeof import('../../character3d/runtime')
let runtimePromise: Promise<Runtime> | null = null
/** Carrega o módulo 3D sob demanda (fica fora do pacote inicial). */
export function loadRuntime() {
  if (!runtimePromise) runtimePromise = import('../../character3d/runtime')
  return runtimePromise
}

function useQuality() {
  const { settings } = useGame()
  return { quality: resolveQuality(settings.graphics), reduced: settings.reduceMotion || (typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)) }
}

export const Character = forwardRef<CharacterViewApi, CharacterProps>(function Character(props, ref) {
  const { quality, reduced } = useQuality()
  if (quality === '2d') return <Character2D {...props} pose={props.pose} />
  if (props.live) return <CharacterLive {...props} ref={ref} quality={quality} reduced={reduced} />
  return <CharacterImage {...props} quality={quality} />
})

function boxSize(size: number, portrait?: boolean) {
  return { width: size, height: portrait ? size : Math.round((size * 4) / 3) }
}

const CharacterLive = forwardRef<CharacterViewApi, CharacterProps & { quality: 'alta' | 'leve'; reduced: boolean }>(function CharacterLive(
  { appearance, size = 120, pose = 'idle', portrait, className, title, controls = false, autoRotate = false, quality, reduced },
  ref,
) {
  const box = useRef<HTMLDivElement>(null)
  const handle = useRef<ViewerHandle | null>(null)
  const latest = useRef({ appearance, pose })
  latest.current = { appearance, pose }
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  useImperativeHandle(ref, () => ({
    setView: (v) => handle.current?.setView(v),
    zoom: (f) => handle.current?.zoom(f),
    setAutoRotate: (on) => handle.current?.setAutoRotate(on),
  }))

  useEffect(() => {
    let cancelled = false
    loadRuntime()
      .then((rt) => {
        if (cancelled || !box.current) return
        handle.current = rt.createViewer(box.current, latest.current.appearance, {
          quality,
          framing: portrait ? 'retrato' : 'corpo',
          pose: latest.current.pose,
          controls,
          autoRotate,
          reduced,
        })
        setState('ready')
      })
      .catch(() => !cancelled && setState('error'))
    return () => {
      cancelled = true
      handle.current?.dispose()
      handle.current = null
    }
  }, [quality, portrait, controls, autoRotate, reduced])

  useEffect(() => handle.current?.setAppearance(appearance), [appearance, state])
  useEffect(() => handle.current?.setPose(pose), [pose, state])

  if (state === 'error') return <Character2D appearance={appearance} size={size} pose={pose} portrait={portrait} className={className} title={title} />
  return (
    <div
      ref={box}
      className={`character char3d is-live pose-${pose} ${portrait ? 'is-portrait' : ''} ${controls ? 'has-controls' : ''} ${state === 'loading' ? 'is-loading' : ''} ${className ?? ''}`}
      style={boxSize(size, portrait)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-appearance={appearanceKey(appearance)}
      data-render="3d"
    />
  )
})

function CharacterImage({ appearance, size = 120, pose = 'idle', portrait, className, title, quality }: CharacterProps & { quality: 'alta' | 'leve' }) {
  const { width, height } = boxSize(size, portrait)
  const w = Math.round(width)
  const h = Math.round(height)
  const walking = pose === 'walk'
  const frames = walking ? [0.0, 0.12, 0.24, 0.36] : [0.6]
  const opts = (time: number) => ({ quality, pose: pose === 'still' ? ('still' as const) : pose, framing: portrait ? ('retrato' as const) : ('corpo' as const), width: w, height: h, time })
  const [urls, setUrls] = useState<string[]>([])
  const [frame, setFrame] = useState(0)
  const key = `${appearanceKey(appearance)}|${pose}|${portrait}|${w}x${h}|${quality}`

  useEffect(() => {
    let cancelled = false
    loadRuntime().then(async (rt) => {
      const list: string[] = []
      for (const t of frames) {
        const url = await rt.snapshot(appearance, opts(t))
        if (cancelled) return
        list.push(url)
        if (list.length === 1) setUrls([url])
      }
      if (!cancelled) setUrls(list)
    })
    return () => {
      cancelled = true
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (urls.length < 2) return
    const t = window.setInterval(() => setFrame((f) => (f + 1) % urls.length), 140)
    return () => window.clearInterval(t)
  }, [urls.length])

  const src = urls[frame % Math.max(1, urls.length)]
  return (
    <span
      className={`character char3d is-image pose-${pose} ${portrait ? 'is-portrait' : ''} ${src ? '' : 'is-loading'} ${className ?? ''}`}
      style={{ width, height }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-appearance={appearanceKey(appearance)}
      data-render="3d-imagem"
    >
      {src && <img src={src} alt="" width={width} height={height} draggable={false} />}
    </span>
  )
}
