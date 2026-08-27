import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import NaviAssistant from './NaviAssistant'

function renderAssistant(props = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><NaviAssistant open onClose={() => {}} {...props} /></QueryClientProvider>)
}

afterEach(() => {
  vi.restoreAllMocks()
  delete window.SpeechRecognition
  delete window.webkitSpeechRecognition
})

it('opens without activating the microphone and keeps a typed fallback visible', () => {
  const recognition = vi.fn()
  window.SpeechRecognition = recognition
  renderAssistant()

  expect(screen.getByRole('dialog', { name: 'Ready when you are' })).toBeInTheDocument()
  expect(screen.getByLabelText('Or type to Navi')).toBeInTheDocument()
  expect(recognition).not.toHaveBeenCalled()
})

it('sends typed guidance through the backend and honors explicit navigation', async () => {
  const navigate = vi.fn()
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: { intent: 'careers', reply: 'Opening Career Bank.' } }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
  renderAssistant({ navigate })

  await userEvent.type(screen.getByLabelText('Or type to Navi'), 'Open Career Bank')
  await userEvent.click(screen.getByRole('button', { name: 'Send message' }))

  expect(await screen.findAllByText('Opening Career Bank.')).toHaveLength(2)
  expect(navigate).toHaveBeenCalledWith('careers')
  expect(fetchMock).toHaveBeenCalledWith('/api/assistant/respond', expect.objectContaining({
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ text: 'Open Career Bank' }),
  }))
})

it('explains the browser limitation when speech recognition is unavailable', async () => {
  renderAssistant()
  const browserMode = screen.queryByRole('button', { name: 'Browser voice' })
  if (browserMode) await userEvent.click(browserMode)
  await userEvent.click(screen.getByRole('button', { name: 'Start voice session' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('does not provide speech recognition')
})
