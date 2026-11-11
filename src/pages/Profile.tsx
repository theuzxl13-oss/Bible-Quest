import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Avatar, AVATARS, LocalProfileNotice, ProgressBar, Stars } from '../components/ui'
import { BOOKS } from '../data/bible/canon'
import { STORY_SEQUENCE, hasContent } from '../data/story'
import { FREE_MODES } from '../services/game/freeModes'
import { MODE_LABEL } from './Dashboard'
import { QUESTION_TYPE_LABEL } from '../data/questions'
import { ACHIEVEMENTS } from '../data/achievements'
import type { QuestionType } from '../types'
import { levelProgress, levelTitle } from '../services/game/levels'
import { bookCompletion, bookMedal, journeyCompletion, percent, testamentCompletion } from '../services/game/progression'
import { useGame } from '../state/GameContext'
import { PlayerCharacter } from '../components/character/PlayerCharacter'

const AGE_LABEL = { ate12: 'Até 12 anos', '13a17': '13 a 17 anos', '18mais': '18 anos ou mais' }

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function ProfilePage() {
  const { profile, progress, updateProfile, exportData, deleteAllData } = useGame()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [nick, setNick] = useState(profile!.nickname)
  const [avatar, setAvatar] = useState(profile!.avatar)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const p = profile!
  const lp = levelProgress(progress.xp)
  const accuracy = progress.stats.answered ? Math.round((progress.stats.correct / progress.stats.answered) * 100) : 0
  const expsDone = STORY_SEQUENCE.filter((e) => progress.experiences[e.id]?.completed).length
  const storyBooks = BOOKS.filter((b) => hasContent(b.id))

  const save = () => {
    if (nick.trim().length < 2) return
    updateProfile({ ...p, nickname: nick, avatar })
    setEditing(false)
  }

  return (
    <div className="container section stack-lg">
      <header className="profile-head panel">
        {p.character ? <PlayerCharacter size={84} /> : <Avatar id={p.avatar} size={84} />}
        <div className="profile-id">
          <p className="eyebrow">Perfil local · {AGE_LABEL[p.ageRange]}</p>
          <h1>{p.character?.name ?? p.nickname}</h1>
          <p className="small muted">Jogador: {p.nickname} · <Link to="/guarda-roupa">Personalizar personagem</Link></p>
          <p>Nível {lp.level} · {levelTitle(lp.level)} · {progress.xp} XP</p>
          <ProgressBar value={lp.current} max={lp.needed} label="Progresso para o próximo nível" />
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)} aria-expanded={editing}>
          {editing ? 'Cancelar' : 'Editar perfil'}
        </button>
      </header>

      {editing && (
        <section className="panel stack" aria-label="Editar perfil">
          <label className="field">
            <span>Apelido</span>
            <input value={nick} onChange={(e) => setNick(e.target.value)} maxLength={20} />
          </label>
          <fieldset className="field">
            <legend>Selo</legend>
            <div className="avatar-grid">
              {AVATARS.map((a) => (
                <label key={a.id} className={`avatar-pick ${avatar === a.id ? 'is-on' : ''}`} title={a.label}>
                  <input type="radio" name="avatar-edit" checked={avatar === a.id} onChange={() => setAvatar(a.id)} />
                  <Icon name={a.icon} size={24} />
                  <span className="sr-only">{a.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" className="btn btn-gold" onClick={save}>Salvar</button>
        </section>
      )}

      <LocalProfileNotice />

      <section aria-labelledby="st">
        <h2 id="st" className="section-title">Estatísticas</h2>
        <dl className="stat-grid">
          <div className="panel"><dt>Experiências concluídas</dt><dd>{expsDone}/{STORY_SEQUENCE.length}</dd></div>
          <div className="panel"><dt>Partidas no Modo Livre</dt><dd>{progress.free.matches}</dd></div>
          <div className="panel"><dt>Perguntas respondidas</dt><dd>{progress.stats.answered}</dd></div>
          <div className="panel"><dt>Precisão</dt><dd>{accuracy}%</dd></div>
          <div className="panel"><dt>Melhor sequência</dt><dd>{progress.streak.best} dias</dd></div>
          <div className="panel"><dt>Desafios diários</dt><dd>{progress.daily.completedCount}</dd></div>
          <div className="panel"><dt>Conquistas</dt><dd>{Object.keys(progress.achievements).length}/{ACHIEVEMENTS.length}</dd></div>
        </dl>
        {Object.keys(progress.stats.byType).length > 0 && (
          <div className="table-wrap">
            <table className="simple-table">
              <caption className="sr-only">Desempenho por modalidade</caption>
              <thead><tr><th scope="col">Modalidade</th><th scope="col">Respondidas</th><th scope="col">Acertos</th></tr></thead>
              <tbody>
                {(Object.entries(progress.stats.byType) as [QuestionType, { answered: number; correct: number }][]).map(([t, v]) => (
                  <tr key={t}><td>{QUESTION_TYPE_LABEL[t]}</td><td>{v.answered}</td><td>{v.correct}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="pj">
        <div className="section-head">
          <h2 id="pj" className="section-title">Modo História</h2>
          <Link to="/conquistas" className="link">Conquistas e medalhas</Link>
        </div>
        <dl className="stat-grid">
          <div className="panel"><dt>Jornada completa</dt><dd>{percent(journeyCompletion(progress))}</dd></div>
          <div className="panel"><dt>Antigo Testamento</dt><dd>{percent(testamentCompletion('AT', progress))}</dd></div>
          <div className="panel"><dt>Novo Testamento</dt><dd>{percent(testamentCompletion('NT', progress))}</dd></div>
        </dl>
        <ul className="journey-progress">
          {storyBooks.map((b) => {
            const c = bookCompletion(b.id, progress)
            const m = bookMedal(b.id, progress)
            return (
              <li key={b.id} className="panel">
                <div className="jp-head">
                  <strong>{b.name}</strong>
                  {m && <span className={`medal medal-${m}`}><Icon name="laurel" size={14} /> {m}</span>}
                </div>
                <ProgressBar value={c.done} max={c.total} label={`Progresso em ${b.name}`} />
                <span className="small muted">{c.done}/{c.total} experiências · {percent(c.ratio)} · {c.stars}/{c.maxStars} estrelas</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="pl">
        <h2 id="pl" className="section-title">Modo Livre</h2>
        <div className="table-wrap">
          <table className="simple-table">
            <caption className="sr-only">Recordes por modalidade</caption>
            <thead><tr><th scope="col">Modalidade</th><th scope="col">Partidas</th><th scope="col">Recorde</th></tr></thead>
            <tbody>
              {FREE_MODES.map((m) => {
                const st = progress.free.byMode[m.id]
                return <tr key={m.id}><td>{m.title}</td><td>{st?.played ?? 0}</td><td>{st ? `${st.best} pts` : '—'}</td></tr>
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="hi">
        <h2 id="hi" className="section-title">Histórico de partidas</h2>
        {progress.history.length === 0 ? (
          <p className="muted">Nenhuma partida registrada.</p>
        ) : (
          <ul className="history">
            {progress.history.map((h) => (
              <li key={h.id} className="history-item">
                <div>
                  <strong>{h.title}</strong>
                  <span className="muted small"> · {MODE_LABEL[h.mode]}{h.freeMode ? ` · ${FREE_MODES.find((m) => m.id === h.freeMode)?.title}` : ''} · {new Date(h.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
                <div className="history-right">
                  {h.mode === 'historia' && <Stars value={h.stars} size={14} />}
                  <span className="small">{h.correct}/{h.total}</span>
                  <span className={`small ${h.passed ? 'gold' : 'muted'}`}>+{h.xp} XP</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel stack" aria-labelledby="dados">
        <h2 id="dados">Seus dados</h2>
        <p className="muted">De acordo com a LGPD, você pode acessar, exportar e apagar seus dados. Nesta versão eles existem apenas neste navegador.</p>
        <div className="row-actions">
          <button type="button" className="btn btn-outline" onClick={() => downloadText('bible-quest-dados.json', exportData())}>
            <Icon name="download" size={18} /> Exportar meus dados
          </button>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
            <Icon name="trash" size={18} /> Apagar perfil e progresso
          </button>
        </div>
        {confirmDelete && (
          <div className="notice notice-warn confirm" role="alertdialog" aria-labelledby="del-t">
            <p id="del-t"><strong>Apagar tudo?</strong> Perfil, XP, histórico e conquistas serão removidos deste dispositivo. Não é possível desfazer.</p>
            <div className="row-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirmDelete(false)} autoFocus>Cancelar</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => { deleteAllData(); navigate('/') }}>Apagar definitivamente</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
