import { useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GameIcon } from '../../GameIcon'
import { Icon, type IconName } from '../../Icon'

/*
 * Peças de interface dos mapas de aventura: cabeçalho em pergaminho, botões
 * redondos, placa da região, contador de estrelas, medalhões das fases e a
 * janela de apresentação de uma fase. Todos os números vêm do progresso real.
 */

export function CabecalhoMapa({ titulo, subtitulo, icone, onAjuda, children }: { titulo: string; subtitulo: string; icone: IconName; onAjuda: () => void; children?: ReactNode }) {
  return (
    <header className="av-topo">
      <div className="av-topo-linha">
        <Link to="/painel" className="av-redondo" aria-label="Voltar ao acampamento"><Icon name="arrowLeft" size={24} /></Link>
        <div className="av-faixa">
          <span className="av-faixa-icone" aria-hidden="true"><GameIcon name={icone} size={44} /></span>
          <span className="av-faixa-texto">
            <h1>{titulo}</h1>
            <span>{subtitulo}</span>
          </span>
        </div>
        <button type="button" className="av-redondo" aria-label="Como funciona o mapa" onClick={onAjuda}><span aria-hidden="true">?</span></button>
      </div>
      {children && <div className="av-topo-info">{children}</div>}
    </header>
  )
}

export function PlacaRegiao({ rotulo, nome, feitas, total, children }: { rotulo?: string; nome: string; feitas: number; total: number; children?: ReactNode }) {
  return (
    <div className="av-placa" aria-live="polite">
      {rotulo && <span className="av-placa-rotulo">{rotulo}</span>}
      {children ?? <strong>{nome}</strong>}
      <span className="av-placa-num" aria-label={`${feitas} de ${total} concluídas`}><GameIcon name="flag" size={18} /> {feitas} / {total}</span>
    </div>
  )
}

export function ContadorEstrelas({ estrelas, max, baus, onBau }: { estrelas: number; max: number; baus: number; onBau?: () => void }) {
  return (
    <div className="av-contador">
      <span className="av-estrelas-total" aria-label={`${estrelas} de ${max} estrelas`}><GameIcon name="star" size={28} /> {estrelas} / {max}</span>
      <button type="button" className={`av-bau-topo ${baus ? 'tem' : ''}`} onClick={onBau} aria-label={baus ? `${baus} baú${baus > 1 ? 's' : ''} pronto${baus > 1 ? 's' : ''} para abrir: ir até o baú` : 'Nenhum baú pronto para abrir'}>
        <GameIcon name="bau" size={40} />
        {baus > 0 && <span className="av-bau-num" aria-hidden="true">{baus}</span>}
      </button>
    </div>
  )
}

export type EstadoNo = 'concluida' | 'atual' | 'bloqueada'

/** Conteúdo do medalhão: número (ou cadeado) e três estrelas na plaquinha. */
export function Medalhao({ numero, estado, estrelas, icone }: { numero: number; estado: EstadoNo; estrelas: number; icone?: IconName }) {
  return (
    <>
      {estado === 'atual' && <span className="av-raios" aria-hidden="true" />}
      <span className="av-moeda" aria-hidden="true">
        <span className="av-num">{estado === 'bloqueada' ? <Icon name="lock" size={22} /> : numero}</span>
      </span>
      {icone && estado !== 'bloqueada' && <span className="av-tipo" aria-hidden="true"><GameIcon name={icone} size={20} /></span>}
      <span className="av-plaquinha" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <svg key={i} viewBox="0 0 24 24" className={i < estrelas ? 'on' : 'off'}><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.5l1.3-6.6L2.5 9.3l6.6-.8z" /></svg>
        ))}
      </span>
    </>
  )
}

/** Janela de apresentação de uma fase (pergaminho sobre o mapa). */
export function JanelaFase({ titulo, numero, rotulo, onFechar, imagem, children, acoes }: { titulo: string; numero: number; rotulo: string; onFechar: () => void; imagem?: ReactNode; children: ReactNode; acoes: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('[data-foco]')?.focus({ preventScroll: true })
    ref.current?.scrollTo?.(0, 0)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('keydown', esc)
      anterior?.focus?.()
    }
  }, [onFechar])
  return (
    <div className="modal-backdrop av-janela-fundo" role="dialog" aria-modal="true" aria-labelledby="av-janela-t" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="av-janela" ref={ref}>
        <button type="button" className="av-fechar" aria-label="Fechar" onClick={onFechar}><Icon name="x" size={20} /></button>
        <div className="av-janela-cabeca">
          <span className="av-janela-num" aria-hidden="true">{numero}</span>
          <div>
            <p className="av-janela-rotulo">{rotulo}</p>
            <h2 id="av-janela-t">{titulo}</h2>
          </div>
        </div>
        {imagem && <div className="av-janela-img">{imagem}</div>}
        <div className="av-janela-corpo">{children}</div>
        <div className="av-janela-acoes">{acoes}</div>
      </div>
    </div>
  )
}

export function Estrelinhas({ n }: { n: number }) {
  return (
    <span className="av-estrelinhas" aria-label={`${n} de 3 estrelas`}>
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={i < n ? 'on' : 'off'} aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.5l1.3-6.6L2.5 9.3l6.6-.8z" /></svg>
      ))}
    </span>
  )
}

export function AjudaMapa({ onFechar, itens }: { onFechar: () => void; itens: { icone: IconName; texto: string }[] }) {
  return (
    <div className="modal-backdrop av-janela-fundo" role="dialog" aria-modal="true" aria-labelledby="av-ajuda-t" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="av-janela">
        <button type="button" className="av-fechar" aria-label="Fechar" onClick={onFechar}><Icon name="x" size={20} /></button>
        <h2 id="av-ajuda-t" className="av-ajuda-titulo">Como funciona</h2>
        <ul className="av-ajuda">
          {itens.map((i) => <li key={i.texto}><GameIcon name={i.icone} size={30} /> <span>{i.texto}</span></li>)}
        </ul>
        <div className="av-janela-acoes"><button type="button" className="btn btn-gold" onClick={onFechar} autoFocus>Entendi</button></div>
      </div>
    </div>
  )
}
