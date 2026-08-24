import Icon from '../../components/Icon'
import SectionHead from '../../components/user/SectionHead'
import { useState } from 'react'
import { resources } from '../../data'

export default function ResourcesPage({ navigate }) {
  const [tab, setTab] = useState('All')
  const tabs = ['All', 'Courses', 'Videos', 'Podcasts', 'Documents']
  const filtered = tab === 'All' ? resources : resources.filter((item) => `${item.type}s` === tab || (tab === 'Documents' && ['Guide', 'Toolkit'].includes(item.type)))
  return (
    <div className="resources-page page-stack">
      <section className="page-intro resources-intro"><div><span className="eyebrow">Resource library</span><h1>Learn what moves you forward</h1><p>Practical, expert-led resources matched to your goals and saved careers.</p></div><div className="resource-search"><Icon name="search" /><input placeholder="Search the library" /></div></section>
      <div className="tab-row">{tabs.map((item) => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>
      <section className="featured-resource"><div className="feature-art"><span className="resource-type">Featured mini course</span><div className="feature-play"><Icon name="play" /></div><small>6 lessons · 42 min</small></div><div><span className="eyebrow">Recommended from your matches</span><h2>Think like a UX designer</h2><p>Learn the mindset behind human-centered design through a practical mini project. No previous design experience needed.</p><div className="teacher"><span>MC</span><p><strong>Maya Chen</strong><small>Senior Product Designer · Looma</small></p></div><button className="button primary" onClick={() => navigate('media-detail')}>Continue course <Icon name="arrow" /></button></div></section>
      <section><SectionHead eyebrow="Curated for your path" title={`${tab === 'All' ? 'Explore all resources' : tab}`} /><div className="resource-grid">{filtered.map((resource) => <article key={resource.title} className="resource-card"><div className={`resource-cover ${resource.tone}`}><Icon name={resource.icon} size={32} /><span>{resource.type}</span><button><Icon name="bookmark" /></button></div><div><span className="resource-type">{resource.type}</span><h3>{resource.title}</h3><p>{resource.meta}</p>{resource.progress > 0 ? <><div className="mini-progress"><span style={{ width: `${resource.progress}%` }} /></div><small>{resource.progress}% complete</small></> : <button className="card-link" onClick={() => navigate(['Guide', 'Toolkit'].includes(resource.type) ? 'document-preview' : 'media-detail')}>Open resource <Icon name="arrow" /></button>}</div></article>)}</div></section>
    </div>
  )
}
