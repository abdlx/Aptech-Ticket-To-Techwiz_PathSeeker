import Icon from '../../components/Icon'
import AuthFrame from '../../components/auth/AuthFrame'
import { useState } from 'react'

export default function ResetPasswordPage({ navigate }) {
  const [done, setDone] = useState(false)
  return <AuthFrame navigate={navigate} eyebrow="Create a new password" title={done ? 'Password updated' : 'Choose something secure'} copy={done ? 'Your password has been changed. You can now continue your journey.' : 'Use at least eight characters with a number and a special character.'}>
    {done ? <div className="flow-success"><span><Icon name="check" /></span><button className="button primary full" onClick={() => navigate('login')}>Continue to log in <Icon name="arrow" /></button></div> : <form onSubmit={(event) => { event.preventDefault(); setDone(true) }}><label>New password<div className="input-wrap"><Icon name="lock" /><input required type="password" placeholder="Enter new password" defaultValue="PathSeeker!27" /></div></label><label>Confirm password<div className="input-wrap"><Icon name="lock" /><input required type="password" placeholder="Confirm new password" defaultValue="PathSeeker!27" /></div></label><div className="password-meter"><span /><small>Strong password</small></div><button className="button primary full" type="submit">Update password <Icon name="check" /></button></form>}
  </AuthFrame>
}
