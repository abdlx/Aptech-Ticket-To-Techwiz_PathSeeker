import Icon from '../../components/Icon'
import { Brand } from '../../components/AppShell'

export default function ForbiddenPage({ navigate }) {
  return <div className="welcome-page"><header className="public-header"><Brand /></header><main className="page-stack" style={{ padding: 48 }}><section className="panel"><span className="eyebrow">403 · Access denied</span><h1>You do not have permission to open this workspace.</h1><p>Your current account role does not have administrator access.</p><button className="button primary" onClick={() => navigate('dashboard')}>Back to dashboard <Icon name="arrow" /></button></section></main></div>
}
