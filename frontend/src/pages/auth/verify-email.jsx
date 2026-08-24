import Icon from '../../components/Icon'
import AuthFrame from '../../components/auth/AuthFrame'
import { useState } from 'react'

export default function VerifyEmailPage({ navigate }) {
  const [code, setCode] = useState(['2', '8', '4', '6', '1', '9'])
  const [verified, setVerified] = useState(false)
  const updateDigit = (index, value) => setCode((digits) => digits.map((digit, i) => i === index ? value.slice(-1) : digit))
  return <AuthFrame navigate={navigate} eyebrow="Verify your email" title={verified ? 'Email verified' : 'Enter your six-digit code'} copy={verified ? 'Your account is secure and your Career Passport is ready to build.' : 'We sent a code to alex@example.com. The code expires in 09:42.'}>
    {verified ? <div className="flow-success"><span><Icon name="check" /></span><button className="button primary full" onClick={() => navigate('onboarding')}>Start onboarding <Icon name="arrow" /></button></div> : <form onSubmit={(event) => { event.preventDefault(); setVerified(true) }}><div className="otp-row">{code.map((digit, index) => <input key={index} aria-label={`Digit ${index + 1}`} inputMode="numeric" maxLength="1" value={digit} onChange={(event) => updateDigit(index, event.target.value)} />)}</div><button className="button primary full" type="submit">Verify email <Icon name="check" /></button><button className="text-button" type="button">Resend code</button></form>}
  </AuthFrame>
}
