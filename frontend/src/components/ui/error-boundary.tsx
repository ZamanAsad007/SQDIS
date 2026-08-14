import React from 'react'
import { ErrorDisplay } from './error-display'

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode)
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo)
  }

  resetBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.resetBoundary)
      }

      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[200px] p-6 flex items-center justify-center">
          <ErrorDisplay
            error={this.state.error}
            resetErrorBoundary={this.resetBoundary}
            title="Something went wrong"
          />
        </div>
      )
    }

    return this.props.children
  }
}
