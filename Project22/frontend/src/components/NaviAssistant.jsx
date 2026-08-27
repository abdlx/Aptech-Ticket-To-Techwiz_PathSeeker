import { useEffect, useRef, useState, useCallback } from 'react'
import Icon from './Icon'
import { apiRequest, endpoints } from '../services/pathseekerApi'
import {
  VAPI_ASSISTANT_NAME,
  VAPI_FIRST_MESSAGE,
  VAPI_SYSTEM_PROMPT,
  VAPI_TOOL_DEFINITIONS,
} from '../voiceAgent/vapiAssistantConfig'

const poseForState = {
  idle: '/assets/navi/navi-greeting.png',
  connecting: '/assets/navi/navi-thinking.png',
  listening: '/assets/navi/navi-listening.png',
  thinking: '/assets/navi/navi-thinking.png',
  speaking: '/assets/navi/navi-explaining.png',
}

// Comprehensive English intent matching with proactive conversation & data saving
const LOCAL_INTENTS = [
  {
    keys: ['what can you do', 'capabilities', 'who are you', 'help me', 'features', 'what do you do', 'save data', 'database'],
    intent: null,
    reply: 'I am Navi, your AI Voice Advisor! I can save your Work Experience, Education, Skills with ratings, Career Goals, Interests, Location, and Feedback directly into your database, or guide you through career roadmaps and assessment quizzes. What would you like to update or explore?'
  },
  {
    keys: ['work experience', 'experience', 'job history', 'past role', 'company', 'employed', 'internship'],
    intent: null,
    reply: 'Yes! I can save your Work Experience directly into your database. Tell me your Job Title and Company (for example: "Add experience Frontend Developer at Google" or "I work as Data Analyst at TechCorp").'
  },
  {
    keys: ['education', 'degree', 'university', 'college', 'school', 'studied', 'bachelor', 'master', 'matric', 'phd'],
    intent: null,
    reply: 'Yes! I can record your Education details in the database. Tell me your Degree Level and Institution (for example: "Add education Bachelor in Computer Science at University of London").'
  },
  {
    keys: ['skill', 'skills', 'technical skill', 'soft skill'],
    intent: null,
    reply: 'Yes! I can record your technical and soft skills with self-ratings. For example, say "Add skill React rating 9" or "Add skill Python rating 8" and I will update your database profile!'
  },
  {
    keys: ['location', 'city', 'country', 'living in', 'based in'],
    intent: null,
    reply: 'I can save your Location preferences! Tell me your City and Country (for example: "Set location to New York, USA" or "My city is Karachi").'
  },
  {
    keys: ['salary', 'income', 'desired salary', 'desired income', 'package'],
    intent: null,
    reply: 'I can record your target salary goals! Tell me your desired income (for example: "Set desired salary to 85000 USD").'
  },
  {
    keys: ['profile', 'settings', 'account', 'passport'],
    intent: null,
    reply: 'Your Career Passport profile holds your Work Experience, Education, Skills, Interests, Goals, and Location. Tell me what details you would like to update!'
  },
  {
    keys: ['goal', 'target', 'want to become', 'my goal is', 'save goal', 'set goal'],
    intent: null,
    reply: 'Fantastic! I can save your career goal directly into your database. Tell me your target role, such as Software Engineer, Data Scientist, or UI/UX Designer, and I will record it for you!'
  },
  {
    keys: ['career', 'careers', 'job', 'jobs', 'software', 'developer', 'designer', 'engineer', 'data', 'cloud', 'ai', 'cybersecurity', 'field', 'explore'],
    intent: null,
    reply: 'PathSeeker has comprehensive roadmaps, demand trends, and salary insights for careers like Software Engineering, AI, and Product Design. Would you like me to take you to the Career Bank page, or do you want to set one of these as your goal?'
  },
  {
    keys: ['quiz', 'test', 'assessment', 'evaluate', 'personality', 'start quiz', 'take quiz'],
    intent: null,
    reply: 'The Career Assessment Quiz scores your strengths across domains to match you with top careers. Would you like me to open the Career Quiz page for you?'
  },
  {
    keys: ['recommend', 'match', 'matches', 'suggestion', 'suggestions', 'recommended', 'best fit'],
    intent: null,
    reply: 'I can generate personalized recommendations based on your profile and quiz score. Would you like me to open your Matches page?'
  },
  {
    keys: ['save', 'saved', 'bookmark', 'bookmarks', 'favorites', 'note', 'notes'],
    intent: null,
    reply: 'Your saved careers, notes, and study guides are kept safe in your Saved section. Say "take me to saved page" whenever you would like to view them!'
  },
  {
    keys: ['resource', 'resources', 'pdf', 'document', 'guide', 'roadmaps', 'video', 'learn', 'study'],
    intent: null,
    reply: 'The Resources section contains verified career roadmaps, PDF guides, and video masterclasses. Would you like to navigate to the Resources page?'
  },
  {
    keys: ['story', 'stories', 'inspiration', 'community', 'journey'],
    intent: null,
    reply: 'Success Stories features verified community transformation journeys. Say "open stories page" to explore them!'
  },
  {
    keys: ['feedback', 'comment', 'suggestion', 'report'],
    intent: null,
    reply: 'I can record your feedback directly into our database! Please tell me your feedback message or suggestion.'
  },
  {
    keys: ['help', 'guide', 'how to', 'features', 'assist'],
    intent: null,
    reply: 'PathSeeker is an AI-powered Career Passport platform. You can explore the Career Bank, take the Assessment Quiz, review Matches, download Resources, or save your Career Goals. How may I assist you?'
  },
  {
    keys: ['hello', 'hi', 'hey', 'navi', 'how are you', 'good morning', 'good afternoon', 'good evening'],
    intent: null,
    reply: 'Hello! I am Navi, your AI Career Advisor. I can save your Work Experience, Education, Skills, Career Goals, and Feedback into your database, or guide you through career roadmaps. What would you like to record or explore?'
  },
  {
    keys: ['thank you', 'thanks', 'appreciate it', 'awesome', 'great'],
    intent: null,
    reply: 'You are very welcome! If you want to add work experience, update your skills, or explore careers, just ask me anytime.'
  },
]

function matchLocalIntent(text) {
  const normalized = String(text || '').toLowerCase().trim()
  const match = LOCAL_INTENTS.find(({ keys }) => keys.some((key) => normalized.includes(key)))
  return match || {
    intent: null,
    reply: `You mentioned "${text}". I can help you save this to your profile, guide you through roadmaps, or open the relevant page. How would you like to proceed?`
  }
}

export default function NaviAssistant({ open, onClose, context = 'your career journey', navigate }) {
  const [state, setState] = useState('idle') // 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking'
  const [vapiMode, setVapiMode] = useState(false) // true when active Vapi call
  const [muted, setMuted] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [body, setBody] = useState('Ask about a career, your quiz, or what to do next.')
  const [error, setError] = useState('')
  const [volumeLevel, setVolumeLevel] = useState(0)

  const vapiRef = useRef(null)
  const recognitionRef = useRef(null)
  const transcriptScrollRef = useRef(null)
  const isMountedRef = useRef(true)
  const isActiveRef = useRef(false)
  const isSpeakingRef = useRef(false)
  const lastSpokenTextRef = useRef('')
  const pendingTimerRef = useRef(null)

  const vapiPublicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY || '1d503a56-7aae-4022-82e8-dc4ee922970c'
  const vapiAssistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID || ''

  const clearPendingTimer = () => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current)
      pendingTimerRef.current = null
    }
  }

  // Scroll transcript box to bottom on update
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight
    }
  }, [chatHistory, transcript])

  // Cleanup on unmount or close
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      isActiveRef.current = false
      isSpeakingRef.current = false
      clearPendingTimer()
      stopAllVoice()
    }
  }, [])

  useEffect(() => {
    if (!open) {
      isActiveRef.current = false
      isSpeakingRef.current = false
      clearPendingTimer()
      stopAllVoice()
    } else {
      isActiveRef.current = true
      clearPendingTimer()
      setError('')
      setChatHistory([])
      setTranscript('')
      // Navi speaks greeting FIRST, then starts listening
      setState('speaking')
      setBody(VAPI_FIRST_MESSAGE)
      setChatHistory([{ role: 'assistant', text: VAPI_FIRST_MESSAGE, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
      speakLocalThenListen(VAPI_FIRST_MESSAGE)
    }
  }, [open])

  // Fully stop mic so Navi's own voice is never picked up
  const stopMic = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (_) {}
      recognitionRef.current = null
    }
  }, [])

  const stopAllVoice = useCallback(() => {
    isActiveRef.current = false
    isSpeakingRef.current = false
    clearPendingTimer()
    stopMic()
    if (vapiRef.current) {
      try { vapiRef.current.stop() } catch (_) {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel() } catch (_) {}
    }
    setState('idle')
    setVapiMode(false)
  }, [stopMic])

  // Select the most natural human-like voice available in the browser
  const getBestVoice = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    if (!voices || !voices.length) return null

    // Prioritize natural neural English/Urdu voices that sound like a real human
    const preferredVoices = [
      'Microsoft Christopher Online (Natural)',
      'Microsoft Guy Online (Natural)',
      'Microsoft Roger Online (Natural)',
      'Microsoft Ryan Online (Natural)',
      'Microsoft Aria Online (Natural)',
      'Google UK English Male',
      'Google US English',
      'Microsoft David Desktop',
      'Microsoft Mark',
    ]

    for (const pref of preferredVoices) {
      const match = voices.find((v) => v.name.includes(pref) || v.name.toLowerCase().includes(pref.toLowerCase()))
      if (match) return match
    }

    // Fallback to any natural or en-US/en-GB voice
    const naturalVoice = voices.find((v) => (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google')) && v.lang.startsWith('en'))
    if (naturalVoice) return naturalVoice

    const enVoice = voices.find((v) => v.lang.startsWith('en'))
    return enVoice || voices[0]
  }, [])

  // Browser Speech Synthesis helper - speaks text with natural human intonation
  const speakLocal = useCallback((text) => {
    if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = getBestVoice()
    if (voice) utterance.voice = voice
    utterance.rate = 0.98
    utterance.pitch = 1.0
    utterance.onstart = () => { if (isActiveRef.current) setState('speaking') }
    utterance.onend = () => { if (isActiveRef.current) setState('idle') }
    utterance.onerror = () => { if (isActiveRef.current) setState('idle') }
    window.speechSynthesis.speak(utterance)
  }, [muted, getBestVoice])

  // Speaks text aloud, STOPS mic first to prevent feedback loop, then listens after
  const speakLocalThenListen = useCallback((text, onComplete) => {
    // CRITICAL: Stop mic BEFORE speaking and flag speaking state to block echo
    stopMic()
    clearPendingTimer()
    isSpeakingRef.current = true
    lastSpokenTextRef.current = String(text || '').toLowerCase()

    if (!isMountedRef.current || !isActiveRef.current) {
      isSpeakingRef.current = false
      return
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      isSpeakingRef.current = false
      if (onComplete) onComplete()
      pendingTimerRef.current = setTimeout(() => {
        if (isActiveRef.current && isMountedRef.current) startLocalRecognition()
      }, 500)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = getBestVoice()
    if (voice) utterance.voice = voice
    utterance.rate = 0.98
    utterance.pitch = 1.0

    utterance.onstart = () => {
      isSpeakingRef.current = true
      if (isMountedRef.current && isActiveRef.current) setState('speaking')
    }

    utterance.onend = () => {
      if (!isMountedRef.current || !isActiveRef.current) {
        isSpeakingRef.current = false
        return
      }
      setState('idle')
      if (onComplete) onComplete()
      
      // Wait 1100ms so speaker tail & room reverberations completely fade before listening
      clearPendingTimer()
      pendingTimerRef.current = setTimeout(() => {
        isSpeakingRef.current = false
        if (isMountedRef.current && isActiveRef.current) startLocalRecognition()
      }, 1100)
    }

    utterance.onerror = () => {
      if (!isMountedRef.current || !isActiveRef.current) {
        isSpeakingRef.current = false
        return
      }
      setState('idle')
      if (onComplete) onComplete()
      clearPendingTimer()
      pendingTimerRef.current = setTimeout(() => {
        isSpeakingRef.current = false
        if (isMountedRef.current && isActiveRef.current) startLocalRecognition()
      }, 800)
    }

    window.speechSynthesis.speak(utterance)
  }, [muted, stopMic, getBestVoice])

  // Handle client-side tool execution from Vapi
  const handleVapiToolCall = useCallback(async (toolCall) => {
    const fnName = toolCall.name || toolCall.function?.name
    let args = toolCall.parameters || toolCall.function?.arguments || {}
    if (typeof args === 'string') {
      try {
        args = JSON.parse(args)
      } catch (_) {}
    }

    try {
      if (fnName === 'navigateApp') {
        const dest = args.screen
        if (dest && navigate) {
          setTimeout(() => {
            navigate(dest)
          }, 600)
        }
        return { success: true, message: `Navigated to ${dest}` }
      }

      if (fnName === 'submitFeedback') {
        await apiRequest(endpoints.feedback, {
          method: 'POST',
          body: JSON.stringify({ category: args.category || 'general', message: args.message }),
        }).catch(() => null)
        return { success: true, message: 'Feedback submitted successfully' }
      }

      if (fnName === 'saveUserProfile') {
        await apiRequest(endpoints.profile, {
          method: 'PATCH',
          body: JSON.stringify(args),
        }).catch(() => null)
        return { success: true, message: 'Profile updated successfully' }
      }

      return { success: true, message: 'Action processed' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [navigate])

  // Start Vapi Call
  const startVapiCall = async () => {
    try {
      setState('connecting')
      setError('')

      let VapiModule = null
      try {
        const mod = await import('@vapi-ai/web')
        VapiModule = mod.default || mod.Vapi || mod
      } catch (importErr) {
        console.warn('Vapi package dynamic load fallback:', importErr)
      }

      if (!VapiModule || !vapiPublicKey) {
        // Fallback to local Web Speech Recognition
        startLocalRecognition()
        return
      }

      if (!vapiRef.current) {
        const vapi = new VapiModule(vapiPublicKey)

        vapi.on('call-start', () => {
          if (!isMountedRef.current) return
          setState('speaking')
          setVapiMode(true)
          setBody(VAPI_FIRST_MESSAGE)
          setChatHistory((prev) => [
            ...prev,
            { role: 'assistant', text: VAPI_FIRST_MESSAGE, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          ])
        })

        vapi.on('call-end', () => {
          if (!isMountedRef.current) return
          setState('idle')
          setVapiMode(false)
        })

        vapi.on('speech-start', () => {
          if (!isMountedRef.current) return
          setState('speaking')
        })

        vapi.on('speech-end', () => {
          if (!isMountedRef.current) return
          setState('listening')
        })

        vapi.on('volume-level', (vol) => {
          if (isMountedRef.current) {
            setVolumeLevel(Math.min(1, Math.max(0, vol * 2.5)))
          }
        })

        vapi.on('message', (msg) => {
          if (!isMountedRef.current) return
          if (msg.type === 'transcript') {
            if (msg.transcriptType === 'final') {
              const role = msg.role === 'user' ? 'user' : 'assistant'
              setChatHistory((prev) => [
                ...prev,
                { role, text: msg.transcript, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
              ])
              if (role === 'assistant') {
                setBody(msg.transcript)
              }
            } else {
              setTranscript(msg.transcript || '')
            }
          }

          if (msg.type === 'function-call' || msg.type === 'tool-calls') {
            const toolCall = msg.functionCall || (msg.toolCalls && msg.toolCalls[0])
            if (toolCall) {
              handleVapiToolCall(toolCall).then((result) => {
                try {
                  vapi.send({
                    type: 'add-message',
                    message: {
                      role: 'tool',
                      tool_call_id: toolCall.id,
                      content: JSON.stringify(result),
                    },
                  })
                } catch (_) {}
              })
            }
          }
        })

        vapi.on('error', (err) => {
          console.warn('[Vapi Event Error]:', err)
          if (!isMountedRef.current) return
          // Graceful fallback to browser speech recognition
          stopAllVoice()
          startLocalRecognition()
        })

        vapiRef.current = vapi
      }

      // Start call with inline assistant configuration or assistant ID
      if (vapiAssistantId) {
        await vapiRef.current.start(vapiAssistantId)
      } else {
        await vapiRef.current.start({
          name: VAPI_ASSISTANT_NAME,
          firstMessage: VAPI_FIRST_MESSAGE,
          model: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: VAPI_SYSTEM_PROMPT,
              },
            ],
            tools: VAPI_TOOL_DEFINITIONS,
          },
          voice: {
            provider: '11labs',
            voiceId: 'josh',
          },
          transcriber: {
            provider: 'deepgram',
            model: 'nova-2',
            language: 'multi',
          },
        })
      }
    } catch (err) {
      console.warn('[Vapi Start Exception]:', err)
      // Fallback to local mode
      stopAllVoice()
      startLocalRecognition()
    }
  }

  // Local Web Speech Recognition - single shot, no feedback loop
  const startLocalRecognition = () => {
    if (!isMountedRef.current || !isActiveRef.current) return
    setError('')
    setTranscript('')
    const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!Recognition) {
      setError('Speech recognition is not supported in this browser. You can still chat with Navi by typing below.')
      setState('idle')
      return
    }

    try {
      // Make sure old recognition is fully dead
      stopMic()
      if (!isActiveRef.current) return

      const recognition = new Recognition()
      recognition.lang = 'en-US'
      recognition.interimResults = true
      recognition.continuous = false  // Single shot to prevent echo
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        if (isMountedRef.current && isActiveRef.current) {
          setState('listening')
          setBody('Listening to you... Speak in Urdu or English.')
        }
      }

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          // Restart listening silently if still active
          if (isMountedRef.current && isActiveRef.current) {
            clearPendingTimer()
            pendingTimerRef.current = setTimeout(() => {
              if (isMountedRef.current && isActiveRef.current) startLocalRecognition()
            }, 300)
          }
          return
        }
        if (event.error === 'aborted') return
        setError(
          event.error === 'not-allowed'
            ? 'Microphone permission denied. Enable it in browser settings or type below.'
            : 'Please speak clearly into your microphone.'
        )
        if (event.error === 'not-allowed') setState('idle')
      }

      let gotFinalResult = false
      let silenceTimer = null
      let accumulatedText = ''

      recognition.onresult = (event) => {
        if (!isActiveRef.current || isSpeakingRef.current) return
        let finalStr = ''
        let interimStr = ''
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript + ' '
          } else {
            interimStr += event.results[i][0].transcript
          }
        }
        const currentText = (finalStr || interimStr).trim()
        if (currentText && isActiveRef.current && !isSpeakingRef.current) {
          // Echo suppression: Ignore if microphone caught Navi's own speaker output
          const lowerText = currentText.toLowerCase()
          if (lastSpokenTextRef.current && (
            (lowerText.length > 8 && lastSpokenTextRef.current.includes(lowerText)) ||
            lowerText.startsWith('success') ||
            lowerText.startsWith('done') ||
            lowerText.startsWith('hello') ||
            lowerText.startsWith('i am navi') ||
            lowerText.startsWith('i can') ||
            lowerText.startsWith('yes!') ||
            lowerText.startsWith('your career') ||
            lowerText.startsWith('your profile') ||
            lowerText.startsWith('your feedback') ||
            lowerText.startsWith('pathseeker') ||
            lowerText.startsWith('the career') ||
            lowerText.startsWith('the resources') ||
            lowerText.startsWith('you are very welcome') ||
            lowerText.startsWith('fantastic')
          )) {
            return
          }

          accumulatedText = currentText
          setTranscript(currentText)

          // Reset pause timer on every new word or sound so user is never cut off
          if (silenceTimer) clearTimeout(silenceTimer)
          silenceTimer = setTimeout(() => {
            if (isActiveRef.current && !isSpeakingRef.current && accumulatedText.length > 2 && !gotFinalResult) {
              gotFinalResult = true
              try { recognition.stop() } catch (_) {}
              recognitionRef.current = null
              handleText(accumulatedText)
            }
          }, 1600)
        }
      }

      recognition.onend = () => {
        if (silenceTimer) clearTimeout(silenceTimer)
        if (accumulatedText && accumulatedText.length > 2 && !gotFinalResult && isActiveRef.current && !isSpeakingRef.current) {
          gotFinalResult = true
          handleText(accumulatedText)
          return
        }
        // If no speech was captured, restart listening cleanly
        if (!gotFinalResult && isMountedRef.current && isActiveRef.current && !isSpeakingRef.current) {
          clearPendingTimer()
          pendingTimerRef.current = setTimeout(() => {
            if (isMountedRef.current && isActiveRef.current && !isSpeakingRef.current) startLocalRecognition()
          }, 300)
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      if (isActiveRef.current) {
        setError('Could not start microphone. Please try typing below.')
        setState('idle')
      }
    }
  }

  // Handle text message processing (typing or speech transcript)
  const handleText = async (text) => {
    const query = String(text || '').trim()
    if (!query) return

    // STOP mic immediately before processing
    stopMic()

    setChatHistory((prev) => [
      ...prev,
      { role: 'user', text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ])
    setTranscript('')
    setState('thinking')
    setError('')

    // Use LOCAL intent matching as instant baseline
    const localMatch = matchLocalIntent(query)
    let reply = localMatch.reply
    let intent = localMatch.intent
    let dataSaved = false

    // Execute authoritative backend API (performs actual MongoDB database CRUD operations)
    try {
      const { data } = await apiRequest('/assistant/respond', {
        method: 'POST',
        body: JSON.stringify({ text: query }),
        timeoutMs: 6000,
      })
      if (data?.reply) {
        reply = data.reply
        intent = data.intent || intent
        dataSaved = !!data.dataSaved
      }
    } catch (_) {
      // API fallback - local match reply is used if offline
    }

    if (dataSaved && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pathseeker:profile-updated'))
      window.dispatchEvent(new CustomEvent('pathseeker:bookmarks-updated'))
    }

    setBody(reply)
    setChatHistory((prev) => [
      ...prev,
      { role: 'assistant', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ])

    // Check if the user EXPLICITLY requested navigation to a page
    const lowerQuery = query.toLowerCase()
    const isExplicitNavigation =
      lowerQuery.includes('open ') ||
      lowerQuery.includes('take me') ||
      lowerQuery.includes('go to') ||
      lowerQuery.includes('show me the') ||
      lowerQuery.includes('show me ') ||
      lowerQuery.includes('navigate') ||
      lowerQuery.includes('redirect') ||
      lowerQuery.includes('launch ') ||
      lowerQuery.includes('take me there') ||
      lowerQuery.includes('page')

    let destination = null
    if (isExplicitNavigation) {
      if (lowerQuery.includes('career') || lowerQuery.includes('bank') || lowerQuery.includes('job')) destination = 'careers'
      else if (lowerQuery.includes('quiz') || lowerQuery.includes('test') || lowerQuery.includes('assessment')) destination = 'quiz'
      else if (lowerQuery.includes('recommend') || lowerQuery.includes('match')) destination = 'recommendations'
      else if (lowerQuery.includes('save') || lowerQuery.includes('bookmark')) destination = 'saved'
      else if (lowerQuery.includes('resource') || lowerQuery.includes('guide') || lowerQuery.includes('pdf')) destination = 'resources'
      else if (lowerQuery.includes('stor')) destination = 'stories'
      else if (lowerQuery.includes('profile') || lowerQuery.includes('setting') || lowerQuery.includes('account')) destination = 'profile'
      else if (lowerQuery.includes('feedback')) destination = 'feedback'
      else if (lowerQuery.includes('help') || lowerQuery.includes('faq')) destination = 'help'
    }

    // Navi SPEAKS the entire answer first.
    // Navigation occurs ONLY IF the user explicitly asked to navigate!
    speakLocalThenListen(reply, () => {
      if (destination && navigate) {
        navigate(destination)
      }
    })
  }

  const toggleVoiceSession = () => {
    if (state !== 'idle') {
      // ANY active state -> stop everything
      stopAllVoice()
    } else {
      startVapiCall()
    }
  }

  const closeAssistant = () => {
    stopAllVoice()
    onClose()
  }

  if (!open) return null

  const title =
    state === 'connecting'
      ? 'Connecting to Navi…'
      : state === 'listening'
      ? 'Navi is listening…'
      : state === 'thinking'
      ? 'Finding your best career path…'
      : state === 'speaking'
      ? 'Navi is speaking'
      : 'Ready when you are'

  return (
    <div className="voice-overlay" role="dialog" aria-modal="true" aria-label="Talk with Navi">
      <div className="voice-shell">
        <div className="voice-topbar">
          <div className="voice-context">
            <span className={`online-dot ${state !== 'idle' ? 'pulse' : ''}`} />
            <strong>Navi AI</strong> · {context} {vapiMode && <span style={{ opacity: 0.8, fontSize: '9px', marginLeft: '4px' }}>(VAPI Active)</span>}
          </div>
          <button className="icon-button glass" onClick={closeAssistant} aria-label="Close voice mode">
            <Icon name="close" />
          </button>
        </div>

        <div className={`voice-stage state-${state}`}>
          <div
            className="voice-rings"
            aria-hidden="true"
            style={{
              transform: volumeLevel > 0 ? `scale(${1 + volumeLevel * 0.18})` : undefined,
              opacity: state === 'listening' || state === 'speaking' ? 0.85 : 0.4,
            }}
          >
            <span />
            <span />
            <span />
          </div>
          <img src={poseForState[state] || poseForState.idle} alt={`Navi is ${state}`} />
        </div>

        <div className="voice-copy" aria-live="polite">
          <span className="eyebrow">AI Voice Advisor · PathSeeker</span>
          <h2>{title}</h2>
          <p>{body}</p>

          {/* Live Transcript / Chat History Box */}
          <div
            ref={transcriptScrollRef}
            className="live-transcript"
            style={{
              maxHeight: '130px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {chatHistory.length === 0 && !transcript && (
              <span style={{ opacity: 0.7, fontStyle: 'italic' }}>
                Tap the microphone or say: “Search AI careers”, “Take career quiz”, or “Batao konsi field best hai?”
              </span>
            )}
            {chatHistory.map((item, idx) => (
              <div key={idx} style={{ fontSize: '11px', lineHeight: 1.4 }}>
                <strong style={{ color: item.role === 'user' ? '#96c5a0' : '#8fd09e' }}>
                  {item.role === 'user' ? 'You' : 'Navi'}:
                </strong>{' '}
                <span>{item.text}</span>
              </div>
            ))}
            {transcript && (
              <div style={{ fontSize: '11px', color: '#b7d6bd', fontStyle: 'italic' }}>
                “{transcript}”
              </div>
            )}
          </div>

          {error && <p className="form-error" role="alert" style={{ marginTop: '8px' }}>{error}</p>}
          <p className="voice-privacy" style={{ fontSize: '9px', opacity: 0.65, marginTop: '8px' }}>
            Powered by VAPI AI Voice Agent &amp; PathSeeker NLP. Bilingual Roman Urdu &amp; English support.
          </p>
        </div>

        <div className="voice-controls">
          <button
            className="icon-button glass"
            onClick={() => setMuted(!muted)}
            aria-label={muted ? 'Unmute Navi' : 'Mute Navi'}
            title={muted ? 'Unmute' : 'Mute'}
          >
            <Icon name={muted ? 'close' : 'headphones'} />
          </button>

          <button
            className={`voice-main ${state === 'listening' ? 'is-listening' : ''}`}
            onClick={toggleVoiceSession}
            aria-label={state === 'listening' || state === 'speaking' || vapiMode ? 'Stop talking' : 'Start talking'}
            title={state === 'listening' || state === 'speaking' || vapiMode ? 'End Voice Session' : 'Start Talking'}
          >
            <Icon name="mic" size={27} />
          </button>

          <button
            className="icon-button glass"
            onClick={() => {
              stopAllVoice()
              setTranscript('')
              setChatHistory([])
              setBody('Ask about a career, your quiz, or what to do next.')
              setError('')
            }}
            aria-label="Restart conversation"
            title="Reset Chat"
          >
            <Icon name="more" />
          </button>
        </div>

        <label className="voice-text-fallback">
          Or type to Navi
          <input
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleText(transcript)
            }}
            placeholder="e.g. Which careers fit design, or open career quiz..."
          />
        </label>

        <p className="voice-hint">
          {state === 'idle'
            ? 'Tap the microphone to speak with Navi, or type your career question.'
            : state === 'listening'
            ? 'Navi is listening. Speak naturally in Urdu or English.'
            : state === 'speaking'
            ? 'Navi is speaking. Tap mic to interrupt or pause.'
            : 'Navi is processing your career pathway.'}
        </p>
      </div>
    </div>
  )
}
