/**
 * components/common/ErrorBoundary.jsx
 *
 * Class component — required because React error boundaries must be class-based
 * (no hooks equivalent in React 18; React 19 adds useErrorBoundary).
 *
 * Catches any uncaught JavaScript errors in the child component tree and
 * renders a fallback UI instead of crashing the entire application.
 *
 * Critical for demos: an unhandled error in one component won't blank the screen.
 */
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError:     false,
      errorMessage: '',
    };
  }

  /**
   * Called during render when a child throws. Update state to show fallback.
   */
  static getDerivedStateFromError(error) {
    return {
      hasError:     true,
      errorMessage: error?.message || 'An unexpected error occurred.',
    };
  }

  /**
   * Called after render with error details. Use for error reporting services.
   */
  componentDidCatch(error, info) {
    // In production, send to Sentry / LogRocket:
    // Sentry.captureException(error, { extra: info });
    console.error('ErrorBoundary caught an error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h2 style={styles.title}>Oops! Something went wrong.</h2>
            <p style={styles.message}>{this.state.errorMessage}</p>
            <button style={styles.button} onClick={this.handleReset}>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline styles so this component is self-contained with no external CSS dependency.
const styles = {
  container: {
    display:        'flex',
    justifyContent: 'center',
    alignItems:     'center',
    minHeight:      '60vh',
  },
  card: {
    background:   '#16213e',
    borderRadius: '8px',
    padding:      '2rem',
    maxWidth:     '480px',
    textAlign:    'center',
    boxShadow:    '0 4px 6px rgba(0,0,0,0.3)',
  },
  title: {
    color:        '#e74c3c',
    marginBottom: '1rem',
    fontSize:     '1.4rem',
  },
  message: {
    color:        '#a0a0a0',
    marginBottom: '1.5rem',
    fontSize:     '0.95rem',
  },
  button: {
    padding:         '0.6rem 1.4rem',
    backgroundColor: '#646cff',
    color:           '#fff',
    border:          'none',
    borderRadius:    '6px',
    cursor:          'pointer',
    fontSize:        '0.95rem',
  },
};

export default ErrorBoundary;
