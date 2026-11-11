import { Avatar, Notice, PageHeader } from '../components/ui'
import { DEMO_RANKING } from '../data/demoRanking'
import { levelFromXp } from '../services/game/levels'
import { visibleStreak } from '../services/game/streak'
import { dayKey } from '../services/game/dates'
import { useGame } from '../state/GameContext'

export default function Ranking() {
  const { profile, progress } = useGame()
  const me = { nickname: profile!.nickname, xp: progress.xp, streak: visibleStreak(progress.streak, dayKey()), example: false as const }
  const rows = [...DEMO_RANKING, me].sort((a, b) => b.xp - a.xp)

  return (
    <div className="container section stack-lg">
      <PageHeader eyebrow="Ranking" title="Classificação">
        Ordenada por XP. A sequência diária aparece ao lado para valorizar a constância.
      </PageHeader>
      <Notice tone="demo" icon="info" title="Ranking de demonstração">
        Não há servidor conectado nesta versão. Os nomes marcados como <strong>Exemplo</strong> são dados fictícios, e só a
        sua linha reflete progresso real (salvo neste dispositivo). O ranking online exigirá conta e moderação de apelidos.
      </Notice>
      <div className="table-wrap">
        <table className="ranking">
          <caption className="sr-only">Classificação por XP, com dados de exemplo</caption>
          <thead>
            <tr><th scope="col">#</th><th scope="col">Jogador</th><th scope="col">Nível</th><th scope="col">XP</th><th scope="col">Sequência</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.nickname + i} className={r.example ? '' : 'is-me'}>
                <td>{i + 1}</td>
                <td>
                  <span className="rank-name">
                    {!r.example && <Avatar id={profile!.avatar} size={28} />}
                    {r.nickname}
                    {r.example ? <span className="tag tag-demo">Exemplo</span> : <span className="tag">Você · local</span>}
                  </span>
                </td>
                <td>{levelFromXp(r.xp)}</td>
                <td>{r.xp}</td>
                <td>{r.streak} {r.streak === 1 ? 'dia' : 'dias'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
