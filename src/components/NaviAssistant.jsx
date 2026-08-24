import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

const poseForState = {
  idle: '/assets/navi/navi-explaining.png',
  listening: '/assets/navi/navi-listening.png',
  thinking: '/assets/navi/navi-thinking.png',
  speaking: '/assets/navi/navi-explaining.png',
}

const copyForState = {
  idle: ['Ready when you are', 'Ask about a career, your quiz, or what to do next.'],
  listening: ['I’m listening…', 'Take your time. You can speak naturally.'],
  thinking: ['Finding your best next step', 'I’m connecting this with your interests and goals.'],
  speaking: ['Here’s what I’m noticing', 'Your strongest matches combine creativity, empathy, and structured problem-solving. UX design is a great place to explore first.'],
}

export default function NaviAssistant({ open, onClose, context = 'your career journey' }) {
  const [state, setState] = useState('idle')
  const [muted, setMuted] = useState(false)
  const timers = useRef([])

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout)
  }, [])

  const closeAssistant = () => {
    timers.current.forEach(clearTimeout)
    setState('idle')
    onClose()
  }

  const startConversation = () => {
    timers.current.forEach(clearTimeout)
    setState('listening')
    timers.current = [
      setTimeout(() => setState('thinking'), 1800),
      setTimeout(() => setState('speaking'), 3400),
    ]
  }

  if (!open) return null

  const [title, body] = copyForState[state]

  return (
    <div className="voice-overlay" role="dialog" aria-modal="true" aria-label="Talk with Navi">
      <div className="voice-shell">
        <div className="voice-topbar">
          <div className="voice-context"><span className="online-dot" /> Navi · helping with {context}</div>
          <button className="icon-button glass" onClick={closeAssistant} aria-label="Close voice mode"><Icon name="close" /></button>
        </div>
        <div className={`voice-stage state-${state}`}>
          <div className="voice-rings" aria-hidden="true"><span /><span /><span /></div>
          <img src={poseForState[state]} alt={`Navi is ${state}`} />
        </div>
        <div className="voice-copy" aria-live="polite">
          <span className="eyebrow">{state === 'idle' ? 'Voice mode' : state}</span>
          <h2>{title}</h2>
          <p>{body}</p>
          {state === 'listening' && <div className="live-transcript">“I’m interested in design, but I also really enjoy solving…”</div>}
        </div>
        <div className="voice-controls">
          <button className="icon-button glass" onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute Navi' : 'Mute Navi'}>
            <Icon name={muted ? 'close' : 'headphones'} />
          </button>
          <button className={`voice-main ${state === 'listening' ? 'is-listening' : ''}`} onClick={startConversation} aria-label="Start talking">
            <Icon name={state === 'speaking' ? 'arrow' : 'mic'} size={27} />
          </button>
          <button className="icon-button glass" onClick={() => setState('idle')} aria-label="Restart conversation"><Icon name="more" /></button>
        </div>
        <p className="voice-hint">{state === 'idle' ? 'Tap the microphone and start talking' : state === 'listening' ? 'Tap to finish' : 'Navi may make mistakes. Check important details.'}</p>
      </div>
    </div>
  )
}
