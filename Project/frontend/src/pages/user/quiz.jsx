import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Icon from '../../components/Icon'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { quizQuestions } from '../../data'
import { queryKeys } from '../../lib/queryKeys'
import { quizApi } from '../../services/quizApi'
import { useQuizDraftStore } from '../../stores/appStores'

function ConnectedQuizPage({ navigate, onVoice }) {
  const queryClient = useQueryClient()
  const { attemptId, answersByQuestionId, currentQuestionIndex, setDraft, clearDraft } = useQuizDraftStore()
  const quizQuery = useQuery({ queryKey: queryKeys.quiz.questions('active'), queryFn: ({ signal }) => quizApi.getActive({ signal }), staleTime: 300_000 })
  const questions = quizQuery.data?.data?.questions || []
  const question = questions[currentQuestionIndex]
  const selected = question ? answersByQuestionId[question.key] ?? null : null
  const { mutate: startAttempt, isPending: isStarting, error: startError } = useMutation({
    mutationFn: quizApi.startAttempt,
    onSuccess: ({ data }) => setDraft({
      attemptId: data.attempt._id,
      questionIds: questions.map(({ key }) => key),
      answersByQuestionId: Object.fromEntries((data.attempt.answers || []).map((answer) => [answer.questionKey, answer.optionKey])),
      currentQuestionIndex: Math.min(currentQuestionIndex, Math.max(0, questions.length - 1)),
      startedAt: data.attempt.startedAt,
    }),
  })

  useEffect(() => {
    if (quizQuery.isSuccess && questions.length && !attemptId && !isStarting && !startError) startAttempt()
  }, [attemptId, isStarting, questions.length, quizQuery.isSuccess, startAttempt, startError])

  const answerMutation = useMutation({ mutationFn: ({ key, optionKey }) => quizApi.answer(attemptId, { questionKey: key, optionKey }) })
  const completeMutation = useMutation({
    mutationFn: () => quizApi.complete(attemptId),
    onSuccess: async () => {
      clearDraft()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.quiz.attempts.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.me() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.passport.me() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.me() }),
      ])
      toast.success('Your Career Passport is ready.')
      navigate('recommendations')
    },
  })
  const choose = (optionKey) => setDraft({ answersByQuestionId: { ...answersByQuestionId, [question.key]: optionKey } })
  const next = async () => {
    try {
      await answerMutation.mutateAsync({ key: question.key, optionKey: selected })
      if (currentQuestionIndex < questions.length - 1) setDraft({ currentQuestionIndex: currentQuestionIndex + 1 })
      else completeMutation.mutate()
    } catch (error) { toast.error(error.message) }
  }

  if (quizQuery.isLoading || isStarting) return <PageSkeleton />
  if (quizQuery.error || startError) return <ErrorState message={(quizQuery.error || startError).message} onRetry={() => { clearDraft(); quizQuery.refetch() }} />
  if (!question || !attemptId) return <ErrorState title="Assessment unavailable" message="No published questions could be loaded." />
  const progress = Math.round(((currentQuestionIndex + (selected ? 1 : 0)) / questions.length) * 100)
  const pending = answerMutation.isPending || completeMutation.isPending
  return <div className="quiz-page"><div className="quiz-top"><button onClick={() => navigate('dashboard')}><Icon name="close" /> Save and exit</button><div><span>Question {currentQuestionIndex + 1} of {questions.length}</span><div className="quiz-progress"><span style={{ width: `${progress}%` }} /></div><small>{progress}% complete</small></div>{onVoice && <button onClick={onVoice}><Icon name="mic" /> Answer with voice</button>}</div><main className="quiz-layout"><section className="quiz-card" aria-busy={pending}><span className="eyebrow">{question.eyebrow || 'Career signal'}</span><h1>{question.questionText}</h1><p>{question.hint}</p><div className="quiz-options">{question.options.map((option, optionIndex) => <button key={option.key} className={selected === option.key ? 'selected' : ''} aria-pressed={selected === option.key} onClick={() => choose(option.key)} disabled={pending}><span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span className={`option-icon tone-${optionIndex}`}><Icon name={option.icon || 'sparkles'} /></span><strong>{option.label}</strong><span className="radio"><Icon name="check" size={14} /></span></button>)}</div>{(answerMutation.error || completeMutation.error) && <p className="form-error" role="alert">{(answerMutation.error || completeMutation.error).message}</p>}<div className="quiz-actions"><button className="button ghost" disabled={pending} onClick={() => currentQuestionIndex > 0 ? setDraft({ currentQuestionIndex: currentQuestionIndex - 1 }) : navigate('dashboard')}><Icon name="arrowLeft" /> Back</button><button className="button primary" disabled={selected === null || pending} onClick={next}>{pending ? 'Saving…' : currentQuestionIndex === questions.length - 1 ? 'Build my passport' : 'Save and continue'} <Icon name="arrow" /></button></div></section><aside className="quiz-navi"><div className="navi-aura" /><img src={`/assets/navi/navi-${selected === null ? 'thinking' : 'explaining'}.png`} alt="Navi guiding your assessment" /><div className="quiz-tip"><Icon name="sparkles" /><p>{selected === null ? 'Go with your first instinct. Your answers become evidence, while PathSeeker calculates the scores.' : 'Saved answers stay attached to this quiz version, so your result remains explainable later.'}</p></div></aside></main></div>
}

export default ConnectedQuizPage

export function QuizPrototype({ navigate, onVoice }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(0)
  const question = quizQuestions[index]
  const progress = index === 0 ? 42 : 76
  const next = () => { if (index < quizQuestions.length - 1) { setIndex(index + 1); setSelected(null) } else navigate('recommendations') }
  return (
    <div className="quiz-page">
      <div className="quiz-top"><button onClick={() => navigate('dashboard')}><Icon name="close" /> Save and exit</button><div><span>Question {index + 5} of 7</span><div className="quiz-progress"><span style={{ width: `${progress}%` }} /></div><small>{progress}% complete</small></div><button onClick={onVoice}><Icon name="mic" /> Answer with voice</button></div>
      <main className="quiz-layout">
        <section className="quiz-card">
          <span className="eyebrow">{question.eyebrow}</span><h1>{question.question}</h1><p>{question.hint}</p>
          <div className="quiz-options">{question.options.map(([label, icon], optionIndex) => <button key={label} className={selected === optionIndex ? 'selected' : ''} onClick={() => setSelected(optionIndex)}><span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span className={`option-icon tone-${optionIndex}`}><Icon name={icon} /></span><strong>{label}</strong><span className="radio"><Icon name="check" size={14} /></span></button>)}</div>
          <div className="quiz-actions"><button className="button ghost" onClick={() => index > 0 ? setIndex(index - 1) : navigate('dashboard')}><Icon name="arrowLeft" /> Back</button><button className="button primary" disabled={selected === null} onClick={next}>{index === quizQuestions.length - 1 ? 'See my results' : 'Next question'} <Icon name="arrow" /></button></div>
        </section>
        <aside className="quiz-navi"><div className="navi-aura" /><img src={`/assets/navi/navi-${selected === null ? 'thinking' : 'explaining'}.png`} alt="Navi thinking" /><div className="quiz-tip"><Icon name="sparkles" /><p>{selected === null ? 'Go with your first instinct. We’re looking for patterns, not perfect answers.' : 'That’s useful! It tells me what kind of problems naturally pull you in.'}</p></div><button onClick={onVoice}><span className="voice-pulse mini"><Icon name="mic" /></span><span><strong>Rather say it out loud?</strong><small>Talk with Navi</small></span><Icon name="arrow" /></button></aside>
      </main>
    </div>
  )
}
