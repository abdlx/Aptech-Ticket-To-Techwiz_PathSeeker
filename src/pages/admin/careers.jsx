import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import Status from '../../components/admin/Status'
import { careers } from '../../data'

export default function CareersAdmin() {
  return <div className="admin-stack"><PageHead eyebrow="Career Bank" title="Career profiles" description="Create and maintain salary, skill, demand, and roadmap information."><button className="button soft"><Icon name="download" /> Import CSV</button><button className="button primary"><Icon name="plus" /> New career profile</button></PageHead><section className="admin-filterbar panel"><div className="admin-search"><Icon name="search" /><input placeholder="Search career profiles" /></div><select><option>All industries</option></select><select><option>Any status</option></select><span className="filter-count">240 profiles</span></section><div className="career-admin-grid">{careers.map((career, i) => <article key={career.id} className="panel"><div><span className={`career-icon ${career.tone}`}><Icon name={career.icon} /></span><Status tone={i === 4 ? 'draft' : 'success'}>{i === 4 ? 'Draft' : 'Published'}</Status><button><Icon name="more" /></button></div><h3>{career.title}</h3><p>{career.field}</p><div><span><small>Views</small><strong>{(2841-i*213).toLocaleString()}</strong></span><span><small>Avg. match</small><strong>{career.match}%</strong></span><span><small>Updated</small><strong>{i+2}d ago</strong></span></div><button><Icon name="edit" /> Edit profile</button></article>)}</div></div>
}
