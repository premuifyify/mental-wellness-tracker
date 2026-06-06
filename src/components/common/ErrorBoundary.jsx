import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'An unexpected error occurred.' };
  }

  componentDidCatch(error, info) {
    console.error('[ExamMind ErrorBoundary]', error, info);
  }

  handleReset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center">
        <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
          {this.state.message}
        </p>
        <button
          onClick={this.handleReset}
          className="
            px-4 py-2 rounded-xl text-sm font-medium
            bg-brand-600 hover:bg-brand-700 text-white
            transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
          "
        >
          Try again
        </button>
      </div>
    );
  }
}
