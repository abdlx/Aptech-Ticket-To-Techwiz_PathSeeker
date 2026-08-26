import Icon from '../../components/Icon'
import PageTitle from '../../components/common/PageTitle'
import { useEffect, useState } from 'react'
import { apiRequest, endpoints } from '../../services/pathseekerApi'

export default function NotificationsPage({ navigate }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try { const { data } = await apiRequest(endpoints.notifications); setItems(data.notifications || []) }
    catch (err) { setError(err.message || 'Could not load notifications.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const mark = async (item) => {
    try {
      if (!item.read) {
        await apiRequest(`${endpoints.notifications}/${item._id}/read`, { method: 'PATCH' })
        setItems(current => current.map(entry => entry._id === item._id ? { ...entry, read: true } : entry))
      }
      if (item.targetScreen) navigate(item.targetScreen, item.targetId)
    } catch (err) { setError(err.message || 'Could not open notification.') }
  }

  const markAll = async () => {
    try { await apiRequest(`${endpoints.notifications}/read-all`, { method: 'PATCH' }); setItems(current => current.map(item => ({ ...item, read: true }))) }
    catch (err) { setError(err.message || 'Could not mark notifications as read.') }
  }

  return <div className="page-stack"><PageTitle eyebrow="Inbox" title="Notifications" copy="Persistent account and product updates." actions={<button className="button soft" onClick={markAll}><Icon name="check" /> Mark all read</button>} />{error && <div className="panel form-error" role="alert">{error}</div>}{loading ? <div className="panel">Loading notifications…</div> : <section className="notification-list panel">{items.map(item => <button key={item._id} className={!item.read ? 'unread' : ''} onClick={() => mark(item)}><span className="notification-kind"><Icon name={item.icon || 'bell'} /></span><span><strong>{item.title}</strong><p>{item.body}</p><small>{new Date(item.createdAt).toLocaleString()}</small></span>{!item.read && <i />}</button>)}{!items.length && <p>No notifications yet.</p>}</section>}</div>
}
