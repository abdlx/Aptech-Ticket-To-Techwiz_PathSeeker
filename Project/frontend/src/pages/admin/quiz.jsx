import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import Status from '../../components/admin/Status'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { adminApi } from '../../services/adminApi'

export default function QuizAdmin({ navigate }) {
  const queryClient = useQueryClient()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [toast, setToast] = useState(null)

  const query = useQuery({
    queryKey: ['admin', 'quiz-questions'],
    queryFn: ({ signal }) => adminApi.getQuizQuestions({ signal }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => adminApi.updateQuizQuestion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quiz-questions'] })
      setToast('Question updated successfully.')
      setTimeout(() => setToast(null), 3000)
    },
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const questions = query.data?.data?.questions || []
  const activeQuestion = editingQuestion || questions[selectedIndex] || {}

  const handleSave = (e) => {
    e.preventDefault()
    if (!activeQuestion._id) return
    updateMutation.mutate({
      id: activeQuestion._id,
      payload: {
        questionText: activeQuestion.questionText,
        options: activeQuestion.options,
      },
    })
  }

  return (
    <div className="admin-stack">
      <PageHead
        eyebrow="Assessment engine"
        title="Quiz builder"
        description="Shape questions and scoring signals behind personalized career recommendations."
      >
        <button className="button soft" onClick={() => navigate('quiz')}>
          <Icon name="play" /> Preview quiz
        </button>
      </PageHead>

      {toast && (
        <div style={{ background: '#e8f0e9', color: '#416d55', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="check" size={16} /> {toast}
        </div>
      )}

      <div className="quiz-admin-layout">
        <section className="panel question-list">
          <div>
            <h3>Career Passport Assessment</h3>
            <Status tone="success">Active v1</Status>
            <p>{questions.length} questions loaded from database</p>
          </div>
          {questions.map((question, i) => (
            <button
              className={selectedIndex === i ? 'active' : ''}
              key={question._id}
              onClick={() => {
                setSelectedIndex(i)
                setEditingQuestion(question)
              }}
            >
              <span>{i + 1}</span>
              <p>
                <strong>{question.questionText?.slice(0, 45)}...</strong>
                <small>{question.type?.replace('_', ' ') || 'Multiple choice'}</small>
              </p>
            </button>
          ))}
        </section>

        <section className="panel question-editor">
          <form onSubmit={handleSave}>
            <div className="editor-head">
              <div>
                <span className="eyebrow">Question {selectedIndex + 1} of {questions.length}</span>
                <h2>Edit question</h2>
              </div>
            </div>

            <label>
              Question Prompt
              <input
                required
                value={activeQuestion.questionText || ''}
                onChange={(e) =>
                  setEditingQuestion({ ...activeQuestion, questionText: e.target.value })
                }
              />
            </label>

            <div className="answer-editor">
              <span>Answer options ({activeQuestion.options?.length || 0})</span>
              {(activeQuestion.options || []).map((opt, i) => (
                <div key={opt.key || i}>
                  <span>{opt.key || String.fromCharCode(65 + i)}</span>
                  <input
                    value={opt.text || ''}
                    onChange={(e) => {
                      const nextOpts = [...activeQuestion.options]
                      nextOpts[i] = { ...opt, text: e.target.value }
                      setEditingQuestion({ ...activeQuestion, options: nextOpts })
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="editor-actions">
              <button
                className="button primary"
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save & publish changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
