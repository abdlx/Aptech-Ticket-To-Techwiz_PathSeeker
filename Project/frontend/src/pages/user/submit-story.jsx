import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import Back from '../../components/common/BackButton'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import PageTitle from '../../components/common/PageTitle'
import { careersApi } from '../../services/careersApi'
import { contentApi } from '../../services/contentApi'

export default function SubmitStoryPage({ navigate }) {
  const [step, setStep] = useState(1)
  const [sent, setSent] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [domainId, setDomainId] = useState('')
  const [challenge, setChallenge] = useState('')
  const [turningPoint, setTurningPoint] = useState('')
  const [outcome, setOutcome] = useState('')
  const [consent, setConsent] = useState(true)
  const [publicApproval, setPublicApproval] = useState(true)

  const domainsQuery = useQuery({
    queryKey: ['domains', 'list'],
    queryFn: ({ signal }) => careersApi.getDomains({ signal }),
    staleTime: 60_000,
  })

  const domains = domainsQuery.data?.data?.domains || []

  const submitMutation = useMutation({
    mutationFn: (payload) => contentApi.submitStory(payload),
    onSuccess: () => {
      setSent(true)
    },
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      return
    }

    const selectedDomainId = domainId || domains[0]?._id
    const combinedStoryText = `Challenge: ${challenge}\n\nTurning Point: ${turningPoint}\n\nOutcome: ${outcome}`

    submitMutation.mutate({
      authorName: authorName.trim() || 'Anonymous Explorer',
      domainId: selectedDomainId,
      storyText: combinedStoryText,
      challenges: challenge,
      educationPath: turningPoint,
      outcome: outcome,
      consent: consent === true,
    })
  }

  if (sent) {
    return (
      <div className="submission-success">
        <img src="/assets/navi/navi-celebrating.png" alt="Navi celebrating" />
        <span>
          <Icon name="check" />
        </span>
        <h1>Your story is with our review team.</h1>
        <p>We’ll review it and publish it to the community. Thank you for sharing your experience!</p>
        <button className="button primary" onClick={() => navigate('stories')}>
          Back to stories
        </button>
      </div>
    )
  }

  return (
    <div className="page-stack">
      <Breadcrumbs
        items={[
          { label: 'Stories', to: 'stories' },
          { label: 'Share your story' },
        ]}
        navigate={navigate}
      />
      <Back navigate={navigate} to="stories">
        Back to success stories
      </Back>
      <PageTitle
        eyebrow={`Share your journey · Step ${step} of 3`}
        title="Your path could help someone else begin"
        copy="Tell the story in your own words. Nothing is published until review and approval."
      />
      <div className="submission-layout">
        <form className="panel story-form" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <h2>Start with the transition</h2>
              <div className="form-grid">
                <label>
                  Your name / Author name
                  <input
                    required
                    placeholder="e.g. Aisha Rahman"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                </label>
                <label>
                  Career Domain
                  <select
                    value={domainId || (domains[0]?._id || '')}
                    onChange={(e) => setDomainId(e.target.value)}
                  >
                    {domains.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Tell us what happened</h2>
              <label>
                Your challenge
                <textarea
                  required
                  placeholder="What uncertainty or barrier did you face initially?"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                />
              </label>
              <label>
                Your turning point
                <textarea
                  required
                  placeholder="What action, course, or insight changed your direction?"
                  value={turningPoint}
                  onChange={(e) => setTurningPoint(e.target.value)}
                />
              </label>
              <label>
                Your outcome
                <textarea
                  required
                  placeholder="Where are you now and what was the result?"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                />
              </label>
            </>
          )}

          {step === 3 && (
            <>
              <h2>Review and permissions</h2>
              <div className="story-preview">
                <span className="avatar">{authorName ? authorName[0] : 'PS'}</span>
                <div>
                  <small>Draft story</small>
                  <h3>{authorName || 'Career explorer'}</h3>
                  <p>{domains.find((d) => d._id === (domainId || domains[0]?._id))?.name || 'Career path'}</p>
                </div>
              </div>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                /> I confirm this is my story and PathSeeker may review and publish it.
              </label>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={publicApproval}
                  onChange={(e) => setPublicApproval(e.target.checked)}
                /> I approve displaying my name and career transition publicly.
              </label>
              {submitMutation.error && (
                <p style={{ color: 'var(--rose, #c05c5c)', fontSize: '11px' }}>
                  {submitMutation.error.message}
                </p>
              )}
            </>
          )}

          <div className="form-actions">
            <button
              className="button ghost"
              type="button"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
            <button
              className="button primary"
              type="submit"
              disabled={submitMutation.isPending}
            >
              {step === 3
                ? submitMutation.isPending
                  ? 'Submitting...'
                  : 'Submit for review'
                : 'Continue'}{' '}
              <Icon name="arrow" />
            </button>
          </div>
        </form>

        <aside className="submission-guide">
          <img
            src={`/assets/navi/navi-${step === 3 ? 'celebrating' : 'explaining'}.png`}
            alt="Navi guiding your story"
          />
          <div className="panel">
            <span className="eyebrow">A good story includes</span>
            <ul>
              <li>
                <Icon name="check" /> The uncertainty you started with
              </li>
              <li>
                <Icon name="check" /> One practical turning point
              </li>
              <li>
                <Icon name="check" /> What you learned along the way
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
