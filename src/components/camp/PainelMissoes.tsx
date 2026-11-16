import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GameIcon } from '../GameIcon'
import { Icon, type IconName } from '../Icon'
import { ProgressBar } from '../ui'

export interface ItemMissao {
  id: string
  icon: IconName
  titulo: string
  detalhe: string
  /** Destino (rota existente). Sem destino, o item é só informativo. */
  to?: string
  estado?: 'feito' | 'destaque'
  /** Barra de progresso dentro do item. */
  progresso?: { valor: number; max: number; rotulo: string }
}

/**
 * Painel de missões da Central (Etapa 2): uma placa recolhida que abre um
 * painel de pergaminho. Fecha com Esc e devolve o foco à placa.
 */
export function PainelMissoes({ itens, pendentes, rodape }: { itens: ItemMissao[]; pendentes: number; rodape?: ReactNode }) {
  const [aberto, setAberto] = useState(false)
  const id = useId()
  const botao = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!aberto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAberto(false)
        botao.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aberto])

  return (
    <div className="camp-missoes">
      <button
        ref={botao}
        type="button"
        className="camp-missoes-botao"
        aria-expanded={aberto}
        aria-controls={id}
        onClick={() => setAberto((a) => !a)}
      >
        <GameIcon name="scroll" size={24} /> Missões
        {pendentes > 0 && <span className="camp-badge" aria-label={`${pendentes} ${pendentes === 1 ? 'missão disponível' : 'missões disponíveis'}`}>{pendentes}</span>}
      </button>
      <section id={id} className="camp-painel" aria-label="Missões" hidden={!aberto}>
        <div className="camp-painel-topo">
          <h2>Missões</h2>
          <button type="button" className="camp-painel-fechar" aria-label="Fechar missões" onClick={() => { setAberto(false); botao.current?.focus() }}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <ul className="board-list">
          {itens.map((it) => {
            const conteudo = (
              <>
                <span className="board-icon"><GameIcon name={it.icon} size={28} /></span>
                <span>
                  <strong>{it.titulo}</strong>
                  <small>{it.detalhe}</small>
                  {it.progresso && <ProgressBar value={it.progresso.valor} max={it.progresso.max} label={it.progresso.rotulo} />}
                </span>
              </>
            )
            const classe = `board-item board-${it.id} ${it.estado === 'feito' ? 'is-done' : it.estado === 'destaque' ? 'is-hot' : ''}`
            return (
              <li key={it.id} className={it.to ? undefined : classe}>
                {it.to ? <Link to={it.to} className={classe}>{conteudo}</Link> : conteudo}
              </li>
            )
          })}
        </ul>
        {rodape}
      </section>
    </div>
  )
}
