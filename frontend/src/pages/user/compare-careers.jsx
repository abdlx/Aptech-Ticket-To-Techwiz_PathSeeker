import Icon from '../../components/Icon'
import PageTitle from '../../components/common/PageTitle'
import { useState } from 'react'
import { careers } from '../../data'

export default function CompareCareersPage({ navigate }) {
  const [ids, setIds] = useState(['ux-designer', 'data-analyst', 'product-manager'])
  const selected = ids.map((id) => careers.find((career) => career.id === id)).filter(Boolean)
  const update = (index, id) => setIds(ids.map((value, i) => i === index ? id : value))
  const rows = [
    ['Match', (career) => `${career.match}%`], ['Typical salary', (career) => career.salary], ['Projected growth', (career) => career.growth], ['Demand', (career) => career.demand], ['Time to job-ready', (_, index) => ['6–12 months', '4–9 months', '8–14 months'][index]], ['Best-fit skill', (career) => career.skills[0]],
  ]
  return <div className="page-stack"><PageTitle eyebrow="Career comparison" title="See the tradeoffs clearly" copy="Compare the fit, opportunity, preparation, and day-to-day shape of your saved careers." actions={<button className="button soft"><Icon name="download" /> Export comparison</button>} /><section className="compare-table panel"><div className="compare-head"><span>Compare</span>{selected.map((career, index) => <div key={`${career.id}-${index}`}><span className={`career-icon ${career.tone}`}><Icon name={career.icon} /></span><select value={career.id} onChange={(event) => update(index, event.target.value)}>{careers.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select><button onClick={() => navigate('career-detail', career.id)}>View profile</button></div>)}</div>{rows.map(([label, value]) => <div className="compare-row" key={label}><strong>{label}</strong>{selected.map((career, index) => <span key={`${career.id}-${label}`}>{value(career, index)}</span>)}</div>)}<div className="compare-row skills"><strong>Core skills</strong>{selected.map((career) => <span key={`${career.id}-skills`}>{career.skills.slice(0, 3).map((skill) => <em key={skill}>{skill}</em>)}</span>)}</div></section><section className="comparison-note"><img src="/assets/navi/navi-explaining.png" alt="Navi explaining" /><div><span className="eyebrow">Navi’s take</span><h2>UX Designer is your closest overall fit</h2><p>Data Analyst offers faster growth, while Product Manager has the highest salary ceiling. Your strongest personal alignment remains UX because it combines empathy and creative problem-solving.</p></div></section></div>
}
