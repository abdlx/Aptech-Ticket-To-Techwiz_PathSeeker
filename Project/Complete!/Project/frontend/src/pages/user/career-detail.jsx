import Icon from '../../components/Icon'
import SectionHead from '../../components/user/SectionHead'
import { useEffect, useState } from 'react'
import { apiRequest, endpoints, mapCareer } from '../../services/pathseekerApi'

export default function CareerDetailPage({ navigate, careerId }) {
  const [career, setCareer] = useState(null); const [saved, setSaved] = useState(null); const [related, setRelated] = useState([]); const [relatedContent, setRelatedContent] = useState({ media: [], resources: [] }); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data } = await apiRequest(`${endpoints.careers}/${encodeURIComponent(careerId)}`)
        if (cancelled) return
        const mapped = mapCareer(data.career)
        setCareer(mapped)
        try { const relatedResult = await apiRequest(endpoints.relatedCareers(mapped.slug) + '?limit=4'); setRelated((relatedResult.data.careers || []).map(item => mapCareer(item))) } catch {}
        try { const contentResult = await apiRequest(endpoints.relatedContent(mapped.slug) + '?limit=4'); setRelatedContent(contentResult.data || { media: [], resources: [] }) } catch {}
        try { const bookmarkResult = await apiRequest(endpoints.bookmarks); setSaved((bookmarkResult.data?.bookmarks || []).find((b) => b.itemType === 'career' && b.itemId === mapped._id) || null) } catch {}
        await apiRequest(endpoints.recentlyViewed, { method: 'POST', body: JSON.stringify({ itemType: 'career', itemId: mapped._id }) })
      } catch (err) { if (!cancelled) setError(err.message || 'Could not load this career.') }
      finally { if (!cancelled) setLoading(false) }
    }
    load(); return () => { cancelled = true }
  }, [careerId])
  const toggleSaved = async () => {
    if (!career) return
    try {
      if (saved) { await apiRequest(`${endpoints.bookmarks}/${saved._id}`, { method: 'DELETE' }); setSaved(null) }
      else { const { data } = await apiRequest(endpoints.bookmarks, { method: 'POST', body: JSON.stringify({ itemType: 'career', itemId: career._id }) }); setSaved(data.bookmark) }
    } catch (err) { setError(err.message || 'Could not update bookmark.') }
  }
  if (loading) return <div className="page-stack"><div className="panel">Loading career profile…</div></div>
  if (!career) return <div className="page-stack"><div className="panel form-error">{error || 'Career not found.'}</div></div>
  return <div className="career-detail page-stack">
    <button className="back-link" onClick={() => navigate('careers')}><Icon name="arrowLeft" /> Back to Career Bank</button>
    {error && <div className="panel form-error">{error}</div>}
    <section className="career-detail-hero"><div className="career-title-block"><span className={`career-icon xl ${career.tone}`}><Icon name={career.icon} size={30} /></span><div><span className="match-pill">Live career profile</span><h1>{career.title}</h1><p>{career.field} · {career.demand} · {career.growth} growth</p></div></div><div className="detail-actions"><button className={`button soft ${saved ? 'saved' : ''}`} onClick={toggleSaved}><Icon name="bookmark" /> {saved ? 'Saved' : 'Save career'}</button><button className="button ghost" onClick={() => { const url = window.location.href; if (navigator.share) navigator.share({ title: career.title, text: career.summary, url }); else window.open(`mailto:?subject=${encodeURIComponent(`PathSeeker: ${career.title}`)}&body=${encodeURIComponent(`${career.summary}\n\n${url}`)}`) }}><Icon name="share" /> Share</button></div></section>
    <div className="detail-layout"><div className="detail-main"><section className="panel prose-card"><span className="eyebrow">Career snapshot</span><h2>{career.summary}</h2><p>{career.description}</p><div className="snapshot-grid"><div><small>Typical salary</small><strong>{career.salary}</strong></div><div><small>Projected growth</small><strong>{career.growth}</strong></div><div><small>Time to job-ready</small><strong>{career.timeToJobReady}</strong></div></div></section>
    <section className="panel"><SectionHead eyebrow="A day in the work" title={`What ${career.title}s do`} /><div className="responsibility-list">{career.responsibilities.length ? career.responsibilities.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><p><strong>{item}</strong></p></div>) : <p>No responsibilities have been added yet.</p>}</div></section>
    <section className="panel"><SectionHead eyebrow="Related paths" title="Careers you could also explore" />{related.length ? <div className="career-grid">{related.map(item => <button className="panel" key={item._id} onClick={() => navigate('career-detail', item.slug)}><h3>{item.title}</h3><p>{item.summary}</p><span className="button soft small">Explore <Icon name="arrow" size={14}/></span></button>)}</div> : <p>No related careers have been published yet.</p>}</section>
    <section className="panel"><SectionHead eyebrow="Related learning" title="Content for this career" />{(relatedContent.media.length || relatedContent.resources.length) ? <div className="resource-grid">{[...relatedContent.media, ...relatedContent.resources].slice(0, 6).map(item => <button className="resource-card panel" key={item._id} onClick={() => navigate(item.url ? 'media-detail' : 'document-preview', item._id)}><h3>{item.title}</h3><p>{item.description || item.tags?.join(' · ')}</p><span className="card-link">Open <Icon name="arrow"/></span></button>)}</div> : <p>No related learning content has been published yet.</p>}</section>
    <section className="panel"><SectionHead eyebrow="Skills & tools" title="What to build" /><div className="skill-row">{career.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><div className="skill-row">{career.toolsToLearn.map((tool) => <span key={tool}>{tool}</span>)}</div></section></div></div>
  </div>
}
