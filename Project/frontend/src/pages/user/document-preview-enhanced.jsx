import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Icon from '../../components/Icon'
import Back from '../../components/common/BackButton'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import PageTitle from '../../components/common/PageTitle'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { contentApi } from '../../services/contentApi'
import { personalizationApi } from '../../services/personalizationApi'

export default function DocumentPreviewEnhancedPage({ navigate, resourceId }) {
  const [notice, setNotice] = useState('')
  const query = useQuery({
    queryKey: queryKeys.resources.detail(resourceId),
    queryFn: ({ signal }) => contentApi.getResourceById(resourceId, { signal }), enabled: Boolean(resourceId),
  })
  const resource = query.data?.data?.resource

  useEffect(() => {
    if (!resource?._id) return
    contentApi.recordResourceView(resource._id).catch(() => {})
    personalizationApi.recordRecentlyViewed({ itemType: 'resource', itemId: resource._id }).catch(() => {})
  }, [resource?._id])

  const downloadMutation = useMutation({
    mutationFn: () => contentApi.recordDownload(resourceId),
    onSuccess: () => setNotice('Download opened and the resource count was updated.'),
    onError: () => setNotice('The document opened, but the download counter could not be updated.'),
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const fileUrl = resource.file?.url
  const handleDownload = () => {
    if (fileUrl) window.open(fileUrl, '_blank', 'noopener,noreferrer')
    downloadMutation.mutate()
  }

  return (
    <div className="page-stack">
      <Breadcrumbs items={[{ label: 'Resources', to: 'resources' }, { label: resource.title }]} navigate={navigate} />
      <Back navigate={navigate} to="resources">Back to resources</Back>
      <PageTitle eyebrow={`${resource.type} - Original PathSeeker material`} title={resource.title} copy={resource.description} actions={<button className="button primary" onClick={handleDownload}><Icon name="download" /> Download PDF</button>} />
      {notice && <p className="inline-notice" role="status">{notice}</p>}

      <div className="document-preview-layout">
        <aside className="panel document-metadata">
          <span className="eyebrow">Document details</span>
          <dl><div><dt>Pages</dt><dd>{resource.pageCount || '-'}</dd></div><div><dt>Format</dt><dd>{resource.file?.mimeType || 'application/pdf'}</dd></div><div><dt>Author</dt><dd>{resource.authorName || 'PathSeeker Editorial'}</dd></div><div><dt>Version</dt><dd>{resource.version || '1.0'}</dd></div><div><dt>Downloads</dt><dd>{resource.downloadCount || 0}</dd></div><div><dt>Reviewed</dt><dd>{resource.lastReviewedAt ? new Date(resource.lastReviewedAt).toLocaleDateString() : 'Not specified'}</dd></div></dl>
          <div className="skill-row">{resource.tags?.map((tag) => <span key={tag}>{tag}</span>)}</div>
          {resource.sourceReferences?.length > 0 && <div className="source-list"><strong>Reference sources</strong>{resource.sourceReferences.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <Icon name="arrow" /></a>)}</div>}
          <p className="resource-disclaimer">This original learning resource is educational guidance. Verify current requirements, licensing rules, and local labor-market information before making a major decision.</p>
        </aside>

        <main className="real-document-preview">
          {fileUrl ? <iframe src={`${fileUrl}#view=FitH`} title={`${resource.title} PDF preview`} /> : <div className="panel"><h2>Preview unavailable</h2><p>This resource does not currently have a downloadable file.</p></div>}
          {fileUrl && <p>If the preview does not load, <a href={fileUrl} target="_blank" rel="noreferrer">open the PDF in a new tab</a>.</p>}
        </main>
      </div>
    </div>
  )
}
