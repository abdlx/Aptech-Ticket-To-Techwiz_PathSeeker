import Icon from '../Icon'
import Status from './Status'
import UserCell from './UserCell'

export default function AdminTable({ headings, rows }) {
  return <section className="admin-table panel"><table><thead><tr><th><input type="checkbox" /></th>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row,rowIndex) => <tr key={rowIndex}><td><input type="checkbox" /></td>{row.map((cell,i) => <td key={`${rowIndex}-${i}`}>{i===0 && cell.includes('|') ? <UserCell value={cell} /> : cell === 'Active' || cell === 'Published' || cell === 'Completed' ? <Status>{cell}</Status> : cell === 'Draft' || cell === 'Invited' || cell === 'Pending review' ? <Status tone="draft">{cell}</Status> : cell === 'Inactive' || cell === 'Needs edits' ? <Status tone="muted">{cell}</Status> : cell === 'Idea' ? <Status tone="idea">{cell}</Status> : cell}</td>)}</tr>)}</tbody></table><footer><span>Showing {rows.length} results</span><div><button disabled><Icon name="arrowLeft" /></button><button className="active">1</button><button>2</button><button>3</button><button><Icon name="arrow" /></button></div></footer></section>
}
