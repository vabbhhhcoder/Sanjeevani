import { Component, ErrorInfo, ReactNode } from 'react';

interface S { hasError: boolean; message?: string }
export class ErrorBoundary extends Component<{ children: ReactNode; label?: string }, S> {
  state: S = { hasError: false };
  static getDerivedStateFromError(e: Error): S { return { hasError: true, message: e.message }; }
  componentDidCatch(e: Error, info: ErrorInfo) { console.error('[SANJEEVANI]', this.props.label, e, info.componentStack); }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="card p-6 text-center">
          <p className="font-serif italic text-trust-700 dark:text-trust-200">Something didn't load quite right — and that's okay.</p>
          <p className="text-xs text-slate-500 mt-2">{this.props.label ?? 'This section'} encountered an error. Your data is safe.</p>
          <button className="btn-primary mt-4" onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
