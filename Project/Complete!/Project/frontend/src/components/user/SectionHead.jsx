import Icon from '../Icon'

const SectionHead = ({ eyebrow, title, link, onLink }) => (
  <div className="section-head"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{link && <button onClick={onLink}>{link}<Icon name="arrow" size={16} /></button>}</div>
)

export default SectionHead
