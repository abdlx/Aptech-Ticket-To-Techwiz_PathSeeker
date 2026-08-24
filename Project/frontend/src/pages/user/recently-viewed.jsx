import Icon from '../../components/Icon'
import PageTitle from '../../components/common/PageTitle'
import { useState } from 'react'
import { frontendFixtures } from '../../services/pathseekerApi'

export default function RecentlyViewedPage({ navigate }) {
  const [filter, setFilter] = useState('All')
  const items = filter === 'All' ? frontendFixtures.recentItems : frontendFixtures.recentItems.filter((item) => item.type === filter)
  return <div className="page-stack"><PageTitle eyebrow="Pick up where you left off" title="Recently viewed" copy="Your recent careers, learning resources, documents, and stories in one place." /><div className="filter-chips recent-filters">{['All', 'Career', 'Video', 'Story', 'Document'].map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div><section className="recent-grid">{items.map((item) => <button className="panel" key={item._id} onClick={() => navigate(...item.target)}><span className={`career-icon ${item.tone}`}><Icon name={item.icon} /></span><span><small>{item.type}</small><strong>{item.title}</strong><p>{item.meta}</p></span><Icon name="arrow" /></button>)}</section><div className="privacy-note panel"><Icon name="clock" /><p><strong>History stays private</strong><small>You can clear individual items now; full history controls will connect to your account settings.</small></p><button>Clear history</button></div></div>
}
