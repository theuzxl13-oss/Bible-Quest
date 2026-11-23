import { useEffect, useId, useRef, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../Icon'

/*
 * Componentes base da Fase 1 da Etapa 2 (0.17.5).
 * Estruturas reutilizáveis com os estilos de styles/componentes/base-*.css
 * (prefixo bq-, só tokens). Ainda NÃO são usados pelas telas: as telas
 * migram para eles nas próximas fases, uma a uma, com aprovação.
 * Acessibilidade: área de toque de 44 px, foco visível em fundo claro e
 * escuro, teclado e nomes acessíveis.
 */

const classes = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

// ---------- Botão ----------
export type VarianteBotao = 'principal' | 'secundario' | 'discreto' | 'perigo'
export type TamanhoBotao = 'pequeno' | 'padrao' | 'grande'
interface BotaoComum { variante?: VarianteBotao; tamanho?: TamanhoBotao; largo?: boolean; icone?: IconName; children: ReactNode }

export function Botao({ variante = 'principal', tamanho = 'padrao', largo, icone, carregando, children, className, disabled, ...resto }: BotaoComum & { carregando?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...resto}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={classes('bq-botao', `bq-botao--${variante}`, tamanho !== 'padrao' && `bq-botao--${tamanho}`, largo && 'bq-botao--largo', className)}
    >
      {icone && <Icon name={icone} size={18} />}
      {children}
    </button>
  )
}

/** O mesmo visual do botão, para navegar (link do roteador). */
export function BotaoLink({ to, variante = 'principal', tamanho = 'padrao', largo, icone, children }: BotaoComum & { to: string }) {
  return (
    <Link to={to} className={classes('bq-botao', `bq-botao--${variante}`, tamanho !== 'padrao' && `bq-botao--${tamanho}`, largo && 'bq-botao--largo')}>
      {icone && <Icon name={icone} size={18} />}
      {children}
    </Link>
  )
}

// ---------- Painel ----------
export function Painel({ tipo = 'leitura', titulo, children, className }: { tipo?: 'leitura' | 'placa'; titulo?: string; children: ReactNode; className?: string }) {
  const id = useId()
  return (
    <section className={classes('bq-painel', `bq-painel--${tipo}`, className)} aria-labelledby={titulo ? id : undefined}>
      {titulo && <h2 id={id} className="bq-painel__titulo">{titulo}</h2>}
      {children}
    </section>
  )
}

// ---------- Cartão ----------
export type EstadoCartao = 'normal' | 'bloqueado' | 'concluido' | 'destaque'
const TEXTO_ESTADO: Record<Exclude<EstadoCartao, 'normal' | 'destaque'>, { texto: string; icone: IconName }> = {
  bloqueado: { texto: 'Bloqueado', icone: 'lock' },
  concluido: { texto: 'Concluído', icone: 'check' },
}

export function Cartao({ titulo, detalhe, imagem, estado = 'normal', to, onClick, dica }: { titulo: string; detalhe?: string; imagem?: ReactNode; estado?: EstadoCartao; to?: string; onClick?: () => void; dica?: string }) {
  const marca = estado === 'bloqueado' || estado === 'concluido' ? TEXTO_ESTADO[estado] : null
  const conteudo = (
    <>
      {imagem && <span className="bq-cartao__imagem" aria-hidden="true">{imagem}</span>}
      <span className="bq-cartao__titulo">{titulo}</span>
      {detalhe && <span className="bq-cartao__detalhe">{detalhe}</span>}
      {/* o estado é dito em texto e ícone, não só pela cor */}
      {marca && <span className="bq-cartao__estado"><Icon name={marca.icone} size={14} />{marca.texto}{dica ? ` · ${dica}` : ''}</span>}
    </>
  )
  const classe = classes('bq-cartao', estado !== 'normal' && `is-${estado}`)
  if (to && estado !== 'bloqueado') return <Link to={to} className={classe}>{conteudo}</Link>
  if (onClick) return <button type="button" className={classe} onClick={onClick} aria-disabled={estado === 'bloqueado' || undefined}>{conteudo}</button>
  return <div className={classe}>{conteudo}</div>
}

// ---------- Janela ----------
const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Janela (diálogo): foco preso dentro dela, Esc fecha, o foco volta para quem
 * abriu. "folha" sobe de baixo no celular.
 */
export function Janela({ titulo, aberta, onFechar, children, acoes, folha }: { titulo: string; aberta: boolean; onFechar: () => void; children: ReactNode; acoes?: ReactNode; folha?: boolean }) {
  const id = useId()
  const caixa = useRef<HTMLDivElement>(null)
  const fechar = useRef(onFechar)
  fechar.current = onFechar

  useEffect(() => {
    if (!aberta) return
    const anterior = document.activeElement as HTMLElement | null
    const el = caixa.current
    const primeiro = el?.querySelector<HTMLElement>(FOCAVEIS)
    ;(primeiro ?? el)?.focus()
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        fechar.current()
        return
      }
      if (e.key !== 'Tab' || !el) return
      const itens = Array.from(el.querySelectorAll<HTMLElement>(FOCAVEIS))
      if (itens.length === 0) return
      const [ini, fim] = [itens[0], itens[itens.length - 1]]
      if (e.shiftKey && document.activeElement === ini) { e.preventDefault(); fim.focus() }
      else if (!e.shiftKey && document.activeElement === fim) { e.preventDefault(); ini.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      anterior?.focus?.()
    }
  }, [aberta])

  if (!aberta) return null
  return (
    <div className={classes('bq-janela-fundo', folha && 'bq-janela-fundo--folha')} onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div ref={caixa} className={classes('bq-janela', folha && 'bq-janela--folha')} role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}>
        <h2 id={id} className="bq-janela__titulo">{titulo}</h2>
        <button type="button" className="bq-janela__fechar" aria-label="Fechar" onClick={onFechar}><Icon name="x" size={20} /></button>
        {children}
        {acoes && <div className="bq-janela__acoes">{acoes}</div>}
      </div>
    </div>
  )
}

// ---------- Aviso ----------
export type TomAviso = 'info' | 'sucesso' | 'alerta' | 'demo'
const ICONE_AVISO: Record<TomAviso, IconName> = { info: 'info', sucesso: 'check', alerta: 'clock', demo: 'info' }

export function Aviso({ tom = 'info', titulo, icone, children }: { tom?: TomAviso; titulo?: string; icone?: IconName; children: ReactNode }) {
  return (
    <div className={`bq-aviso bq-aviso--${tom}`} role="note">
      <span className="bq-aviso__icone" aria-hidden="true"><Icon name={icone ?? ICONE_AVISO[tom]} size={20} /></span>
      <div>
        {titulo && <strong className="bq-aviso__titulo">{titulo}</strong>}
        <div className="bq-aviso__texto">{children}</div>
      </div>
    </div>
  )
}

// ---------- Mensagem rápida ----------
/** Mensagem curta anunciada por leitores de tela; some depois de `duracao` ms. */
export function MensagemRapida({ texto, duracao = 2600, onFim }: { texto: string; duracao?: number; onFim?: () => void }) {
  const fim = useRef(onFim)
  fim.current = onFim
  useEffect(() => {
    if (!texto) return
    const t = window.setTimeout(() => fim.current?.(), duracao)
    return () => window.clearTimeout(t)
  }, [texto, duracao])
  return (
    <p className="bq-mensagem" role="status" aria-live="polite">
      {texto && <span className="bq-mensagem__caixa">{texto}</span>}
    </p>
  )
}

// ---------- Campo ----------
export function Campo({ rotulo, valor, onMudar, ajuda, erro, tipo = 'text', obrigatorio, autoComplete }: { rotulo: string; valor: string; onMudar: (v: string) => void; ajuda?: string; erro?: string; tipo?: 'text' | 'email' | 'search' | 'number'; obrigatorio?: boolean; autoComplete?: string }) {
  const id = useId()
  const descricao = [ajuda && `${id}-ajuda`, erro && `${id}-erro`].filter(Boolean).join(' ') || undefined
  return (
    <div className="bq-campo">
      <label htmlFor={id} className="bq-campo__rotulo">{rotulo}</label>
      <input
        id={id}
        className="bq-campo__entrada"
        type={tipo}
        value={valor}
        required={obrigatorio}
        autoComplete={autoComplete}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao}
        onChange={(e) => onMudar(e.target.value)}
      />
      {ajuda && <span id={`${id}-ajuda`} className="bq-campo__ajuda">{ajuda}</span>}
      {erro && <span id={`${id}-erro`} className="bq-campo__erro" role="alert">{erro}</span>}
    </div>
  )
}

// ---------- Progresso ----------
export function Progresso({ valor, max, rotulo, mostrarTexto, hud }: { valor: number; max: number; rotulo: string; mostrarTexto?: boolean; hud?: boolean }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((valor / max) * 100))) : 0
  return (
    <div className={classes('bq-progresso', hud && 'bq-progresso--hud')}>
      <div className="bq-progresso__trilho" role="progressbar" aria-label={rotulo} aria-valuemin={0} aria-valuemax={max} aria-valuenow={valor}>
        <div className="bq-progresso__barra" style={{ width: `${pct}%` }} />
      </div>
      {mostrarTexto && <span className="bq-progresso__texto" aria-hidden="true">{valor} / {max}</span>}
    </div>
  )
}

// ---------- Abas ----------
/** Abas com setas (esquerda e direita), Home e End; só a aba ativa entra no Tab. */
export function Abas({ rotulo, abas, ativa, onTrocar, children }: { rotulo: string; abas: { id: string; rotulo: string }[]; ativa: string; onTrocar: (id: string) => void; children: ReactNode }) {
  const base = useId()
  const lista = useRef<HTMLDivElement>(null)
  const mover = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = abas.findIndex((a) => a.id === ativa)
    let n = -1
    if (e.key === 'ArrowRight') n = (i + 1) % abas.length
    else if (e.key === 'ArrowLeft') n = (i - 1 + abas.length) % abas.length
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = abas.length - 1
    if (n < 0) return
    e.preventDefault()
    onTrocar(abas[n].id)
    lista.current?.querySelectorAll<HTMLElement>('[role="tab"]')[n]?.focus()
  }
  return (
    <div>
      <div ref={lista} className="bq-abas" role="tablist" aria-label={rotulo} onKeyDown={mover}>
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            id={`${base}-aba-${a.id}`}
            aria-selected={a.id === ativa}
            aria-controls={`${base}-painel`}
            tabIndex={a.id === ativa ? 0 : -1}
            className="bq-aba"
            onClick={() => onTrocar(a.id)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${base}-painel`} aria-labelledby={`${base}-aba-${ativa}`} tabIndex={0}>
        {children}
      </div>
    </div>
  )
}

// ---------- Cabeçalho ----------
export function Cabecalho({ sobretitulo, titulo, children, nivel = 1 }: { sobretitulo?: string; titulo: string; children?: ReactNode; nivel?: 1 | 2 }) {
  const Titulo = nivel === 1 ? 'h1' : 'h2'
  return (
    <header className="bq-cabecalho">
      {sobretitulo && <p className="bq-cabecalho__sobretitulo">{sobretitulo}</p>}
      <Titulo className="bq-cabecalho__titulo">{titulo}</Titulo>
      {children && <p className="bq-cabecalho__apoio">{children}</p>}
    </header>
  )
}

export function TituloSecao({ id, children }: { id?: string; children: ReactNode }) {
  return <h2 id={id} className="bq-titulo-secao">{children}</h2>
}

// ---------- Voltar ----------
export function Voltar({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="bq-voltar">
      <Icon name="arrowLeft" size={18} />
      {children}
    </Link>
  )
}
