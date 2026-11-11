import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArtImage } from '../../components/ArtImage'
import { PlayerCharacter } from '../../components/character/PlayerCharacter'
import { Icon } from '../../components/Icon'
import { ProgressBar } from '../../components/ui'
import { QUIZ_REGIONS, type QuizRegion } from '../../data/quiz/regions'
import { getFreeMode, FREE_LEVELS } from '../../services/game/freeModes'
import { levelFromXp, levelTitle } from '../../services/game/levels'
import { isQuizRegionUnlocked, quizAvatarNode, quizCompletion, quizNodeState } from '../../services/game/quizMap'
import { useGame } from '../../state/GameContext'

const W = 400
const STEP = 112
const PAD = 80

/** Trilha de pedras em zigue-zague, diferente do caminho sinuoso do Modo História. */
function layout(region: QuizRegion) {
  const pts = region.nodes.map((n, i) => ({ id: n.id, x: i % 2 === 0 ? 120 + (i % 4 === 0 ? 0 : 20) : 280 - (i % 4 === 1 ? 0 : 20), y: PAD + i * STEP }))
  const H = PAD * 2 + (pts.length - 1) * STEP
  let d = `M ${pts[0].x} ${PAD - 60} L ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`
  d += ` L ${pts[pts.length - 1].x} ${H}`
  const stones: { x: number; y: number }[] = []
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    for (let k = 1; k < 5; k++) stones.push({ x: a.x + ((b.x - a.x) * k) / 5, y: a.y + ((b.y - a.y) * k) / 5 })
  }
  return { H, pts, d, stones }
}

const levelLabel = (l: string) => (l === 'todas' ? 'Todas as dificuldades' : FREE_LEVELS.find((x) => x.id === l)?.label ?? l)
const pct = (v: number, t: number) => `${(v / t) * 100}%`

export default function QuizMap() {
  const { progress, profile } = useGame()
  const [toast, setToast] = useState('')
  const avatar = quizAvatarNode(progress)
  const comp = quizCompletion(progress)
  const level = levelFromXp(progress.xp)

  useEffect(() => {
    window.setTimeout(() => document.querySelector(`[data-qnode="${avatar.id}"]`)?.scrollIntoView({ block: 'center' }), 60)
  }, [avatar.id])
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(t)
  }, [toast])

  return (
    <div className="quiz-map">
      <section className="map-hero quiz-hero">
        <ArtImage art="gn-babel" className="hero-bg" priority decorative />
        <div className="hero-shade" />
        <div className="container map-hero-inner">
          <div className="map-hero-char"><PlayerCharacter size={96} /></div>
          <div className="map-hero-info">
            <p className="eyebrow">Modo Quiz · Mapa de desafios</p>
            <h1>{profile!.character!.name}</h1>
            <p className="small">Nível {level} · {levelTitle(level)} · {progress.xp} XP</p>
            <ProgressBar value={comp.done} max={comp.total} label="Desafios do Modo Quiz concluídos" />
            <p className="small muted">{comp.done} de {comp.total} desafios · {comp.stars} de {comp.maxStars} estrelas</p>
          </div>
          <Link to={`/quiz/desafio/${avatar.id}`} className="btn btn-gold btn-lg map-hero-cta">
            Próximo desafio <Icon name="arrowRight" />
          </Link>
        </div>
      </section>

      <div className="container quiz-links">
        <Link to="/quiz/treino" className="btn btn-outline btn-sm"><Icon name="star" size={16} /> Treino livre</Link>
        <Link to="/diario" className="btn btn-outline btn-sm"><Icon name="calendar" size={16} /> Desafio diário</Link>
        <Link to="/quiz/multiplayer" className="btn btn-outline btn-sm"><Icon name="users" size={16} /> Multiplayer (demonstração)</Link>
        <Link to="/ranking?aba=livre" className="btn btn-outline btn-sm"><Icon name="trophy" size={16} /> Recordes</Link>
      </div>

      <div className="map-column">
        {QUIZ_REGIONS.map((r, ri) => {
          const open = isQuizRegionUnlocked(r.id, progress)
          const { H, pts, d, stones } = layout(r)
          const pos = new Map(pts.map((p) => [p.id, p]))
          const av = pos.get(avatar.id)
          return (
            <section key={r.id} id={r.id} className={`quiz-region ${open ? '' : 'is-locked'}`} aria-labelledby={`${r.id}-t`} style={{ ['--sky' as string]: r.theme.sky, ['--qground' as string]: r.theme.ground, ['--stone' as string]: r.theme.stone, ['--banner' as string]: r.theme.banner }}>
              {ri > 0 && <div className="world-gate" aria-hidden="true"><span>Portão da região {r.number}</span></div>}
              <header className="quiz-banner">
                <ArtImage art={r.art} className="world-banner-img" sizes="(min-width: 900px) 900px, 100vw" decorative />
                <div className="world-banner-shade" />
                <div className="quiz-banner-flag" aria-hidden="true"><Icon name="flag" size={22} /></div>
                <div className="world-banner-body">
                  <p className="eyebrow">Região {r.number}{open ? '' : ' · Bloqueada'}</p>
                  <h2 id={`${r.id}-t`}>{r.title}</h2>
                  <p className="small">{open ? r.subtitle : `Conclua todos os desafios de ${QUIZ_REGIONS[ri - 1].title} para abrir.`}</p>
                </div>
              </header>
              <div className="quiz-board">
                <svg className="map-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
                  <path d={d} className="quiz-trail" />
                  {stones.map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx="11" ry="7" className="quiz-stone" />)}
                  {pts.map((p, i) => (
                    <g key={p.id} transform={`translate(${p.x < W / 2 ? W - 60 : 60} ${p.y})`} className="quiz-banner-pole">
                      <line x1="0" y1="18" x2="0" y2="-30" />
                      <path d={i % 2 ? 'M0 -30 L26 -22 L0 -14 Z' : 'M0 -30 L-26 -22 L0 -14 Z'} />
                    </g>
                  ))}
                </svg>
                {r.nodes.map((n, i) => {
                  const p = pos.get(n.id)!
                  const st = quizNodeState(n.id, progress)
                  const np = progress.quiz.nodes[n.id]
                  const mode = getFreeMode(n.mode)
                  const label = `${r.title}, desafio ${i + 1}: ${n.title}. ${st === 'concluido' ? `Concluído, ${np?.bestStars ?? 0} de 3 estrelas` : st === 'atual' ? 'Disponível' : 'Bloqueado'}`
                  const inner = (
                    <>
                      <span className="shield-num">{st === 'bloqueado' ? <Icon name="lock" size={16} /> : mode ? <Icon name={mode.icon} size={20} /> : i + 1}</span>
                      {st === 'concluido' && (
                        <span className="node-stars" aria-hidden="true">
                          {[0, 1, 2].map((k) => <Icon key={k} name="star" size={13} className={k < (np?.bestStars ?? 0) ? 'star-on' : 'star-off'} />)}
                        </span>
                      )}
                    </>
                  )
                  return (
                    <div key={n.id} data-qnode={n.id} className={`map-node quiz-node is-${st}`} style={{ left: pct(p.x, W), top: pct(p.y, H) }}>
                      {st === 'bloqueado' ? (
                        <button type="button" className="shield-btn" aria-label={label} onClick={() => setToast(open ? 'Conclua o desafio anterior para liberar este.' : `Conclua a região anterior para abrir ${r.title}.`)}>{inner}</button>
                      ) : (
                        <Link to={`/quiz/desafio/${n.id}`} className="shield-btn" aria-label={label}>{inner}</Link>
                      )}
                      <span className={`node-label label-${p.x > W / 2 ? 'left' : 'right'}`}>
                        {n.title}
                        <small>{levelLabel(n.level)}</small>
                      </span>
                    </div>
                  )
                })}
                {av && (
                  <div className="map-avatar" style={{ left: pct(av.x, W), top: pct(av.y, H) }} aria-hidden="true">
                    <PlayerCharacter size={58} pose="idle" />
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
      <p className="map-toast" role="status" aria-live="polite">{toast && <span>{toast}</span>}</p>
    </div>
  )
}
