import Icon from '../Icon'

const CareerCard = ({ career, navigate, saved, toggleSaved, compact = false }) => (
  <article className={`career-card ${compact ? 'compact' : ''}`}>
    <div className="career-card-top"><span className={`career-icon ${career.tone}`}><Icon name={career.icon} /></span><button className={`save-button ${saved ? 'saved' : ''}`} onClick={() => toggleSaved?.(career.id)} aria-label="Save career"><Icon name="bookmark" size={18} /></button></div>
    <span className="match-pill"><Icon name="sparkles" size={13} /> {career.match == null ? 'Career profile' : `${career.match}% match`}</span>
    <h3>{career.title}</h3><p>{career.field}</p>
    {!compact && <div className="career-meta"><span><Icon name="briefcase" />{career.salary}</span><span><Icon name="trend" />{career.demand}</span></div>}
    <div className="skill-row">{career.skills.slice(0, compact ? 2 : 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
    <button className="card-link" onClick={() => navigate('career-detail', career.id)}>Explore career <Icon name="arrow" size={17} /></button>
  </article>
)

export default CareerCard
