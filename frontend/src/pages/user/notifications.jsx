import Icon from '../../components/Icon'
import PageTitle from '../../components/common/PageTitle'
import { useState } from 'react'
import { frontendFixtures } from '../../services/pathseekerApi'

export default function NotificationsPage() {
  const [items, setItems] = useState(frontendFixtures.notifications)
  const [filter, setFilter] = useState('All')
  const shown = filter === 'Unread' ? items.filter((item) => !item.read) : items
  return <div className="page-stack"><PageTitle eyebrow="Inbox" title="Notifications" copy="Updates about your matches, learning, saved paths, and account." actions={<button className="button soft" onClick={() => setItems(items.map((item) => ({ ...item, read: true })))}><Icon name="check" /> Mark all read</button>} /><div className="tab-row"><button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All <span>{items.length}</span></button><button className={filter === 'Unread' ? 'active' : ''} onClick={() => setFilter('Unread')}>Unread <span>{items.filter((item) => !item.read).length}</span></button></div><section className="notification-list panel">{shown.map((item) => <button key={item._id} className={!item.read ? 'unread' : ''} onClick={() => setItems(items.map((entry) => entry._id === item._id ? { ...entry, read: true } : entry))}><span className="notification-kind"><Icon name={item.icon} /></span><span><strong>{item.title}</strong><p>{item.body}</p><small>{item.time}</small></span>{!item.read && <i />}</button>)}</section></div>
}
