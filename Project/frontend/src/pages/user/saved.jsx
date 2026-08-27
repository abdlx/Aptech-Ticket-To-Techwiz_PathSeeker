import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import SectionHead from '../../components/user/SectionHead'
import CareerCard from '../../components/user/CareerCard'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { personalizationApi } from '../../services/personalizationApi'
import { exportToPdf } from '../../lib/pdfExport'

export default function SavedPage({ navigate }) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('Careers')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [noteText, setNoteText] = useState('')

  const query = useQuery({
    queryKey: queryKeys.bookmarks.list(),
    queryFn: ({ signal }) => personalizationApi.getBookmarks({}, { signal }),
  })

  const removeBookmarkMutation = useMutation({
    mutationFn: (id) => personalizationApi.removeBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.list() })
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, note }) => personalizationApi.updateBookmarkNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.list() })
      setEditingNoteId(null)
      setNoteText('')
    },
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const bookmarks = query.data?.data?.bookmarks || []
  const careerBookmarks = bookmarks.filter((b) => b.itemType === 'career' && b.itemId)
  const resourceBookmarks = bookmarks.filter((b) => ['resource', 'media'].includes(b.itemType) && b.itemId)
  const notedBookmarks = bookmarks.filter((b) => b.note && b.note.trim())

  const handleSaveNote = (id) => {
    updateNoteMutation.mutate({ id, note: noteText })
  }

  const handleShare = async () => {
    const shareData = { title: 'My PathSeeker career collection', text: `I saved ${bookmarks.length} career resources in PathSeeker.`, url: window.location.href }
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {})
      return
    }
    window.location.href = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.text}\n${shareData.url}`)}`
  }

  return (
    <div className="saved-page page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">Your collection</span>
          <h1>Saved ideas & notes</h1>
          <p>Everything you want to revisit, organized in one calm place.</p>
        </div>
        <div className="page-action-row"><button className="button soft" onClick={() => exportToPdf('My PathSeeker Collection')}><Icon name="download" /> Export / print</button><button className="button primary" onClick={handleShare}><Icon name="arrow" /> Share collection</button></div>
      </section>

      <div className="tab-row">
        <button className={tab === 'Careers' ? 'active' : ''} onClick={() => setTab('Careers')}>
          Saved careers <span>{careerBookmarks.length}</span>
        </button>
        <button className={tab === 'Resources' ? 'active' : ''} onClick={() => setTab('Resources')}>
          Resources <span>{resourceBookmarks.length}</span>
        </button>
        <button className={tab === 'Notes' ? 'active' : ''} onClick={() => setTab('Notes')}>
          My notes <span>{notedBookmarks.length}</span>
        </button>
      </div>

      {tab === 'Careers' && (
        <div className="saved-layout">
          <section>
            {careerBookmarks.length > 0 ? (
              <div className="career-grid two-col">
                {careerBookmarks.map((bookmark) => {
                  const career = bookmark.itemId
                  const cardData = {
                    id: career.slug || career._id,
                    title: career.title,
                    field: career.domainId?.name || 'Career path',
                    match: career.growthRatePercent || 85,
                    salary: career.expectedSalary
                      ? `$${(career.expectedSalary.min / 1000).toFixed(0)}k – $${(career.expectedSalary.max / 1000).toFixed(0)}k`
                      : '$70k – $110k',
                    demand: career.marketDemand === 'very_high' ? 'Very high' : 'High demand',
                    growth: `+${career.growthRatePercent || 12}%`,
                    icon: career.iconKey || 'briefcase',
                    tone: career.colorTone || 'lavender',
                    skills: (career.requiredSkills || []).map((s) => s.skillId?.name || s.name || 'Skill').slice(0, 4),
                    summary: career.summary || career.description,
                  }
                  return (
                    <CareerCard
                      key={bookmark._id}
                      career={cardData}
                      navigate={navigate}
                      saved
                      toggleSaved={() => removeBookmarkMutation.mutate(bookmark._id)}
                      compact
                    />
                  )
                })}
              </div>
            ) : (
              <EmptyState
                title="No saved careers yet"
                message="Bookmark careers from the Career Bank to easily compare them here."
              />
            )}
          </section>

          <aside className="panel notes-preview">
            <SectionHead eyebrow="Notes" title="Thoughts to revisit" />
            {notedBookmarks.slice(0, 4).map((b) => (
              <article key={b._id}>
                <span className="note-dot mint" />
                <div>
                  <strong>{b.itemId?.title || 'Saved note'}</strong>
                  <p>{b.note}</p>
                </div>
              </article>
            ))}
            {careerBookmarks.length > 0 && !editingNoteId && (
              <button
                className="new-note"
                onClick={() => {
                  setEditingNoteId(careerBookmarks[0]._id)
                  setNoteText(careerBookmarks[0].note || '')
                }}
              >
                <Icon name="plus" /> Add or edit a note
              </button>
            )}
            {editingNoteId && (
              <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write your note here..."
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #dfe4e0' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="button primary small" onClick={() => handleSaveNote(editingNoteId)}>
                    Save note
                  </button>
                  <button className="button ghost small" onClick={() => setEditingNoteId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {tab === 'Resources' && (
        <div className="resource-grid">
          {resourceBookmarks.length > 0 ? (
            resourceBookmarks.map((b) => {
              const res = b.itemId
              return (
                <article key={b._id} className="resource-card">
                  <div className="resource-cover mint">
                    <Icon name={res.type === 'video' ? 'video' : 'file'} size={32} />
                    <span>{res.type || 'Resource'}</span>
                  </div>
                  <div>
                    <span className="resource-type">{res.type || 'Resource'}</span>
                    <h3>{res.title}</h3>
                    <p>{res.description || res.tags?.join(', ')}</p>
                    <button
                      className="card-link"
                      onClick={() => navigate(b.itemType === 'media' ? 'media-detail' : 'document-preview', res._id)}
                    >
                      Open resource <Icon name="arrow" />
                    </button>
                  </div>
                </article>
              )
            })
          ) : (
            <EmptyState
              title="No saved resources"
              message="Save courses, videos, and guides from the Resource Library to access them here."
            />
          )}
        </div>
      )}

      {tab === 'Notes' && (
        <div className="notes-grid">
          {notedBookmarks.length > 0 ? (
            notedBookmarks.map((b, i) => (
              <article key={b._id} className="panel">
                <div>
                  <span className={`note-dot ${['mint', 'blue', 'lavender', 'amber', 'rose'][i % 5]}`} />
                  <button onClick={() => removeBookmarkMutation.mutate(b._id)}>
                    <Icon name="close" />
                  </button>
                </div>
                <h3>{b.itemId?.title || 'Note'}</h3>
                <p>{b.note}</p>
                <small>Added note</small>
              </article>
            ))
          ) : (
            <EmptyState
              title="No notes added yet"
              message="Add sticky notes to any saved career or resource to record your thoughts."
            />
          )}
        </div>
      )}
    </div>
  )
}
