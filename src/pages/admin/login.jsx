import Icon from '../../components/Icon'
import AuthFrame from '../../components/auth/AuthFrame'

export default function AdminLoginPage({ navigate }) {
  return <AuthFrame navigate={navigate} admin eyebrow="PathSeeker administration" title="Welcome back, admin" copy="Sign in with your authorized workspace account.">
    <form onSubmit={(event) => { event.preventDefault(); navigate('admin') }}><label>Work email<div className="input-wrap"><Icon name="message" /><input required type="email" defaultValue="sarah@pathseeker.app" /></div></label><label>Password<div className="input-wrap"><Icon name="lock" /><input required type="password" defaultValue="PathSeeker!26" /></div></label><label className="check-row"><input type="checkbox" defaultChecked /> Keep me signed in on this device</label><button className="button primary full" type="submit">Enter admin workspace <Icon name="arrow" /></button><button className="text-button" type="button" onClick={() => navigate('forgot-password')}>Forgot admin password?</button></form>
  </AuthFrame>
}
