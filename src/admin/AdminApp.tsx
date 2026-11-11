import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Question, QuestionType } from '../types'
import { Notice } from '../components/ui'
import { ACHIEVEMENTS } from '../data/achievements'
import { BOOKS, GROUP_INFO, TESTAMENT_LABEL } from '../data/bible/canon'
import { STORY_SEQUENCE, experiencesOf } from '../data/story'
import { QUESTIONS, QUESTION_TYPE_LABEL, DIFFICULTY_LABEL, questionsForExperience } from '../data/questions'
import { dailyQuestions, DAILY_SIZE } from '../services/game/daily'
import { dayKey } from '../services/game/dates'
import { DAILY_BONUS, FIRST_CLEAR_BONUS, PASS_RATIO, PRACTICE_DAILY_CAP, STREAK_BONUS, MAX_LIVES } from '../services/game/scoring'
import { validateQuestion, type CustomContent } from '../services/content'
import { useGame } from '../state/GameContext'
import { QuestionEditor } from './QuestionEditor'
import { ExperienceEditor } from './ExperienceEditor'

/*
 * MÓDULO ADMINISTRATIVO — PROTÓTIPO
 * Carregado sob demanda e separado do jogo. Numa aplicação estática não há
 * proteção real: qualquer verificação no navegador pode ser contornada.
 * Por isso:
 *  - o conteúdo OFICIAL é somente leitura aqui;
 *  - o que é criado fica SOMENTE neste navegador (localStorage) e pode ser
 *    exportado em JSON para revisão;
 *  - publicar para todos exigirá Supabase Auth, papel em `staff_roles`, RLS
 *    e trilha de auditoria (docs/supabase/schema.sql).
 */

type Tab = 'livros' | 'experiencias' | 'perguntas' | 'diarios' | 'recompensas' | 'usuarios' | 'denuncias' | 'estatisticas'

const TABS: { id: Tab; label: string }[] = [
  { id: 'livros', label: 'Livros' },
  { id: 'experiencias', label: 'Experiências' },
  { id: 'perguntas', label: 'Perguntas' },
  { id: 'diarios', label: 'Desafios diários' },
  { id: 'recompensas', label: 'Medalhas e recompensas' },
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

function Scope({ local }: { local: boolean }) {
  return local ? <span className="tag tag-local">Operação local</span> : <span className="tag">Requer backend seguro</span>
}

export default function AdminApp() {
  const [ack, setAck] = useState(readAck)
  const [tab, setTab] = useState<Tab>('livros')

  if (!ack) {
    return (
      <div className="container section narrow stack">
        <p className="eyebrow">Kzann Tech · Administração</p>
        <h1>Painel administrativo (protótipo)</h1>
        <Notice tone="warn" icon="lock" title="Sem autenticação real">
          Este módulo serve para avaliar a interface e preparar conteúdo. Ele não tem login seguro e não publica nada
          para outros jogadores: o que você criar fica só neste navegador e pode ser exportado em JSON. A versão real
          dependerá de autenticação e autorização no servidor.
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
        <p className="eyebrow">Administração · protótipo</p>
        <h1>Painel administrativo</h1>
        <p className="page-header-lead">
          <span className="tag tag-local">Operação local</span> = salva só neste navegador.{' '}
          <span className="tag">Requer backend seguro</span> = disponível quando houver servidor com autenticação.
        </p>
      </header>
      <div className="tabs" role="tablist" aria-label="Seções administrativas">
        {TABS.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} className={`tab ${tab === t.id ? 'is-on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <section role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'livros' && <BooksAdmin />}
        {tab === 'experiencias' && <ExperiencesAdmin />}
        {tab === 'perguntas' && <QuestionsAdmin />}
        {tab === 'diarios' && <DailyAdmin />}
        {tab === 'recompensas' && <RewardsAdmin />}
        {tab === 'usuarios' && <UsersAdmin />}
        {tab === 'denuncias' && <ReportsAdmin />}
        {tab === 'estatisticas' && <StatsAdmin />}
      </section>
    </div>
  )
}

function download(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function BooksAdmin() {
  return (
    <div className="stack">
      <p className="small muted">Cânon evangélico (66 livros). A ordem dos livros define a progressão do Modo História. <Scope local={false} /></p>
      <div className="table-wrap">
        <table className="simple-table">
          <thead><tr><th scope="col">#</th><th scope="col">Livro</th><th scope="col">Testamento</th><th scope="col">Grupo</th><th scope="col">Capítulos</th><th scope="col">Experiências</th><th scope="col">Perguntas</th></tr></thead>
          <tbody>
            {BOOKS.map((b, i) => (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td>{b.name}</td>
                <td>{TESTAMENT_LABEL[b.testament]}</td>
                <td>{GROUP_INFO[b.group].label}</td>
                <td>{b.chapters}</td>
                <td>{experiencesOf(b.id).length || <span className="muted">em preparação</span>}</td>
                <td>{QUESTIONS.filter((q) => q.bookId === b.id).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ExperiencesAdmin() {
  const { customContent, saveCustomContent } = useGame()
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const drafts = customContent.experienceDrafts
  const save = (c: Partial<CustomContent>) => saveCustomContent({ ...customContent, ...c })

  return (
    <div className="stack-lg">
      <section className="stack">
        <div className="section-head">
          <h2 className="section-title">Rascunhos locais <Scope local /></h2>
          <div className="row-actions">
            <button type="button" className="btn btn-gold btn-sm" onClick={() => setEditing('new')}>Novo rascunho</button>
            <button type="button" className="btn btn-outline btn-sm" disabled={drafts.length === 0} onClick={() => download('bible-quest-experiencias.json', drafts)}>Exportar JSON</button>
          </div>
        </div>
        <p className="small muted">
          Rascunhos não entram na jornada automaticamente: a ordem do Modo História precisa ser revisada e publicada pelo
          servidor. Exporte o JSON para revisão teológica e inclusão oficial.
        </p>
        {editing && (
          <ExperienceEditor
            key={editing}
            initial={editing === 'new' ? undefined : drafts.find((d) => d.id === editing)}
            onCancel={() => setEditing(null)}
            onSave={(e) => {
              save({ experienceDrafts: drafts.some((d) => d.id === e.id) ? drafts.map((d) => (d.id === e.id ? e : d)) : [...drafts, e] })
              setEditing(null)
            }}
          />
        )}
        {drafts.length === 0 ? (
          <p className="muted">Nenhum rascunho.</p>
        ) : (
          <ul className="history">
            {drafts.map((d) => (
              <li key={d.id} className="history-item">
                <div><strong>{d.title}</strong> <span className="small muted">· {BOOKS.find((b) => b.id === d.bookId)?.name} · {d.scope}</span></div>
                <div className="row-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(d.id)}>Editar</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => save({ experienceDrafts: drafts.filter((x) => x.id !== d.id) })}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="stack">
        <h2 className="section-title">Experiências publicadas <Scope local={false} /></h2>
        <div className="table-wrap">
          <table className="simple-table">
            <thead><tr><th scope="col">#</th><th scope="col">Livro</th><th scope="col">Experiência</th><th scope="col">Passagem</th><th scope="col">Perguntas</th><th scope="col">Trechos bíblicos</th></tr></thead>
            <tbody>
              {STORY_SEQUENCE.map((e, i) => (
                <tr key={e.id}>
                  <td>{i + 1}</td>
                  <td>{BOOKS.find((b) => b.id === e.bookId)?.name}</td>
                  <td>{e.title}</td>
                  <td>{e.scope}</td>
                  <td>{questionsForExperience(e.id).length}</td>
                  <td>{e.passages.map((p) => p.reference).join('; ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function QuestionsAdmin() {
  const { customContent, saveCustomContent } = useGame()
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [book, setBook] = useState('')
  const [type, setType] = useState<QuestionType | ''>('')
  const [text, setText] = useState('')
  const local = customContent.questions
  const save = (c: Partial<CustomContent>) => saveCustomContent({ ...customContent, ...c })

  const list = useMemo(
    () =>
      QUESTIONS.filter(
        (q) => (!book || q.bookId === book) && (!type || q.type === type) && (!text || `${q.prompt} ${q.reference} ${q.id}`.toLowerCase().includes(text.toLowerCase())),
      ),
    [book, type, text],
  )

  const importFile = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as unknown
      const arr = Array.isArray(data) ? data : (data as { questions?: unknown[] }).questions
      if (!Array.isArray(arr)) throw new Error('O arquivo deve conter uma lista de perguntas.')
      const ids = new Set([...QUESTIONS.map((q) => q.id), ...local.map((q) => q.id)])
      const ok: Question[] = []
      let rejected = 0
      for (const q of arr) {
        const qq = q as Question
        if (validateQuestion(qq).length === 0 && !ids.has(qq.id)) {
          ok.push(qq)
          ids.add(qq.id)
        } else rejected++
      }
      save({ questions: [...local, ...ok] })
      setImportMsg(`${ok.length} importada(s), ${rejected} rejeitada(s) por erro de validação ou id repetido.`)
    } catch (err) {
      setImportMsg(err instanceof Error ? err.message : 'Arquivo inválido.')
    }
  }

  return (
    <div className="stack-lg">
      <section className="stack">
        <div className="section-head">
          <h2 className="section-title">Perguntas locais <Scope local /></h2>
          <div className="row-actions">
            <button type="button" className="btn btn-gold btn-sm" onClick={() => setEditing('new')}>Nova pergunta</button>
            <button type="button" className="btn btn-outline btn-sm" disabled={local.length === 0} onClick={() => download('bible-quest-perguntas.json', local)}>Exportar JSON</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}>Importar JSON</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
          </div>
        </div>
        <label className="toggle-row">
          <span>
            <span className="toggle-label">Usar perguntas locais no Modo Livre deste aparelho</span>
            <span className="small muted" style={{ display: 'block' }}>Elas aparecem como conteúdo não revisado apenas aqui.</span>
          </span>
          <input type="checkbox" role="switch" className="switch" checked={customContent.includeInFreeMode} onChange={(e) => save({ includeInFreeMode: e.target.checked })} />
        </label>
        {importMsg && <p className="small" role="status">{importMsg}</p>}
        {editing && (
          <QuestionEditor
            key={editing}
            initial={editing === 'new' ? undefined : local.find((q) => q.id === editing)}
            onCancel={() => setEditing(null)}
            onSave={(q) => {
              save({ questions: local.some((x) => x.id === q.id) ? local.map((x) => (x.id === q.id ? q : x)) : [...local, q] })
              setEditing(null)
            }}
          />
        )}
        {local.length === 0 ? (
          <p className="muted">Nenhuma pergunta local.</p>
        ) : (
          <ul className="history">
            {local.map((q) => (
              <li key={q.id} className="history-item">
                <div><strong>{q.prompt}</strong> <span className="small muted">· {QUESTION_TYPE_LABEL[q.type]} · {q.reference}</span></div>
                <div className="row-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(q.id)}>Editar</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => save({ questions: local.filter((x) => x.id !== q.id) })}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="stack">
        <h2 className="section-title">Banco oficial <Scope local={false} /></h2>
        <div className="filters">
          <label className="field"><span>Livro</span>
            <select value={book} onChange={(e) => setBook(e.target.value)}>
              <option value="">Todos</option>
              {BOOKS.filter((b) => QUESTIONS.some((q) => q.bookId === b.id)).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </label>
          <label className="field"><span>Modalidade</span>
            <select value={type} onChange={(e) => setType(e.target.value as QuestionType | '')}>
              <option value="">Todas</option>
              {Object.entries(QUESTION_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="field"><span>Buscar</span>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Texto, referência ou id" />
          </label>
        </div>
        <p className="small muted">{list.length} de {QUESTIONS.length} perguntas.</p>
        <div className="table-wrap">
          <table className="simple-table">
            <thead><tr><th scope="col">ID</th><th scope="col">Pergunta</th><th scope="col">Resposta</th><th scope="col">Modalidade</th><th scope="col">Dificuldade</th><th scope="col">Referência</th></tr></thead>
            <tbody>
              {list.map((q) => (
                <tr key={q.id}>
                  <td><code>{q.id}</code></td>
                  <td>{q.type === 'complete' && 'verse' in q ? q.verse : q.prompt}</td>
                  <td>{'options' in q ? q.options[q.answer] : q.type === 'truefalse' ? (q.answer ? 'Verdadeiro' : 'Falso') : q.type === 'order' ? `${q.items.length} itens` : `${q.pairs.length} pares`}</td>
                  <td>{QUESTION_TYPE_LABEL[q.type]}</td>
                  <td>{DIFFICULTY_LABEL[q.difficulty]}</td>
                  <td>{q.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function DailyAdmin() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return dayKey(d)
  })
  return (
    <div className="stack">
      <p className="small muted">
        O desafio diário é gerado de forma determinística a partir da data ({DAILY_SIZE} perguntas, no máximo 2 difíceis),
        com bônus de {DAILY_BONUS} XP uma vez por dia. Agendar desafios manualmente e validar a data no servidor
        <Scope local={false} />.
      </p>
      <div className="table-wrap">
        <table className="simple-table">
          <thead><tr><th scope="col">Dia</th><th scope="col">Perguntas</th></tr></thead>
          <tbody>
            {days.map((d) => (
              <tr key={d}>
                <td>{d}</td>
                <td>{dailyQuestions(d).map((q) => <div key={q.id}><code>{q.id}</code> {q.prompt.slice(0, 70)}</div>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RewardsAdmin() {
  const rules: [string, string][] = [
    ['Pontos por acerto', 'Fácil 10 · Médio 15 · Difícil 20'],
    ['Bônus de constância', `+${STREAK_BONUS} a partir do 3º acerto seguido`],
    ['Tentativas por experiência', `${MAX_LIVES}`],
    ['Aprovação', `${Math.round(PASS_RATIO * 100)}% de acertos`],
    ['Primeira conclusão de experiência', `pontos + ${FIRST_CLEAR_BONUS} XP`],
    ['Repetir experiência concluída', 'só a diferença acima da melhor pontuação'],
    ['Experiência reprovada', '25% dos pontos, como XP de prática'],
    ['Modo Livre', `pontos, como XP de prática (limite de ${PRACTICE_DAILY_CAP} XP de prática por dia)`],
    ['Quem sou eu?', '+5 por pista não usada'],
    ['Contra o tempo', '+10 se responder em até 4 s, +5 em até 8 s'],
    ['Desafio diário', `pontos + ${DAILY_BONUS} XP, uma vez por dia`],
    ['Medalhas de livro', 'bronze ao concluir, prata com 2/3 das estrelas, ouro com todas'],
  ]
  return (
    <div className="stack">
      <p className="small muted">Regras atuais, definidas em src/services/game/scoring.ts. Alterar valores para todos os jogadores <Scope local={false} />.</p>
      <div className="table-wrap">
        <table className="simple-table">
          <tbody>{rules.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody>
        </table>
      </div>
      <h3>Conquistas ({ACHIEVEMENTS.length})</h3>
      <div className="table-wrap">
        <table className="simple-table">
          <thead><tr><th scope="col">ID</th><th scope="col">Título</th><th scope="col">Critério</th></tr></thead>
          <tbody>{ACHIEVEMENTS.map((a) => <tr key={a.id}><td><code>{a.id}</code></td><td>{a.title}</td><td>{a.description}</td></tr>)}</tbody>
        </table>
      </div>
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
      <p className="muted">Nenhuma denúncia. Não há conteúdo gerado por outros jogadores nesta versão. <Scope local={false} /></p>
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
  const byBook = BOOKS.map((b) => ({ label: b.name, n: QUESTIONS.filter((q) => q.bookId === b.id).length })).filter((r) => r.n > 0)
  const byType = (Object.keys(QUESTION_TYPE_LABEL) as QuestionType[]).map((t) => ({ label: QUESTION_TYPE_LABEL[t], n: QUESTIONS.filter((q) => q.type === t).length }))
  const byDiff = ([1, 2, 3] as const).map((d) => ({ label: DIFFICULTY_LABEL[d], n: QUESTIONS.filter((q) => q.difficulty === d).length }))
  const story = QUESTIONS.filter((q) => q.experienceId).length
  return (
    <div className="stack">
      <p className="small muted">{QUESTIONS.length} perguntas: {story} ligadas a experiências do Modo História e {QUESTIONS.length - story} só do Modo Livre. {STORY_SEQUENCE.length} experiências publicadas.</p>
      <div className="stat-columns">
        <BarList title="Perguntas por livro" rows={byBook} />
        <BarList title="Perguntas por modalidade" rows={byType} />
        <BarList title="Perguntas por dificuldade" rows={byDiff} />
      </div>
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
