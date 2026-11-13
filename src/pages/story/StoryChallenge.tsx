import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { QuizRunner } from '../../components/quiz/QuizRunner'
import { getBook } from '../../data/bible/canon'
import { getExperience } from '../../data/story'
import { questionsForExperience } from '../../data/questions'
import { shuffle } from '../../services/game/random'
import { isExperienceUnlocked } from '../../services/game/progression'
import { phaseNumber } from '../../services/game/journeyMap'
import { useGame } from '../../state/GameContext'
import NotFound from '../NotFound'

/** Cada fase tem de 5 a 10 perguntas, e todas são apresentadas. */
export const STORY_CHALLENGE_SIZE = 10

export default function StoryChallenge() {
  const { bookId, experienceId } = useParams()
  const exp = getExperience(experienceId)
  const { progress } = useGame()
  // Sorteia e embaralha uma vez por montagem; ordenação e memória ficam no fim.
  const questions = useMemo(() => {
    if (!exp) return []
    // Ordem variada a cada partida; exercícios longos (ordem, memória, relacione)
    // ficam no meio ou no fim, nunca na abertura.
    const qs = shuffle(questionsForExperience(exp.id)).slice(0, STORY_CHALLENGE_SIZE)
    const heavy = (t: string) => t === 'memory' || t === 'order' || t === 'match'
    const light = qs.filter((q) => !heavy(q.type))
    const longOnes = qs.filter((q) => heavy(q.type))
    const out = [...light]
    longOnes.forEach((q, k) => out.splice(Math.min(out.length, 2 + k * 2 + Math.floor(Math.random() * 2)), 0, q))
    return out
  }, [exp])

  if (!exp || exp.bookId !== bookId) return <NotFound />
  if (!isExperienceUnlocked(exp.id, progress)) return <Navigate to="/historia" replace />
  const book = getBook(exp.bookId)!

  return (
    <QuizRunner
      key={exp.id}
      questions={questions}
      title={`Fase ${phaseNumber(exp.id)} · ${exp.title}`}
      mode="historia"
      bookId={book.id}
      experienceId={exp.id}
      exitTo={`/historia/${book.id}/${exp.id}`}
      replayTo={`/historia/${book.id}/${exp.id}/desafio`}
      rules={{ lives: 0 }}
    />
  )
}
