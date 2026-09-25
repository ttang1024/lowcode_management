/**
 * @module crash-provider
 * @description Error boundary that renders a fallback when a subtree throws.
 */
import React from 'react';
import Exception from '../exception';

export interface CrashProviderProps {
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onError?: (error: Error, info: any) => void;
  children?: React.ReactNode;
}

interface CrashState {
  error: Error | null;
}

export default class CrashProvider extends React.Component<CrashProviderProps, CrashState> {
  state: CrashState = { error: null };

  static getDerivedStateFromError(error: Error): CrashState {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    this.props.onError?.(error, info);
  }

  render() {
    const { error } = this.state;
    if (error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return <>{(fallback as any)(error)}</>;
      if (fallback) return <>{fallback}</>;
      return <Exception status="500" title="Something went wrong" subTitle={error.message} />;
    }
    return <>{this.props.children}</>;
  }
}
