import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { GameIcon } from '../../components/GameIcon'
import { QuizRunner, type QuizRules } from '../../components/quiz/QuizRunner'
import { FREE_LEVELS, availableCharacters, availableThemes, buildRound, filteredPool, getFreeMode, type RoundOptions } from '../../services/game/freeModes'
import { TIME_ATTACK_MAX_ERRORS, TIME_ATTACK_SECONDS } from '../../services/game/scoring'
import type { FreeLevel, FreeModeId } from '../../types'
import { useGame } from '../../state/GameContext'
import NotFound from '../NotFound'

const BASE_RULES: Record<FreeModeId, QuizRules> = {
  aleatorias: { lives: 0 },
  'verdadeiro-falso': { lives: 0 },
  complete: { lives: 0 },
  'quem-sou-eu': { lives: 0, progressiveClues: true },
  'contra-o-tempo': { lives: TIME_ATTACK_MAX_ERRORS, timeLimit: TIME_ATTACK_SECONDS, speedBonus: true },
  ordem: { lives: 0 },
  livro: { lives: 0 },
  personagem: { lives: 0 },
  tema: { lives: 0 },
  dificuldade: { lives: 0 },
}

/** Segundos por pergunta no nível Especialista. */
export const EXPERT_SECONDS_PER_QUESTION = 20

const COUNTS = [5, 10, 15]

/** Regras de uma rodada: o nível Especialista sempre tem cronômetro. */
export function roundRules(modeId: FreeModeId, level: FreeLevel | 'todas', questions: number): QuizRules {
  return level === 'especialista' ? { lives: 0, timeLimit: questions * EXPERT_SECONDS_PER_QUESTION, speedBonus: true } : BASE_RULES[modeId]
}

export default function FreePlay() {
  const { modeId } = useParams()
  const mode = getFreeMode(modeId)
  const { questionPool } = useGame()
  const characters = useMemo(() => availableCharacters(questionPool), [questionPool])
  const themes = useMemo(() => availableThemes(questionPool), [questionPool])
  const [level, setLevel] = useState<FreeLevel | 'todas'>(mode?.id === 'dificuldade' ? 'iniciante' : 'todas')
  const [count, setCount] = useState(mode?.roundSize ?? 10)
  const [characterId, setCharacterId] = useState(characters[0]?.id ?? '')
  const [themeId, setThemeId] = useState(themes[0]?.id ?? '')
  const [round, setRound] = useState<{ n: number; opts: RoundOptions } | null>(null)

  const opts: RoundOptions = { level, count, characterId, themeId }
  const available = mode ? filteredPool(mode.id, questionPool, opts).length : 0
  const questions = useMemo(() => (mode && round ? buildRound(mode.id, questionPool, Math.random, round.opts) : []), [mode, questionPool, round])

  if (!mode) return <NotFound />

  if (round && questions.length > 0) {
    const rules = roundRules(mode.id, round.opts.level ?? 'todas', questions.length)
    const sub = mode.id === 'personagem' ? characters.find((c) => c.id === round.opts.characterId)?.name : mode.id === 'tema' ? themes.find((t) => t.id === round.opts.themeId)?.label : undefined
    return (
      <QuizRunner
        key={`${mode.id}-${round.n}`}
        questions={questions}
        title={sub ? `${mode.title}: ${sub}` : mode.title}
        mode="livre"
        freeMode={mode.id}
        exitTo="/quiz/treino"
        replayTo={`/quiz/treino/${mode.id}`}
        rules={rules}
      />
    )
  }

  const minNeeded = 5
  return (
    <div className="container section narrow stack">
      <Link to="/quiz/treino" className="back-link"><Icon name="arrowLeft" size={16} /> Treino livre</Link>
      <div className="panel mode-intro stack">
        <span className="mode-icon mode-icon-lg"><GameIcon name={mode.icon} size={40} /></span>
        <p className="eyebrow">Modo Quiz · Treino livre</p>
        <h1>{mode.title}</h1>
        <p>{mode.rules}</p>

        {mode.id === 'personagem' && (
          <label className="field"><span>Personagem</span>
            <select value={characterId} onChange={(e) => setCharacterId(e.target.value)}>
              {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        )}
        {mode.id === 'tema' && (
          <label className="field"><span>Tema</span>
            <select value={themeId} onChange={(e) => setThemeId(e.target.value)}>
              {themes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
        )}
        {mode.configurable && (
          <>
            <fieldset className="field">
              <legend>Dificuldade</legend>
              <div className="chips">
                {mode.id !== 'dificuldade' && (
                  <label className={`chip ${level === 'todas' ? 'is-on' : ''}`}>
                    <input type="radio" name="level" checked={level === 'todas'} onChange={() => setLevel('todas')} /> Todas
                  </label>
                )}
                {FREE_LEVELS.map((l) => (
                  <label key={l.id} className={`chip ${level === l.id ? 'is-on' : ''}`} title={l.description}>
                    <input type="radio" name="level" checked={level === l.id} onChange={() => setLevel(l.id)} /> {l.label}
                  </label>
                ))}
              </div>
              {level === 'especialista' && <small className="muted">{EXPERT_SECONDS_PER_QUESTION} segundos por pergunta, com bônus por rapidez.</small>}
            </fieldset>
            <fieldset className="field">
              <legend>Quantidade de perguntas</legend>
              <div className="chips">
                {COUNTS.map((n) => (
                  <label key={n} className={`chip ${count === n ? 'is-on' : ''}`}>
                    <input type="radio" name="count" checked={count === n} onChange={() => setCount(n)} /> {n}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        <p className="small muted">{available} {available === 1 ? 'pergunta disponível' : 'perguntas disponíveis'} com essas opções{mode.configurable && available < count && available >= minNeeded ? `; a rodada terá ${available}` : ''}.</p>
        {available < minNeeded && mode.id !== 'ordem' ? (
          <p className="notice notice-warn">Não há perguntas suficientes com essas opções. Escolha outra dificuldade, personagem ou tema.</p>
        ) : (
          <button type="button" className="btn btn-gold btn-lg" onClick={() => setRound({ n: (round?.n ?? 0) + 1, opts })}>
            Começar <Icon name="play" size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
