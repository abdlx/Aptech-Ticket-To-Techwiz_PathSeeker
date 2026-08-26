import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import Back from '../../components/common/BackButton'
import PageTitle from '../../components/common/PageTitle'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { contentApi } from '../../services/contentApi'

export default function DocumentPreviewPage({ navigate, resourceId }) {
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: queryKeys.resources.detail(resourceId),
    queryFn: ({ signal }) => (resourceId ? contentApi.getResourceById(resourceId, { signal }) : Promise.resolve(null)),
    enabled: Boolean(resourceId),
  })

  const downloadMutation = useMutation({
    mutationFn: () => (resourceId ? contentApi.recordDownload(resourceId) : Promise.resolve()),
  })

  if (resourceId && query.isLoading) return <PageSkeleton />
  if (resourceId && query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const resource = query.data?.data?.resource
  const title = resource?.title || 'Career Decision Workbook'
  const description = resource?.description || 'A practical guided workbook for comparing career possibilities and planning experiments.'
  const totalPages = resource?.pageCount || 18

  const handleDownload = () => {
    downloadMutation.mutate()
    if (resource?.file?.url) {
      window.open(resource.file.url, '_blank')
    } else {
      window.print()
    }
  }

  return (
    <div className="page-stack">
      <Back navigate={navigate} to="resources">
        Back to resources
      </Back>
      <PageTitle
        eyebrow="Toolkit · Document preview"
        title={title}
        copy={description}
        actions={
          <button className="button primary" onClick={handleDownload}>
            <Icon name="download" /> Download Document
          </button>
        }
      />
      <div className="document-layout">
        <aside className="panel document-sidebar">
          <span className="eyebrow">Contents</span>
          {['What matters now', 'Energy audit', 'Career shortlist', 'Reality check', 'Next experiment'].map((sectionTitle, index) => (
            <button
              className={page === index + 1 ? 'active' : ''}
              onClick={() => setPage(index + 1)}
              key={sectionTitle}
            >
              <span>0{index + 1}</span>
              {sectionTitle}
            </button>
          ))}
          <div>
            <Icon name="file" />
            <p>
              <strong>{totalPages} pages</strong>
              <small>{resource?.downloadCount || 0} total downloads</small>
            </p>
          </div>
        </aside>

        <main className="document-sheet">
          <div className="document-brand">
            <span>
              <Icon name="compass" />
            </span>
            <strong>PathSeeker</strong>
            <small>{title}</small>
          </div>
          <span className="eyebrow">Chapter {page}</span>
          <h1>
            {[
              'What matters to you now?',
              'Track what gives you energy',
              'Build a thoughtful shortlist',
              'Test assumptions against reality',
              'Choose one small experiment',
            ][page - 1] || 'Reflection and Action'}
          </h1>
          <p className="document-lead">
            Use this page to turn broad career questions into something you can observe, compare, and act on.
          </p>
          <div className="worksheet-box">
            <span>Reflection prompt</span>
            <h3>What would make your work feel meaningful this year?</h3>
            <div />
            <div />
            <div />
          </div>
          <div className="worksheet-grid">
            <section>
              <strong>More of this</strong>
              <p>Write the tasks, environments, and people that bring out your best.</p>
            </section>
            <section>
              <strong>Less of this</strong>
              <p>Notice what consistently drains focus or makes progress harder.</p>
            </section>
          </div>
          <footer>
            <span>PathSeeker Career Passport</span>
            <strong>
              {page} / {totalPages}
            </strong>
          </footer>
        </main>
      </div>
    </div>
  )
}
