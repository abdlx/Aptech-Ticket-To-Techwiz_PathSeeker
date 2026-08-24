import Icon from '../../components/Icon'
import AuthFrame from '../../components/auth/AuthFrame'
import { useState } from 'react'

export default function ForgotPasswordPage({ navigate }) {
  const [sent, setSent] = useState(false)
  return <AuthFrame navigate={navigate} eyebrow="Account recovery" title={sent ? 'Check your inbox' : 'Reset your password'} copy={sent ? 'We sent a secure reset link to alex@example.com. It expires in 20 minutes.' : 'Enter the email connected to your Career Passport and we’ll send a secure reset link.'}>
    {sent ? <div className="flow-success"><span><Icon name="check" /></span><button className="button primary full" onClick={() => navigate('reset-password')}>Open reset preview <Icon name="arrow" /></button><button className="text-button" onClick={() => setSent(false)}>Use another email</button></div> : <form onSubmit={(event) => { event.preventDefault(); setSent(true) }}><label>Email address<div className="input-wrap"><Icon name="message" /><input required type="email" defaultValue="alex@example.com" /></div></label><button className="button primary full" type="submit">Send reset link <Icon name="arrow" /></button><button className="text-button" type="button" onClick={() => navigate('login')}>Back to log in</button></form>}
  </AuthFrame>
}
