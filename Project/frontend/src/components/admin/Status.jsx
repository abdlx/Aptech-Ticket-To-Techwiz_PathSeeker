const Status = ({ children, tone = 'success' }) => <span className={`status ${tone}`}>{children}</span>

export default Status
