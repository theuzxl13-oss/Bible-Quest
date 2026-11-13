import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlayerCharacter } from '../../components/character/PlayerCharacter'
import { Icon } from '../../components/Icon'
import { QUIZ_REGIONS, type QuizRegion } from '../../data/quiz/regions'
import { isQuizRegionUnlocked, quizAvatarNode, quizCompletion, quizNodeState } from '../../services/game/quizMap'
import { useGame } from '../../state/GameContext'
import { CenarioPrado, caminhoSuave, type Ponto } from '../../components/map/Prado'
import { Estrelas } from '../../components/map/JourneyMap'
import { MapaTopo } from '../../components/map/MapaTopo'
import { estiloTrecho } from '../../data/paletasMapa'

const W = 400
const STEP = 112
const TOPO = 150
const BASE = 110

/** Trilha em zigue-zague suave, com balanço diferente do Modo História. */
function layout(region: QuizRegion) {
  const pts: Ponto[] = region.nodes.map((n, i) => ({ id: n.id, x: i % 2 === 0 ? 112 + (i % 4 === 0 ? 0 : 28) : 288 - (i % 4 === 1 ? 0 : 28), y: TOPO + i * STEP }))
  const H = TOPO + BASE + (pts.length - 1) * STEP
  return { H, pts, d: caminhoSuave(pts, H, 96) }
}

const pct = (v: number, t: number) => `${(v / t) * 100}%`

export default function QuizMap() {
  const { progress } = useGame()
  const [toast, setToast] = useState('')
  const avatar = quizAvatarNode(progress)
  const comp = quizCompletion(progress)

  useEffect(() => {
    window.setTimeout(() => document.querySelector(`[data-qnode="${avatar.id}"]`)?.scrollIntoView({ block: 'center' }), 60)
  }, [avatar.id])
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(t)
  }, [toast])

  return (
    <div className="saga quiz-map">
      <MapaTopo voltar="/painel" estrelas={comp.stars} extra={{ to: '/quiz/treino', label: 'Treino livre', icon: 'cerebro' }} />

      <div className="saga-coluna" role="region" aria-label="Mapa de desafios">
        {QUIZ_REGIONS.map((r, ri) => {
          const open = isQuizRegionUnlocked(r.id, progress)
          const { H, pts, d } = layout(r)
          const estilo = estiloTrecho(r.id)
          const pos = new Map(pts.map((p) => [p.id, p]))
          const av = pos.get(avatar.id)
          return (
            <section key={r.id} id={r.id} className={`saga-trecho ${open ? '' : 'is-locked'}`} aria-labelledby={`${r.id}-t`} style={{ ['--ceu' as string]: estilo.paleta.ceu, ['--campo' as string]: estilo.paleta.campo, ['--campo-fundo' as string]: estilo.paleta.campoFundo }}>
              <div className="saga-canvas" style={{ aspectRatio: `${W} / ${H}` }}>
                <CenarioPrado W={W} H={H} pts={pts} d={d} paleta={estilo.paleta} enfeites={estilo.enfeites} semente={r.id} />
                <h2 id={`${r.id}-t`} className="prado-fita" style={{ ['--fita' as string]: estilo.fita }}>
                  <span>{r.title}</span>
                </h2>
                {r.nodes.map((n, i) => {
                  const p = pos.get(n.id)!
                  const st = quizNodeState(n.id, progress)
                  const np = progress.quiz.nodes[n.id]
                  const num = ri * 6 + i + 1
                  const label = `${r.title}, desafio ${i + 1}: ${n.title}. ${st === 'concluido' ? `Concluído, ${np?.bestStars ?? 0} de 3 estrelas` : st === 'atual' ? 'Disponível' : 'Bloqueado'}`
                  const estado = st === 'concluido' ? 'concluida' : st === 'atual' ? 'atual' : 'bloqueada'
                  const inner = (
                    <>
                      <span className="saga-num">{st === 'bloqueado' ? <Icon name="lock" size={20} /> : num}</span>
                      {st === 'concluido' && <Estrelas n={np?.bestStars ?? 0} />}
                    </>
                  )
                  return (
                    <div key={n.id} data-qnode={n.id} className={`saga-no is-${estado} cor-${num % 4}`} style={{ left: pct(p.x, W), top: pct(p.y, H) }}>
                      {st === 'bloqueado' ? (
                        <button type="button" className="saga-btn" aria-label={label} onClick={() => setToast(open ? 'Conclua o desafio anterior para liberar este.' : `Conclua a região anterior para abrir ${r.title}.`)}>{inner}</button>
                      ) : (
                        <Link to={`/quiz/desafio/${n.id}`} className="saga-btn" aria-label={label}>{inner}</Link>
                      )}
                    </div>
                  )
                })}
                {av && (
                  <div className={`saga-avatar ${av.x > W / 2 ? 'lado-esq' : 'lado-dir'}`} style={{ left: pct(av.x, W), top: pct(av.y, H) }} aria-hidden="true">
                    <PlayerCharacter size={64} pose="idle" />
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
