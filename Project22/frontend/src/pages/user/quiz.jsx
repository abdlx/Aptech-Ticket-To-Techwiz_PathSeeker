import Icon from '../../components/Icon'
import { useEffect, useMemo, useState } from 'react'
import { apiRequest, endpoints } from '../../services/pathseekerApi'

function optionValue(question, optionKey) {
  return (question?.options || []).find((option) => option.key === optionKey)?.label || optionKey
}

export default function QuizPage({ navigate, onVoice }) {
  const [questions, setQuestions] = useState([])
  const [attempt, setAttempt] = useState(null)
  const [answers, setAnswers] = useState({})
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: aData } = await apiRequest(endpoints.quizAttempts)
        const active = (aData.attempts || []).find((item) => item.status === 'in_progress')
        let current = active
        let quizQuestions = []
        if (current?.questionSnapshot?.length) {
          quizQuestions = current.questionSnapshot
        } else {
          const { data: qData } = await apiRequest(endpoints.quizQuestions)
          quizQuestions = qData.questions || []
          current = (await apiRequest(endpoints.quizAttempts, { method: 'POST' })).data.attempt
        }
        setQuestions(quizQuestions)
        setAttempt(current)
        const restored = Object.fromEntries((current.answers || []).map((answer) => [answer.questionId, answer.optionKey]))
        setAnswers(restored)
        const firstUnanswered = quizQuestions.findIndex((q) => !restored[q._id || q.questionId])
        setIndex(firstUnanswered >= 0 ? firstUnanswered : Math.max(0, quizQuestions.length - 1))
      } catch (err) {
        setError(err.message || 'Could not load the quiz.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const question = questions[index]
  const questionId = question?._id || question?.questionId
  const selected = question ? answers[questionId] : null
  const progress = questions.length ? Math.round(((index + (selected ? 1 : 0)) / questions.length) * 100) : 0
  const timeLimit = Number(question?.timeLimitSeconds || 0)

  useEffect(() => {
    setSecondsLeft(timeLimit > 0 ? timeLimit : null)
  }, [questionId, timeLimit])

  const submitAnswer = async (optionKey) => {
    if (!question || !attempt || saving) return
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }))
    setSaving(true)
    setError('')
    try {
      const { data } = await apiRequest(`${endpoints.quizAttempts}/${attempt._id}/answer`, {
        method: 'PATCH',
        body: JSON.stringify({ questionId, optionKey }),
      })
      setAttempt(data.attempt)
    } catch (err) {
      setAnswers((prev) => { const next = { ...prev }; delete next[questionId]; return next })
      setError(err.message || 'Could not save your answer.')
    } finally {
      setSaving(false)
    }
  }

  const complete = async () => {
    if (!attempt) return
    setSaving(true)
    setError('')
    try {
      await apiRequest(`${endpoints.quizAttempts}/${attempt._id}/complete`, { method: 'POST' })
      navigate('recommendations')
    } catch (err) {
      setError(err.message || 'Could not complete the quiz.')
    } finally {
      setSaving(false)
    }
  }

  const next = async () => {
    if (!selected || saving) return
    if (index < questions.length - 1) {
      setIndex((value) => value + 1)
      return
    }
    await complete()
  }

  useEffect(() => {
    if (secondsLeft == null || secondsLeft <= 0 || !question) return undefined
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value == null) return value
        if (value <= 1) {
          window.clearInterval(timer)
          setError(selected ? 'Time is up for this question. Continue when ready.' : 'Time is up. Please choose an answer to continue.')
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [questionId, secondsLeft == null ? null : timeLimit])

  const options = useMemo(() => question?.options || [], [question])

  if (loading) return <div className="quiz-page"><div className="panel">Loading your live quiz…</div></div>
  if (error && !question) return <div className="quiz-page"><div className="panel form-error">{error}</div></div>
  if (!question) return <div className="quiz-page"><div className="panel">No published quiz questions are available.</div></div>

  return <div className="quiz-page">
    <div className="quiz-top">
      <button onClick={() => navigate('dashboard')}><Icon name="close" /> Save and exit</button>
      <div><span>Question {index + 1} of {questions.length}</span><div className="quiz-progress"><span style={{ width: `${progress}%` }} /></div><small>{progress}% complete</small></div>
      <button onClick={onVoice}><Icon name="mic" /> Answer with voice</button>
    </div>
    <main className="quiz-layout">
      <section className="quiz-card">
        <span className="eyebrow">Question {index + 1} · {question.type.replace('_', ' ')}</span>
        <h1>{question.questionText}</h1>
        <p>Choose the answer that best matches you.</p>
        {secondsLeft != null && <div className="quiz-timer" role="timer" aria-live="polite"><Icon name="clock" /> {secondsLeft}s remaining</div>}
        {question.type === 'slider' ? (
          <div className="quiz-slider"><input type="range" min="0" max={Math.max(0, options.length - 1)} step="1" value={Math.max(0, options.findIndex((option) => option.key === selected))} onChange={(e) => submitAnswer(options[Number(e.target.value)]?.key)} aria-label="Quiz slider answer"/><div className="slider-labels">{options.map((option) => <span key={option.key}>{option.label}</span>)}</div></div>
        ) : (
          <div className="quiz-options">{options.map((option, optionIndex) => <button key={option.key} className={selected === option.key ? 'selected' : ''} disabled={saving} onClick={() => submitAnswer(option.key)}><span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span className={`option-icon tone-${optionIndex}`}><Icon name={['pen','chart','users','code'][optionIndex % 4]} /></span><strong>{option.label}</strong><span className="radio"><Icon name="check" size={14} /></span></button>)}</div>
        )}
        {selected && question.type === 'slider' && <p className="form-help">Selected: {optionValue(question, selected)}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="quiz-actions"><button className="button ghost" disabled={index === 0 || saving} onClick={() => setIndex((value) => value - 1)}><Icon name="arrowLeft" /> Back</button><button className="button primary" disabled={!selected || saving || (secondsLeft === 0 && !selected)} onClick={next}>{saving ? 'Saving…' : index === questions.length - 1 ? 'See my results' : 'Next question'} <Icon name="arrow" /></button></div>
      </section>
      <aside className="quiz-navi"><img src={`/assets/navi/navi-${selected ? 'explaining' : 'thinking'}.png`} alt="Navi" /><div className="quiz-tip"><Icon name="sparkles" /><p>{selected ? 'Saved. Your answers are scored on the server when you finish.' : 'Go with your first instinct. We are looking for patterns, not perfect answers.'}</p></div></aside>
    </main>
  </div>
}
