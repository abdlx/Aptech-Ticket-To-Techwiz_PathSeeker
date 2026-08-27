import Icon from '../../components/Icon'
import Back from '../../components/common/BackButton'
import { useEffect, useState } from 'react'
import { apiRequest, endpoints, mapMedia } from '../../services/pathseekerApi'

export default function MediaDetailPage({ navigate, mediaId }) {
  const [media, setMedia] = useState(null)
  const [rating, setRating] = useState(0)
  const [transcript, setTranscript] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(null)
  const [relatedMedia, setRelatedMedia] = useState([])
  useEffect(() => {
    const path = mediaId ? `${endpoints.media}/${mediaId}` : `${endpoints.media}?limit=1`
    apiRequest(path).then(async ({ data }) => { const item=data.media?.[0] || data.media; setMedia(mapMedia(item)); try { const related = await apiRequest(endpoints.relatedMedia(item._id)); setRelatedMedia((related.data.media || []).map(mapMedia)) } catch {} try { const bookmarks=await apiRequest(endpoints.bookmarks); setSaved((bookmarks.data.bookmarks||[]).find(b=>b.itemType==='media'&&b.itemId===item._id)||null) } catch {} }).catch(err => setError(err.message || 'Could not load media.')).finally(() => setLoading(false))
  }, [mediaId])
  const toggleSaved = async () => { if (!media) return; try { if (saved) { await apiRequest(`${endpoints.bookmarks}/${saved._id}`,{method:'DELETE'}); setSaved(null) } else { const {data}=await apiRequest(endpoints.bookmarks,{method:'POST',body:JSON.stringify({itemType:'media',itemId:media._id})}); setSaved(data.bookmark) } } catch(err) { setError(err.message||'Could not update bookmark.') } }
  const rate = async (value) => {
    if (!media) return
    try {
      const { data } = await apiRequest(`${endpoints.media}/${media._id}/ratings`, { method: 'POST', body: JSON.stringify({ value }) })
      setMedia(mapMedia(data.media)); setRating(value)
    } catch (err) { setError(err.message || 'Could not rate this media.') }
  }
  if (loading) return <div className="page-stack"><div className="panel">Loading media…</div></div>
  if (!media) return <div className="page-stack"><div className="panel form-error">{error || 'Media not found.'}</div></div>
  return <div className="page-stack">
    <Back navigate={navigate} to="resources">Back to resources</Back>
    {error && <div className="panel form-error">{error}</div>}
    <div className="media-layout">
      <main>
        <section className="media-player">
          {media.type === 'video' && <video controls preload="metadata" src={media.url} aria-label={media.title} style={{ width: '100%', maxHeight: 520, borderRadius: 16 }} />}
          {media.type === 'audio' && <audio controls preload="metadata" src={media.url} aria-label={media.title} style={{ width: '100%' }} />}
          {media.type === 'animation' && <iframe title={media.title} src={media.url} loading="lazy" allowFullScreen style={{ width: '100%', minHeight: 420, border: 0, borderRadius: 16 }} />}
        </section>
        <section className="media-copy"><div className="detail-actions"><h1>{media.title}</h1><div><button className="button soft small" onClick={toggleSaved}><Icon name="bookmark"/> {saved?'Saved':'Save'}</button><button className="button ghost small" onClick={()=>{const url=window.location.href;if(navigator.share)navigator.share({title:media.title,url});else navigator.clipboard?.writeText(url)}}><Icon name="share"/> Share</button></div></div><p>{media.tags?.join(' · ')}</p></section>
        <section className="panel transcript-card"><div><div><span className="eyebrow">Accessibility</span><h2>Transcript</h2></div><button className="button soft small" onClick={() => setTranscript(!transcript)}>{transcript ? 'Hide' : 'Show'} transcript</button></div>{transcript && <p>{media.transcript || 'No transcript has been published for this media item.'}</p>}</section>
        {relatedMedia.length > 0 && <section className="panel"><span className="eyebrow">More like this</span><h2>Related media</h2><div className="resource-grid">{relatedMedia.map(item => <button className="resource-card panel" key={item._id} onClick={() => navigate('media-detail', item._id)}><h3>{item.title}</h3><p>{item.tags?.join(' · ')}</p><span className="card-link">Open <Icon name="arrow"/></span></button>)}</div></section>}
        {media.relatedCareerIds?.length > 0 && <section className="panel"><span className="eyebrow">Keep exploring</span><h2>Related careers</h2><div className="skill-row">{media.relatedCareerIds.map(career => <button key={career._id} className="button soft small" onClick={() => navigate('career-detail', career.slug)}>{career.title} <Icon name="arrow" size={14} /></button>)}</div></section>}
      </main>
      <aside><section className="panel rating-card"><span className="eyebrow">Was this useful?</span><h3>Rate this resource</h3><div>{[1,2,3,4,5].map(star => <button aria-label={`Rate ${star} out of 5`} className={star <= rating ? 'active' : ''} key={star} onClick={() => rate(star)}><Icon name="star" /></button>)}</div><small>{media.ratingAvg || 0} average from {media.ratingCount || 0} ratings</small></section></aside>
    </div>
  </div>
}
