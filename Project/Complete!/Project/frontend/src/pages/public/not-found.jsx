import Icon from '../../components/Icon'
import { Brand } from '../../components/AppShell'

export default function NotFoundPage({ navigate }) {
  return <div className="welcome-page"><header className="public-header"><Brand /></header><main className="page-stack" style={{ padding: 48 }}><section className="panel"><span className="eyebrow">404 · Path not found</span><h1>That PathSeeker page does not exist.</h1><p>The link may be outdated or the page may have moved.</p><button className="button primary" onClick={() => navigate('welcome')}>Back to PathSeeker <Icon name="arrow" /></button></section></main></div>
}
