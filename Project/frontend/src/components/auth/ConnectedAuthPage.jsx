import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { authApi } from '../../services/authApi'
import { useAuth } from '../../providers/AuthProvider'
import Icon from '../Icon'
import { Brand } from '../AppShell'

const password = z.string().min(8, 'Use at least 8 characters.').regex(/[A-Z]/, 'Include an uppercase letter.').regex(/\d/, 'Include a number.').regex(/[^A-Za-z0-9]/, 'Include a special character.')
const loginSchema = z.object({ email: z.email('Enter a valid email address.'), password: z.string().min(1, 'Enter your password.') })
const signupSchema = loginSchema.extend({ name: z.string().trim().min(2, 'Enter your full name.').max(120), password, stage: z.enum(['student', 'graduate', 'professional']) })

export default function ConnectedAuthPage({ navigate: legacyNavigate, mode = 'signup' }) {
  const isLogin = mode === 'login'
  const routerNavigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: isLogin ? { email: '', password: '' } : { name: '', email: '', password: '', stage: 'student' },
  })
  const mutation = useMutation({
    mutationFn: (values) => isLogin ? authApi.login(values) : authApi.register(values),
    onSuccess: (payload) => {
      if (isLogin) {
        auth.setUser(payload.data.user)
        toast.success('Welcome back.')
        routerNavigate(location.state?.from?.pathname || '/app/dashboard', { replace: true })
      } else {
        toast.success('Account created. Enter the code sent to your email.')
        routerNavigate(`/verify-email?email=${encodeURIComponent(payload.data.user.email)}`, {
          replace: true,
          state: { verificationSentAt: Date.now() },
        })
      }
    },
  })

  return <div className="auth-page">
    <section className="auth-visual"><Brand /><div className="auth-message"><span className="eyebrow">Your career passport</span><h1>{isLogin ? 'Welcome back to your next chapter.' : <>Your future<br />starts with <em>you.</em></>}</h1><p>{isLogin ? 'Pick up where you left off. Your matches, notes, and next steps are ready.' : 'Create your account and let PathSeeker guide you to the right career path.'}</p></div><div className="auth-navi"><img src={`/assets/navi/${isLogin ? 'navi-pointing-left' : 'navi-greeting'}.png`} alt="Navi welcoming you" /></div></section>
    <section className="auth-form-side">
      <button className="auth-back" onClick={() => legacyNavigate('welcome')}><Icon name="arrowLeft" /> Back</button>
      <form className="auth-card" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <span className="mobile-brand"><Brand /></span><h2>{isLogin ? 'Welcome back' : <>Welcome to <em>PathSeeker</em></>}</h2><p>{isLogin ? 'Log in to continue your journey' : 'Sign up to discover what fits you best'}</p>
        {!isLogin && <label>Full name<div className="input-wrap"><Icon name="users" /><input autoComplete="name" {...register('name')} /></div>{errors.name && <span className="field-error">{errors.name.message}</span>}</label>}
        <label>Email address<div className="input-wrap"><Icon name="message" /><input type="email" autoComplete="email" {...register('email')} /></div>{errors.email && <span className="field-error">{errors.email.message}</span>}</label>
        <label>Password<div className="input-wrap"><Icon name="lock" /><input type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} {...register('password')} /></div>{errors.password && <span className="field-error">{errors.password.message}</span>}</label>
        {!isLogin && <label>Current stage<select {...register('stage')}><option value="student">Student</option><option value="graduate">Graduate</option><option value="professional">Professional</option></select></label>}
        {isLogin && <div className="remember-row"><span>Secure server session</span><button type="button" onClick={() => legacyNavigate('forgot-password')}>Forgot password?</button></div>}
        {mutation.error && <p className="form-error" role="alert">{mutation.error.message}</p>}
        <button className="button primary full" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'} <Icon name="arrow" /></button>
        <p className="auth-switch">{isLogin ? 'New to PathSeeker?' : 'Already have an account?'} <button type="button" onClick={() => legacyNavigate(isLogin ? 'signup' : 'login')}>{isLogin ? 'Create account' : 'Log in'}</button></p>
        {isLogin && <p className="auth-switch admin-entry">Managing PathSeeker? <button type="button" onClick={() => legacyNavigate('admin-login')}>Admin sign in</button></p>}
      </form>
    </section>
  </div>
}
