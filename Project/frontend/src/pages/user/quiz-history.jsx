import Icon from '../../components/Icon'
import PageTitle from '../../components/common/PageTitle'
import { frontendFixtures } from '../../services/pathseekerApi'
import { useQuery } from '@tanstack/react-query'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { quizApi } from '../../services/quizApi'

function ConnectedQuizHistoryPage({ navigate }) {
  const query = useQuery({ queryKey: queryKeys.quiz.attempts.list(), queryFn: ({ signal }) => quizApi.listAttempts({}, { signal }) })
  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />
  const attempts = query.data?.data?.attempts || []
  const completed = attempts.filter(({ status }) => status === 'completed')
  return <div className="page-stack"><PageTitle eyebrow="Your growth" title="Quiz history" copy="Every result retains its quiz-version evidence and deterministic algorithm version." actions={<button className="button primary" onClick={() => navigate('quiz')}>Retake quiz <Icon name="arrow" /></button>} /><section className="history-summary"><article className="panel"><Icon name="sparkles" /><span><small>Attempts</small><strong>{completed.length} completed</strong></span></article><article className="panel"><Icon name="trend" /><span><small>Current top match</small><strong>{completed[0]?.score ?? 0}% {completed[0]?.topCareerId?.title || 'Not generated'}</strong></span></article><article className="panel"><Icon name="calendar" /><span><small>In progress</small><strong>{attempts.filter(({ status }) => status === 'in_progress').length}</strong></span></article></section>{completed.length ? <section className="attempt-list panel">{completed.map((attempt, index) => <article key={attempt._id}><span className={`attempt-marker ${index === 0 ? 'current' : ''}`}><Icon name={index === 0 ? 'sparkles' : 'check'} /></span><div><small>{new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</small><h3>{attempt.archetype}</h3><p>Top match: <strong>{attempt.topCareerId?.title || 'Career explorer'}</strong> · {attempt.score}% compatibility</p></div><button className="button soft small" onClick={() => navigate('quiz-result', attempt._id)}>View evidence <Icon name="arrow" /></button></article>)}</section> : <EmptyState title="No completed assessments" message="Take the Career Passport assessment to create your first result." />}</div>
}

export default ConnectedQuizHistoryPage

export function QuizHistoryPrototype({ navigate }) {
  return <div className="page-stack"><PageTitle eyebrow="Your growth" title="Quiz history" copy="See how your interests and strongest career signals have changed over time." actions={<button className="button primary" onClick={() => navigate('quiz')}>Retake quiz <Icon name="arrow" /></button>} /><section className="history-summary"><article className="panel"><Icon name="sparkles" /><span><small>Attempts</small><strong>3 completed</strong></span></article><article className="panel"><Icon name="trend" /><span><small>Current top match</small><strong>94% UX Designer</strong></span></article><article className="panel"><Icon name="calendar" /><span><small>Next refresh</small><strong>Recommended in 30 days</strong></span></article></section><section className="attempt-list panel">{frontendFixtures.quizAttempts.map((attempt, index) => <article key={attempt._id}><span className={`attempt-marker ${index === 0 ? 'current' : ''}`}><Icon name={index === 0 ? 'sparkles' : 'check'} /></span><div><small>{new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</small><h3>{attempt.archetype}</h3><p>Top match: <strong>{attempt.topCareer}</strong> · {attempt.score}% alignment</p></div><button className="button soft small" onClick={() => navigate('quiz-result')}>View results <Icon name="arrow" /></button></article>)}</section></div>
}
