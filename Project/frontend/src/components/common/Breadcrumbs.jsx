import Icon from '../Icon'

export default function Breadcrumbs({ items = [], navigate }) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumbs" className="breadcrumbs-nav" style={{ marginBottom: '12px' }}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '12px',
          color: 'var(--muted, #667485)',
        }}
      >
        <li>
          <button
            onClick={() => navigate('dashboard')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'inherit',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Icon name="home" size={14} />
            <span>Home</span>
          </button>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li
              key={index}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Icon name="chevron" size={12} style={{ opacity: 0.6 }} />
              {isLast || !item.to ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{
                    color: isLast ? 'var(--ink, #172635)' : 'inherit',
                    fontWeight: isLast ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => (item.params ? navigate(item.to, ...item.params) : navigate(item.to))}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
