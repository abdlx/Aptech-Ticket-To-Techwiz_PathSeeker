import { Component } from 'react'
import Icon from '../Icon'

export default class ErrorBoundary extends Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error) { console.error('PathSeeker UI error:', error) }
  render() {
    if (!this.state.hasError) return this.props.children
    return <main className="page-stack" style={{ padding: 40 }}><section className="panel"><span className="eyebrow"><Icon name="shield" /> Something went wrong</span><h1>We couldn't load this PathSeeker screen.</h1><p>Please refresh the page. Your saved server data is not affected.</p><button className="button primary" onClick={() => window.location.reload()}>Refresh PathSeeker <Icon name="refresh" /></button></section></main>
  }
}
