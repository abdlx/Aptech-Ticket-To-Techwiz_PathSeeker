import ConnectedAuthPage from '../../components/auth/ConnectedAuthPage'

export default function SignupPage({ navigate }) {
  return <ConnectedAuthPage navigate={navigate} mode="signup" />
}
