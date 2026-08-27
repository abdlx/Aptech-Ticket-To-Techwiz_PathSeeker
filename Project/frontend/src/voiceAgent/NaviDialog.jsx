import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Icon from '../components/Icon'
import { queryKeys } from '../lib/queryKeys'
import { assistantApi } from '../services/assistantApi'
import { useAccessibilityStore } from '../stores/appStores'
import { createInlineVapiAssistant, VAPI_FIRST_MESSAGE, VAPI_VOICE } from './vapiAssistantConfig'

const poseForState = {
  idle: '/assets/navi/navi-greeting.png',
  connecting: '/assets/navi/navi-thinking.png',
  listening: '/assets/navi/navi-listening.png',
  thinking: '/assets/navi/navi-thinking.png',
  speaking: '/assets/navi/navi-explaining.png',
}

const titleForState = {
  idle: 'Ready when you are',
  connecting: 'Connecting securely…',
  listening: 'I’m listening…',
  thinking: 'Checking PathSeeker…',
  speaking: 'Here’s what I found',
}

const VALID_SCREENS = new Set(['dashboard', 'careers', 'quiz', 'recommendations', 'saved', 'resources', 'stories', 'profile', 'feedback', 'help', 'compare', 'quiz-history'])
const NAVIGATION_WORDS = ['open ', 'take me', 'go to', 'show me', 'navigate', 'launch ', 'visit ']

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const requestedNavigation = (text) => NAVIGATION_WORDS.some((phrase) => String(text).toLowerCase().includes(phrase))

function localFallback(text) {
  const normalized = text.toLowerCase()
  if (normalized.includes('quiz') || normalized.includes('assessment')) return { intent: 'quiz', reply: 'The assessment builds an explainable Career Passport from your answers. I cannot reach the live service right now, but the quiz page may still be available.' }
  if (normalized.includes('career') || normalized.includes('job')) return { intent: 'careers', reply: 'Career Bank compares skills, responsibilities, salary evidence, demand, and learning roadmaps. I cannot reach the live guidance service right now.' }
  if (normalized.includes('resource') || normalized.includes('video') || normalized.includes('pdf')) return { intent: 'resources', reply: 'Resources contains documents and multimedia connected to career paths. I cannot reach the live guidance service right now.' }
  return { intent: null, reply: 'I cannot reach PathSeeker’s secure assistant service right now. I did not save or change any account data. Please try again when the connection returns.' }
}

function extractToolCalls(message) {
  if (Array.isArray(message?.toolCallList)) return message.toolCallList
  if (Array.isArray(message?.toolWithToolCallList)) return message.toolWithToolCallList.map((item) => item.toolCall).filter(Boolean)
  if (Array.isArray(message?.toolCalls)) return message.toolCalls
  if (message?.functionCall) return [message.functionCall]
  return []
}

function parseToolArguments(toolCall) {
  const value = toolCall?.function?.arguments ?? toolCall?.parameters ?? {}
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

export default function NaviDialog({ onClose, context, navigate }) {
  const queryClient = useQueryClient()
  const { naviMuted, setNaviMuted } = useAccessibilityStore()
  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY?.trim() || ''
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID?.trim() || ''
  const cloudAvailable = Boolean(publicKey)

  const [state, setState] = useState('idle')
  const [mode, setMode] = useState('none')
  const [preferredMode, setPreferredMode] = useState(cloudAvailable ? 'cloud' : 'browser')
  const [body, setBody] = useState(VAPI_FIRST_MESSAGE)
  const [draft, setDraft] = useState('')
  const [liveTranscript, setLiveTranscript] = useState('')
  const [error, setError] = useState('')
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [chatHistory, setChatHistory] = useState(() => [{ id: 1, role: 'assistant', text: VAPI_FIRST_MESSAGE, time: now() }])

  const vapiRef = useRef(null)
  const recognitionRef = useRef(null)
  const requestControllerRef = useRef(null)
  const transcriptScrollRef = useRef(null)
  const inputRef = useRef(null)
  const messageIdRef = useRef(1)
  const mountedRef = useRef(true)
  const activeUtteranceRef = useRef(null)
  const connectionTimeoutRef = useRef(null)
  const speechTimeoutRef = useRef(null)
  const processedToolCallsRef = useRef(new Set())
  const transcriptSignaturesRef = useRef(new Set())

  const appendMessage = useCallback((role, text) => {
    const clean = String(text || '').trim()
    if (!clean) return
    messageIdRef.current += 1
    setChatHistory((items) => [...items, { id: messageIdRef.current, role, text: clean, time: now() }])
  }, [])

  const releaseVoiceResources = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current)
      speechTimeoutRef.current = null
    }
    activeUtteranceRef.current = null
    requestControllerRef.current?.abort()
    requestControllerRef.current = null
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // The browser can report an already-ended recognition session.
      }
      recognitionRef.current = null
    }
    if (vapiRef.current) {
      try {
        vapiRef.current.stop().catch(() => undefined)
      } catch {
        // Ignore stop error
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {
        // Ignore cancel error
      }
    }
  }, [])

  const getBestVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    const preferredNames = ['Microsoft Christopher Online (Natural)', 'Microsoft Guy Online (Natural)', 'Microsoft Aria Online (Natural)', 'Microsoft Aria', 'Microsoft Guy', 'Google UK English', 'Google US English']
    return preferredNames.map((name) => voices.find((voice) => voice.name.includes(name))).find(Boolean)
      || voices.find((voice) => voice.lang?.startsWith('en') && /natural|neural|google/i.test(voice.name))
      || voices.find((voice) => voice.lang?.startsWith('en'))
      || null
  }, [])

  const speakInBrowser = useCallback((text) => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current)
      speechTimeoutRef.current = null
    }
    if (naviMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setState('idle')
      return
    }
    try {
      window.speechSynthesis.cancel()
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
    } catch {
      // Speech synthesis was unavailable or could not be resumed.
    }

    const utterance = new SpeechSynthesisUtterance(text)
    activeUtteranceRef.current = utterance
    const voice = getBestVoice()
    if (voice) utterance.voice = voice
    utterance.rate = 0.98
    utterance.pitch = 1

    const clearUtterance = () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current)
        speechTimeoutRef.current = null
      }
      activeUtteranceRef.current = null
      if (mountedRef.current) setState('idle')
    }

    utterance.onstart = () => {
      if (mountedRef.current) setState('speaking')
    }
    utterance.onend = clearUtterance
    utterance.onerror = clearUtterance

    const timeoutDuration = Math.max(3000, text.length * 85 + 2000)
    speechTimeoutRef.current = setTimeout(clearUtterance, timeoutDuration)

    try {
      window.speechSynthesis.speak(utterance)
    } catch {
      clearUtterance()
    }
  }, [getBestVoice, naviMuted])

  const refreshPersonalization = useCallback((entity) => {
    if (!entity) return
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.me() })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.me() })
    queryClient.invalidateQueries({ queryKey: queryKeys.passport.me() })
    queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.me() })
    if (entity === 'feedback') queryClient.invalidateQueries({ queryKey: queryKeys.feedback.mine() })
  }, [queryClient])

  const executeToolCall = useCallback(async (toolCall) => {
    const name = toolCall?.function?.name || toolCall?.name
    const args = parseToolArguments(toolCall)

    if (name === 'navigateApp') {
      if (!VALID_SCREENS.has(args.screen) || !navigate) return { success: false, message: 'That PathSeeker destination is unavailable.' }
      navigate(args.screen)
      return { success: true, message: `Opened ${args.screen}.` }
    }

    if (name === 'askPathSeeker') {
      if (!args.request?.trim()) return { success: false, message: 'The request was empty.' }
      try {
        const payload = await assistantApi.respond(args.request)
        const result = payload?.data
        refreshPersonalization(result?.dataSaved ? result.entity : null)
        return { success: true, ...result }
      } catch (toolError) {
        return { success: false, message: toolError.message || 'PathSeeker could not process that request.' }
      }
    }

    return { success: false, message: 'That action is not supported.' }
  }, [navigate, refreshPersonalization])

  const submitMessage = useCallback(async (rawText, { speak = true } = {}) => {
    const text = String(rawText || '').trim()
    if (!text) return

    requestControllerRef.current?.abort()
    const controller = new AbortController()
    requestControllerRef.current = controller
    appendMessage('user', text)
    setDraft('')
    setLiveTranscript('')
    setError('')
    setState('thinking')

    let result
    try {
      const payload = await assistantApi.respond(text, { signal: controller.signal })
      result = payload?.data
      refreshPersonalization(result?.dataSaved ? result.entity : null)
    } catch (requestError) {
      if (requestError?.code === 'CANCELLED') return
      result = localFallback(text)
      setError(requestError?.message || 'The secure assistant service is unavailable.')
    } finally {
      if (requestControllerRef.current === controller) requestControllerRef.current = null
    }

    if (!mountedRef.current) return
    const reply = result?.reply || localFallback(text).reply
    setBody(reply)
    appendMessage('assistant', reply)
    if (result?.intent && requestedNavigation(text) && VALID_SCREENS.has(result.intent) && navigate) navigate(result.intent)
    if (speak) speakInBrowser(reply)
    else setState('idle')
  }, [appendMessage, navigate, refreshPersonalization, speakInBrowser])

  const handleVapiMessage = useCallback((message) => {
    if (message?.type === 'transcript') {
      if (message.transcriptType === 'partial') {
        setLiveTranscript(message.transcript || '')
        return
      }
      const text = String(message.transcript || '').trim()
      const signature = `${message.role}:${text}`
      if (text && !transcriptSignaturesRef.current.has(signature)) {
        transcriptSignaturesRef.current.add(signature)
        appendMessage(message.role === 'user' ? 'user' : 'assistant', text)
        if (message.role === 'assistant') setBody(text)
      }
      setLiveTranscript('')
    }

    for (const toolCall of extractToolCalls(message)) {
      const toolCallId = toolCall.id || `${toolCall?.function?.name || toolCall.name}:${JSON.stringify(parseToolArguments(toolCall))}`
      if (processedToolCallsRef.current.has(toolCallId)) continue
      processedToolCallsRef.current.add(toolCallId)
      executeToolCall(toolCall).then((result) => {
        if (!vapiRef.current) return
        vapiRef.current.send({
          type: 'add-message',
          message: { role: 'tool', tool_call_id: toolCall.id || toolCallId, content: JSON.stringify(result) },
          triggerResponseEnabled: true,
        })
      })
    }
  }, [appendMessage, executeToolCall])

  const ensureVapi = useCallback(async () => {
    if (vapiRef.current) return vapiRef.current
    const module = await import('@vapi-ai/web')
    const VapiConstructor = module.default || module.Vapi || module
    const vapi = new VapiConstructor(publicKey)
    vapi.setVolume(naviMuted ? 0 : 1)
    vapi.on('call-start', () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
        connectionTimeoutRef.current = null
      }
      if (!mountedRef.current) return
      setMode('cloud')
      setState('listening')
      setError('')
    })
    vapi.on('call-end', () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
        connectionTimeoutRef.current = null
      }
      if (!mountedRef.current) return
      setMode('none')
      setState('idle')
      setVolumeLevel(0)
    })
    vapi.on('speech-start', () => mountedRef.current && setState('speaking'))
    vapi.on('speech-end', () => mountedRef.current && setState('listening'))
    vapi.on('volume-level', (value) => mountedRef.current && setVolumeLevel(Math.min(1, Math.max(0, Number(value) * 2.5))))
    vapi.on('message', handleVapiMessage)

    const handleVoiceFailure = (voiceError) => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
        connectionTimeoutRef.current = null
      }
      if (!mountedRef.current) return
      const msg = voiceError?.message || 'Cloud voice could not connect. Switched to browser voice.'
      setError(msg)
      setPreferredMode('browser')
      setMode('none')
      setState('idle')
      if (vapiRef.current) {
        try {
          vapiRef.current.stop().catch(() => undefined)
        } catch {
          // Ignore failure when stopping disconnected instance
        }
      }
    }

    vapi.on('error', handleVoiceFailure)
    vapi.on('call-start-failed', handleVoiceFailure)
    vapiRef.current = vapi
    return vapi
  }, [handleVapiMessage, naviMuted, publicKey])

  const startBrowserVoice = useCallback(() => {
    const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!Recognition) {
      setError('This browser does not provide speech recognition. You can still type to Navi below.')
      inputRef.current?.focus()
      return
    }

    releaseVoiceResources()
    setMode('browser')
    setState('connecting')
    setError('')
    setLiveTranscript('')

    try {
      const recognition = new Recognition()
      let finalText = ''
      recognition.lang = 'en-US'
      recognition.interimResults = true
      recognition.continuous = false
      recognition.maxAlternatives = 1
      recognition.onstart = () => mountedRef.current && setState('listening')
      recognition.onresult = (event) => {
        let partial = ''
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const value = event.results[index][0]?.transcript || ''
          if (event.results[index].isFinal) finalText += `${value} `
          else partial += value
        }
        const visible = (finalText || partial).trim()
        setLiveTranscript(visible)
        setDraft(visible)
      }
      recognition.onerror = (event) => {
        if (!mountedRef.current || event.error === 'aborted') return
        setError(event.error === 'not-allowed' ? 'Microphone permission was denied. Enable it in browser settings or type below.' : 'I could not hear that clearly. Please try again or type below.')
        setMode('none')
        setState('idle')
      }
      recognition.onend = () => {
        if (recognitionRef.current !== recognition) return
        recognitionRef.current = null
        const text = finalText.trim()
        if (text) submitMessage(text)
        else if (mountedRef.current) {
          setMode('none')
          setState('idle')
        }
      }
      recognitionRef.current = recognition
      recognition.start()
    } catch (voiceError) {
      setError(voiceError?.message || 'Microphone access could not start. You can still type below.')
      setMode('none')
      setState('idle')
    }
  }, [releaseVoiceResources, submitMessage])

  const startCloudVoice = useCallback(async () => {
    if (!cloudAvailable) {
      startBrowserVoice()
      return
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
    }
    setState('connecting')
    setError('')
    processedToolCallsRef.current.clear()
    transcriptSignaturesRef.current.clear()

    // 6.5s timeout safeguard against hung WebRTC / Vapi connection
    connectionTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setError('Cloud voice connection timed out. Switched to browser voice.')
        setPreferredMode('browser')
        setMode('none')
        setState('idle')
        if (vapiRef.current) {
          try {
            vapiRef.current.stop().catch(() => undefined)
          } catch {
            // Ignore failure when stopping disconnected instance
          }
        }
      }
    }, 6500)

    try {
      const vapi = await ensureVapi()
      if (assistantId) {
        await vapi.start(assistantId, {
          recordingEnabled: false,
          voice: { ...VAPI_VOICE },
        })
      }
      else await vapi.start(createInlineVapiAssistant())
    } catch (voiceError) {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
        connectionTimeoutRef.current = null
      }
      if (!mountedRef.current) return
      setError(voiceError?.message || 'Cloud voice could not start. Switched to browser voice.')
      setPreferredMode('browser')
      setMode('none')
      setState('idle')
    }
  }, [assistantId, cloudAvailable, ensureVapi, startBrowserVoice])

  const stopSession = useCallback(() => {
    releaseVoiceResources()
    setMode('none')
    setState('idle')
    setLiveTranscript('')
    setVolumeLevel(0)
  }, [releaseVoiceResources])

  const closeAssistant = useCallback(() => {
    releaseVoiceResources()
    onClose()
  }, [onClose, releaseVoiceResources])

  const resetConversation = useCallback(() => {
    stopSession()
    messageIdRef.current += 1
    setChatHistory([{ id: messageIdRef.current, role: 'assistant', text: VAPI_FIRST_MESSAGE, time: now() }])
    setBody(VAPI_FIRST_MESSAGE)
    setDraft('')
    setError('')
    processedToolCallsRef.current.clear()
    transcriptSignaturesRef.current.clear()
  }, [stopSession])

  const startPreferredVoice = useCallback(() => {
    if (state !== 'idle') {
      stopSession()
      return
    }
    if (preferredMode === 'cloud' && cloudAvailable) startCloudVoice()
    else startBrowserVoice()
  }, [cloudAvailable, preferredMode, startBrowserVoice, startCloudVoice, state, stopSession])


  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') closeAssistant()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeAssistant])

  useEffect(() => {
    const transcript = transcriptScrollRef.current
    if (!transcript) return
    if (typeof transcript.scrollTo === 'function') transcript.scrollTo({ top: transcript.scrollHeight })
    else transcript.scrollTop = transcript.scrollHeight
  }, [chatHistory, liveTranscript])

  useEffect(() => {
    vapiRef.current?.setVolume(naviMuted ? 0 : 1)
  }, [naviMuted])

  useEffect(() => {
    // React Strict Mode replays effects in development. Restore this guard on
    // every setup so Vapi and browser-speech callbacks are not mistaken for
    // post-unmount work after the replay cleanup runs.
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      releaseVoiceResources()
    }
  }, [releaseVoiceResources])

  const active = state !== 'idle'
  const modeLabel = mode === 'cloud' ? 'Cloud conversation' : mode === 'browser' ? 'Browser voice' : preferredMode === 'cloud' ? 'Cloud voice ready' : 'Private browser voice ready'

  return (
    <div className="voice-overlay" role="dialog" aria-modal="true" aria-labelledby="navi-dialog-title">
      <div className="voice-shell">
        <div className="voice-topbar">
          <div className="voice-context"><span className={`online-dot ${active ? 'pulse' : ''}`} /><strong>Navi</strong><span>· {context}</span><span className="voice-mode-status">{modeLabel}</span></div>
          <button className="icon-button glass" onClick={closeAssistant} aria-label="Close Navi"><Icon name="close" /></button>
        </div>

        <div className={`voice-stage state-${state}`}>
          <div className="voice-rings" aria-hidden="true" style={{ transform: volumeLevel ? `scale(${1 + volumeLevel * 0.14})` : undefined }}><span /><span /><span /></div>
          <img src={poseForState[state] || poseForState.idle} alt="" />
        </div>

        <div className="voice-copy" aria-live="polite">
          <span className="eyebrow">AI career guide · PathSeeker</span>
          <h2 id="navi-dialog-title">{titleForState[state]}</h2>
          <p>{body}</p>
          <div ref={transcriptScrollRef} className="live-transcript voice-transcript" aria-label="Conversation transcript">
            {chatHistory.map((item) => <div className={`voice-message role-${item.role}`} key={item.id}><div><strong>{item.role === 'user' ? 'You' : 'Navi'}</strong><time>{item.time}</time></div><p>{item.text}</p></div>)}
            {liveTranscript && <div className="voice-message is-live"><div><strong>Listening</strong></div><p>“{liveTranscript}”</p></div>}
          </div>
          {error && <p className="voice-error" role="alert">{error}</p>}
          <p className="voice-privacy"><Icon name="check" size={13} /> Microphone access starts only when you tap. Cloud calls are not recorded by this app.</p>
        </div>

        <div className="voice-controls">
          <button className={`icon-button glass ${naviMuted ? 'is-muted' : ''}`} onClick={() => setNaviMuted(!naviMuted)} aria-label={naviMuted ? 'Unmute Navi responses' : 'Mute Navi responses'} title={naviMuted ? 'Unmute Navi' : 'Mute Navi'}><Icon name={naviMuted ? 'close' : 'headphones'} /></button>
          <button className={`voice-main ${state === 'listening' ? 'is-listening' : ''}`} onClick={startPreferredVoice} aria-label={active ? 'End voice session' : 'Start voice session'}><Icon name={active ? 'close' : 'mic'} size={27} /></button>
          <button className="icon-button glass" onClick={resetConversation} aria-label="Reset conversation" title="Reset conversation"><Icon name="more" /></button>
        </div>

        <div className="voice-mode-switch" aria-label="Voice mode">
          {cloudAvailable && <button className={preferredMode === 'cloud' ? 'active' : ''} onClick={() => setPreferredMode('cloud')} disabled={active}>Cloud conversation</button>}
          <button className={preferredMode === 'browser' ? 'active' : ''} onClick={() => setPreferredMode('browser')} disabled={active}>Browser voice</button>
        </div>

        <form className="voice-text-fallback" onSubmit={(event) => { event.preventDefault(); submitMessage(draft) }}>
          <label htmlFor="navi-message">Or type to Navi</label>
          <div><input ref={inputRef} id="navi-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about careers, or update one profile detail…" maxLength={500} /><button type="submit" disabled={!draft.trim() || state === 'thinking'} aria-label="Send message"><Icon name="arrow" /></button></div>
        </form>

        <p className="voice-hint">{state === 'idle' ? 'Choose a voice mode, tap the microphone, or type a message.' : state === 'listening' ? 'Speak naturally. Tap again to stop.' : state === 'speaking' ? 'Navi is responding. Tap to interrupt.' : 'Please wait while Navi checks PathSeeker.'}</p>
      </div>
    </div>
  )
}
