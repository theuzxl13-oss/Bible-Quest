import type { ReactNode } from 'react'
import type { IconName } from '../../Icon'
import type { CenarioPartida } from '../../../data/mapas/cenarios'
import { CenarioFundo } from './CenarioFundo'
import { CabecalhoPagina } from './Interface'

/**
 * Moldura das telas do acampamento no visual de aventura: paisagem ao fundo,
 * placa de pergaminho no topo e o conteúdo em painéis de pergaminho e madeira.
 */
export function PaginaAventura({ titulo, subtitulo, icone, cenario, children }: {
  titulo: string
  subtitulo: string
  icone: IconName
  cenario: CenarioPartida
  children: ReactNode
}) {
  return (
    <div className="av-pagina">
      <CenarioFundo cenario={cenario} />
      <CabecalhoPagina titulo={titulo} subtitulo={subtitulo} icone={icone} />
      <div className="av-pagina-corpo container stack-lg">{children}</div>
    </div>
  )
}
