import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { apiRequest } from '../services/pathseekerApi'

const poseForState = { idle: '/assets/navi/navi-explaining.png', listening: '/assets/navi/navi-listening.png', thinking: '/assets/navi/navi-thinking.png', speaking: '/assets/navi/navi-explaining.png' }

export default function NaviAssistant({ open, onClose, context = 'your career journey', navigate }) {
  const [state, setState] = useState('idle')
  const [muted, setMuted] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [body, setBody] = useState('Ask about a career, your quiz, or what to do next.')
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => () => recognitionRef.current?.stop(), [])
  useEffect(() => {
    if (!open) recognitionRef.current?.stop()
  }, [open])

  const speak = (text) => {
    if (muted || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onstart = () => setState('speaking')
    utterance.onend = () => setState('idle')
    utterance.onerror = () => setState('idle')
    window.speechSynthesis.speak(utterance)
  }

  const startConversation = () => {
    setError('')
    setTranscript('')
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      setError('Speech recognition is not supported in this browser. You can still use Navi by typing below.')
      setState('idle')
      return
    }
    const recognition = new Recognition()
    recognition.lang = 'en-US'; recognition.interimResults = true; recognition.continuous = false
    recognition.onstart = () => setState('listening')
    recognition.onerror = (event) => { setError(event.error === 'not-allowed' ? 'Microphone permission was denied. Enable it in your browser settings or use the text fallback.' : 'Navi could not hear that. Please try again.'); setState('idle') }
    recognition.onresult = (event) => {
      const text = Array.from(event.results).map(result => result[0].transcript).join(' ')
      setTranscript(text)
      if (event.results[event.results.length - 1].isFinal) handleText(text)
    }
    recognition.onend = () => { if (state === 'listening') setState('thinking') }
    recognitionRef.current = recognition
    recognition.start()
  }

  const handleText = async (text) => {
    if (!text.trim()) return
    setState('thinking'); setError('')
    try {
      const { data } = await apiRequest('/assistant/respond', { method: 'POST', body: JSON.stringify({ text }) })
      setBody(data.reply)
      speak(data.reply)
      const destination = { careers: 'careers', quiz: 'quiz', recommendations: 'recommendations', saved: 'saved', resources: 'resources', stories: 'stories', profile: 'profile' }[data.intent]
      if (destination && navigate) setTimeout(() => navigate(destination), 700)
    } catch (err) { setError(err.message || 'Navi could not process that request.'); setState('idle') }
  }

  const closeAssistant = () => { recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); setState('idle'); onClose() }
  if (!open) return null
  const title = state === 'listening' ? 'I’m listening…' : state === 'thinking' ? 'Finding your best next step' : state === 'speaking' ? 'Here’s what I’m noticing' : 'Ready when you are'
  return <div className="voice-overlay" role="dialog" aria-modal="true" aria-label="Talk with Navi"><div className="voice-shell"><div className="voice-topbar"><div className="voice-context"><span className="online-dot" /> Navi · helping with {context}</div><button className="icon-button glass" onClick={closeAssistant} aria-label="Close voice mode"><Icon name="close" /></button></div><div className={`voice-stage state-${state}`}><div className="voice-rings" aria-hidden="true"><span /><span /><span /></div><img src={poseForState[state]} alt={`Navi is ${state}`} /></div><div className="voice-copy" aria-live="polite"><span className="eyebrow">Voice mode</span><h2>{title}</h2><p>{body}</p>{transcript&&<div className="live-transcript">“{transcript}”</div>}{error&&<p className="form-error" role="alert">{error}</p>}<p className="voice-privacy">Microphone audio is processed by your browser's speech recognition. PathSeeker receives only the transcript you submit.</p></div><div className="voice-controls"><button className="icon-button glass" onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute Navi' : 'Mute Navi'}><Icon name={muted ? 'close' : 'headphones'} /></button><button className={`voice-main ${state === 'listening' ? 'is-listening' : ''}`} onClick={startConversation} aria-label="Start talking"><Icon name="mic" size={27} /></button><button className="icon-button glass" onClick={() => { setTranscript(''); setBody('Ask about a career, your quiz, or what to do next.'); setError(''); setState('idle') }} aria-label="Restart conversation"><Icon name="more" /></button></div><label className="voice-text-fallback">Or type to Navi<input value={transcript} onChange={e=>setTranscript(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleText(transcript)}} placeholder="e.g. Which careers fit design?" /></label><p className="voice-hint">{state === 'idle' ? 'Tap the microphone and allow access, or use the text fallback.' : state === 'listening' ? 'Speak naturally; Navi will process the transcript.' : 'Navi can make mistakes. Check important details.'}</p></div></div>
}
