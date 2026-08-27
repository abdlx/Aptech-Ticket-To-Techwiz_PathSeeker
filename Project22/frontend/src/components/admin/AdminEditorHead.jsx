const Head = ({ eyebrow, title, copy, children }) => <div className="admin-page-head"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{children}</div>

export default Head
