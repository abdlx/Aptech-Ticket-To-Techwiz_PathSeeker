const PageTitle = ({ eyebrow, title, copy, actions }) => <section className="extended-head"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{actions && <div>{actions}</div>}</section>

export default PageTitle
