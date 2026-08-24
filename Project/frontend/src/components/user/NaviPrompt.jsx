import Icon from '../Icon'

const NaviPrompt = ({ pose = 'explaining', title, children, action, onAction }) => (
  <div className="navi-prompt">
    <div className="navi-prompt-avatar"><img src={`/assets/navi/navi-${pose}.png`} alt="Navi" /></div>
    <div><span className="eyebrow">Navi’s note</span><strong>{title}</strong><p>{children}</p></div>
    {action && <button className="button soft small" onClick={onAction}>{action}<Icon name="arrow" size={16} /></button>}
  </div>
)

export default NaviPrompt
