const PageHead = ({ eyebrow, title, description, children }) => <div className="admin-page-head"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{children}</div>

export default PageHead
