import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class UploadErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("UploadErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="upload-error-fallback" className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="flex justify-center flex-col items-center">
            <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse mb-3" />
            <span className="text-sm font-bold text-white block">Media Uploader Error</span>
            <p className="text-xs text-gray-400 mt-1">
              An unexpected error occurred while loading or compressing images. This is typically due to namespace or type collisions.
            </p>
            {this.state.error && (
              <pre className="text-[10px] font-mono text-red-400 bg-black/40 p-2.5 rounded-lg mt-3 w-full text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold bg-red-500/25 hover:bg-red-500/40 text-white px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Reload Media Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
