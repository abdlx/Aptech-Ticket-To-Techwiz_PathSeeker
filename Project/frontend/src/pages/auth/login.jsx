import ConnectedAuthPage from '../../components/auth/ConnectedAuthPage'

export default function LoginPage({ navigate }) {
  return <ConnectedAuthPage navigate={navigate} mode="login" />
}
