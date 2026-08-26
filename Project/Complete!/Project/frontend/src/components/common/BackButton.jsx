import Icon from '../Icon'

const Back = ({ navigate, to, children }) => <button className="back-link" onClick={() => navigate(to)}><Icon name="arrowLeft" /> {children}</button>

export default Back
