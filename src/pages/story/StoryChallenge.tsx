import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { QuizRunner } from '../../components/QuizRunner'
import { getBook } from '../../data/bible/canon'
import { getExperience } from '../../data/story'
import { questionsForExperience } from '../../data/questions'
import { shuffle } from '../../services/game/random'
import { MAX_LIVES } from '../../services/game/scoring'
import { isExperienceUnlocked } from '../../services/game/progression'
import { useGame } from '../../state/GameContext'
import NotFound from '../NotFound'

/** Número máximo de perguntas por desafio de experiência. */
export const STORY_CHALLENGE_SIZE = 7

export default function StoryChallenge() {
  const { bookId, experienceId } = useParams()
  const exp = getExperience(experienceId)
  const { progress } = useGame()
  // Sorteia e embaralha uma vez por montagem; ordenação e memória ficam no fim.
  const questions = useMemo(() => {
    if (!exp) return []
    const qs = shuffle(questionsForExperience(exp.id)).slice(0, STORY_CHALLENGE_SIZE)
    const heavy = (t: string) => t === 'memory' || t === 'order'
    return [...qs.filter((q) => !heavy(q.type)), ...qs.filter((q) => heavy(q.type))]
  }, [exp])

  if (!exp || exp.bookId !== bookId) return <NotFound />
  if (!isExperienceUnlocked(exp.id, progress)) return <Navigate to={`/historia/${exp.bookId}`} replace />
  const book = getBook(exp.bookId)!

  return (
    <QuizRunner
      key={exp.id}
      questions={questions}
      title={`${book.name} · ${exp.title}`}
      mode="historia"
      bookId={book.id}
      experienceId={exp.id}
      exitTo={`/historia/${book.id}/${exp.id}`}
      replayTo={`/historia/${book.id}/${exp.id}/desafio`}
      rules={{ lives: MAX_LIVES }}
    />
  )
}
