import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { JourneyId, QuestionType } from '../types'
import { Notice } from '../components/ui'
import { JOURNEYS } from '../data/journeys'
import { QUESTIONS, QUESTION_TYPE_LABEL, DIFFICULTY_LABEL } from '../data/questions'
import { useGame } from '../state/GameContext'

/*
 * MÓDULO ADMINISTRATIVO — PROTÓTIPO
 * Carregado sob demanda (lazy) e separado do jogo. Em uma aplicação estática
 * não existe forma segura de proteger funções administrativas: qualquer
 * verificação no navegador pode ser contornada. Por isso este módulo é
 * somente leitura e não altera dados reais. A versão real exigirá:
 *   - autenticação no servidor (Supabase Auth) e papel "admin" em tabela própria;
 *   - políticas RLS que limitem escrita a administradores;
 *   - registro de auditoria das alterações.
 */

type Tab = 'perguntas' | 'jornadas' | 'usuarios' | 'denuncias' | 'estatisticas'

const TABS: { id: Tab; label: string }[] = [
  { id: 'perguntas', label: 'Perguntas' },
  { id: 'jornadas', label: 'Jornadas e capítulos' },
  { id: 'usuarios', label: 'Usuários' },
  { id: 'denuncias', label: 'Denúncias' },
  { id: 'estatisticas', label: 'Estatísticas' },
]

const ACK_KEY = 'bible-quest:admin-ack'

function readAck(): boolean {
  try {
    return sessionStorage.getItem(ACK_KEY) === '1'
  } catch {
    return false
  }
}

export default function AdminApp() {
  const [ack, setAck] = useState(readAck)
  const [tab, setTab] = useState<Tab>('perguntas')

  if (!ack) {
    return (
      <div className="container section narrow stack">
        <p className="eyebrow">Kzann Tech · Administração</p>
        <h1>Painel administrativo (protótipo)</h1>
        <Notice tone="warn" icon="lock" title="Sem autenticação real">
          Este módulo existe apenas para avaliação da interface. Ele não tem login seguro, não grava alterações e não
          acessa dados de outros usuários. A versão real dependerá de autenticação e autorização no servidor.
        </Notice>
        <div className="row-actions">
          <Link to="/sobre" className="btn btn-ghost">Voltar</Link>
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => {
              try {
                sessionStorage.setItem(ACK_KEY, '1')
              } catch {
                /* ignora */
              }
              setAck(true)
            }}
          >
            Entendi, abrir protótipo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container section stack-lg admin">
      <header className="page-header">
        <p className="eyebrow">Administração · protótipo somente leitura</p>
        <h1>Painel administrativo</h1>
      </header>
      <div className="tabs" role="tablist" aria-label="Seções administrativas">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            className={`tab ${tab === t.id ? 'is-on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'perguntas' && <QuestionsAdmin />}
        {tab === 'jornadas' && <JourneysAdmin />}
        {tab === 'usuarios' && <UsersAdmin />}
        {tab === 'denuncias' && <ReportsAdmin />}
        {tab === 'estatisticas' && <StatsAdmin />}
      </section>
    </div>
  )
}

function QuestionsAdmin() {
  const [journey, setJourney] = useState<JourneyId | ''>('')
  const [type, setType] = useState<QuestionType | ''>('')
  const [text, setText] = useState('')
  const list = useMemo(
    () =>
      QUESTIONS.filter(
        (q) =>
          (!journey || q.journeyId === journey) &&
          (!type || q.type === type) &&
          (!text || `${q.prompt} ${q.reference} ${q.id}`.toLowerCase().includes(text.toLowerCase())),
      ),
    [journey, type, text],
  )
  return (
    <div className="stack">
      <div className="filters">
        <label className="field">
          <span>Jornada</span>
          <select value={journey} onChange={(e) => setJourney(e.target.value as JourneyId | '')}>
            <option value="">Todas</option>
            {JOURNEYS.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Modalidade</span>
          <select value={type} onChange={(e) => setType(e.target.value as QuestionType | '')}>
            <option value="">Todas</option>
            {Object.entries(QUESTION_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Buscar</span>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Texto, referência ou id" />
        </label>
      </div>
      <p className="small muted">{list.length} de {QUESTIONS.length} perguntas. Edição desabilitada: requer backend autenticado.</p>
      <div className="table-wrap">
        <table className="simple-table">
          <thead>
            <tr><th scope="col">ID</th><th scope="col">Pergunta</th><th scope="col">Modalidade</th><th scope="col">Dificuldade</th><th scope="col">Categoria</th><th scope="col">Referência</th></tr>
          </thead>
          <tbody>
            {list.map((q) => (
              <tr key={q.id}>
                <td><code>{q.id}</code></td>
                <td>{q.type === 'complete' && 'verse' in q ? q.verse : q.prompt}</td>
                <td>{QUESTION_TYPE_LABEL[q.type]}</td>
                <td>{DIFFICULTY_LABEL[q.difficulty]}</td>
                <td>{q.category}</td>
                <td>{q.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function JourneysAdmin() {
  return (
    <div className="table-wrap">
      <table className="simple-table">
        <thead><tr><th scope="col">Jornada</th><th scope="col">Capítulo</th><th scope="col">Escopo</th><th scope="col">Perguntas</th><th scope="col">Trechos bíblicos</th></tr></thead>
        <tbody>
          {JOURNEYS.flatMap((j) =>
            j.chapters.map((c) => (
              <tr key={c.id}>
                <td>{j.title}</td>
                <td>{c.order}. {c.title}</td>
                <td>{c.scope}</td>
                <td>{QUESTIONS.filter((q) => q.chapterId === c.id).length}</td>
                <td>{c.passages.map((p) => p.reference).join('; ')}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  )
}

function UsersAdmin() {
  const { profile, progress } = useGame()
  return (
    <div className="stack">
      <Notice tone="info" icon="users" title="Sem base de usuários">
        A versão estática não tem servidor, então não há lista de usuários. Abaixo aparece apenas o perfil local deste
        navegador. Na versão online, o acesso a dados pessoais será restrito, registrado em auditoria e limitado ao
        mínimo necessário (LGPD).
      </Notice>
      {profile ? (
        <dl className="stat-grid">
          <div className="panel"><dt>Apelido</dt><dd>{profile.nickname}</dd></div>
          <div className="panel"><dt>Faixa etária</dt><dd>{profile.ageRange}</dd></div>
          <div className="panel"><dt>XP</dt><dd>{progress.xp}</dd></div>
          <div className="panel"><dt>Armazenamento</dt><dd>{profile.storage}</dd></div>
        </dl>
      ) : (
        <p className="muted">Nenhum perfil local neste navegador.</p>
      )}
    </div>
  )
}

function ReportsAdmin() {
  return (
    <div className="stack">
      <p className="muted">Nenhuma denúncia. Não há conteúdo gerado por usuários nesta versão.</p>
      <h3>Fluxo previsto de moderação</h3>
      <ol className="steps">
        <li>O jogador denuncia um apelido ou comportamento numa sala (sem chat livre, só reações predefinidas).</li>
        <li>A denúncia é gravada na tabela <code>reports</code>, com acesso restrito a moderadores.</li>
        <li>O moderador analisa e pode ocultar o apelido, suspender a conta ou encerrar a sala.</li>
        <li>Toda ação fica registrada em <code>moderation_log</code>.</li>
      </ol>
    </div>
  )
}

function StatsAdmin() {
  const byJourney = JOURNEYS.map((j) => ({ label: j.title, n: QUESTIONS.filter((q) => q.journeyId === j.id).length }))
  const byType = (Object.keys(QUESTION_TYPE_LABEL) as QuestionType[]).map((t) => ({
    label: QUESTION_TYPE_LABEL[t],
    n: QUESTIONS.filter((q) => q.type === t).length,
  }))
  const byDiff = ([1, 2, 3] as const).map((d) => ({ label: DIFFICULTY_LABEL[d], n: QUESTIONS.filter((q) => q.difficulty === d).length }))
  return (
    <div className="stat-columns">
      <BarList title="Perguntas por jornada" rows={byJourney} />
      <BarList title="Perguntas por modalidade" rows={byType} />
      <BarList title="Perguntas por dificuldade" rows={byDiff} />
    </div>
  )
}

function BarList({ title, rows }: { title: string; rows: { label: string; n: number }[] }) {
  const max = Math.max(...rows.map((r) => r.n))
  return (
    <section className="panel">
      <h3>{title}</h3>
      <ul className="bars">
        {rows.map((r) => (
          <li key={r.label}>
            <span className="bar-label">{r.label}</span>
            <span className="bar-track"><span className="bar-fill" style={{ width: `${(r.n / max) * 100}%` }} /></span>
            <span className="bar-n">{r.n}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
