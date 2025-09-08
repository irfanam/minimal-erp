import React from 'react'

interface State { hasError: boolean; error?: any }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(error: any) { return { hasError: true, error } }
  componentDidCatch(error: any, info: any) { console.error('ErrorBoundary', error, info) }
  reset = () => this.setState({ hasError: false, error: undefined })
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm text-red-600" role="alert" aria-live="assertive">
          <p className="font-semibold mb-2">Something went wrong.</p>
          <pre className="text-xs whitespace-pre-wrap bg-red-50 p-2 rounded border border-red-200 max-h-40 overflow-auto">{String(this.state.error)}</pre>
          <button onClick={this.reset} className="mt-3 px-3 py-1 text-xs rounded bg-red-600 text-white">Retry</button>
        </div>
      )
    }
    return this.props.children
  }
}
