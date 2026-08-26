import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import { feedbackApi } from '../../services/feedbackApi'

const CATEGORY_MAP = {
  Idea: 'suggestion',
  Problem: 'bug',
  Query: 'query',
  Other: 'suggestion',
}

export default function FeedbackPage({ navigate }) {
  const [selectedType, setSelectedType] = useState('Idea')
  const [rating, setRating] = useState(4)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const feedbackMutation = useMutation({
    mutationFn: (payload) => feedbackApi.submitFeedback(payload),
    onSuccess: () => {
      setSent(true)
    },
    onError: (err) => {
      setError(err.message || 'Failed to submit feedback. Please try again.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    const category = CATEGORY_MAP[selectedType] || 'suggestion'
    feedbackMutation.mutate({
      category,
      message: message.trim() || 'I would love a way to compare career roadmaps and track learning milestones.',
    })
  }

  if (sent) {
    return (
      <div className="feedback-success">
        <img src="/assets/navi/navi-celebrating.png" alt="Navi celebrating" />
        <span className="success-check">
          <Icon name="check" />
        </span>
        <h1>Thanks for helping us grow.</h1>
        <p>Your feedback has been sent to the PathSeeker team. We review every message.</p>
        <button className="button primary" onClick={() => navigate('dashboard')}>
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="feedback-page">
      <section className="feedback-copy">
        <span className="eyebrow">Send feedback</span>
        <h1>Help make the journey better</h1>
        <p>Found something confusing? Have an idea? We read every message and prioritize based on explorer needs.</p>
        <img src="/assets/navi/navi-listening.png" alt="Navi listening" />
      </section>

      <form className="feedback-card panel" onSubmit={handleSubmit}>
        <label>
          What is this about?
          <div className="feedback-types">
            {['Idea', 'Problem', 'Query', 'Other'].map((item) => (
              <button
                type="button"
                className={selectedType === item ? 'active' : ''}
                key={item}
                onClick={() => setSelectedType(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </label>

        <label>
          How was your experience?
          <div className="rating-row">
            {[1, 2, 3, 4, 5].map((item) => (
              <button
                type="button"
                key={item}
                className={item <= rating ? 'active' : ''}
                onClick={() => setRating(item)}
              >
                <Icon name="star" />
              </button>
            ))}
          </div>
        </label>

        <label>
          Tell us more
          <textarea
            required
            minLength={5}
            maxLength={2000}
            placeholder="What would you like us to know?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>

        <label className="check-row">
          <input type="checkbox" defaultChecked /> You may contact me about this feedback
        </label>

        {error && (
          <p style={{ color: 'var(--rose, #c05c5c)', fontSize: '11px', margin: '4px 0 10px' }}>
            {error}
          </p>
        )}

        <button
          className="button primary full"
          type="submit"
          disabled={feedbackMutation.isPending}
        >
          {feedbackMutation.isPending ? 'Sending...' : 'Send feedback'} <Icon name="arrow" />
        </button>
      </form>
    </div>
  )
}
