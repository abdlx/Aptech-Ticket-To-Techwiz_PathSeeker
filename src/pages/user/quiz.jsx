import Icon from '../../components/Icon'
import { useState } from 'react'
import { quizQuestions } from '../../data'

export default function QuizPage({ navigate, onVoice }) {
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
