import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) return <main className="page-content"><section className="panel state-page" role="alert"><h1>PathSeeker hit a snag</h1><p>Your data is safe. Reload the page to try again.</p><button className="button primary" onClick={() => window.location.reload()}>Reload application</button></section></main>
    return this.props.children
  }
}
