export default function UserCell({ value }) {
  const [initials,name,detail] = value.split('|')
  return <div className="table-user"><span className="avatar small">{initials}</span><p><strong>{name}</strong><small>{detail}</small></p></div>
}
