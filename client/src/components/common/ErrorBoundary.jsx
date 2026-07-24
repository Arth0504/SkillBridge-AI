import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary Caught Exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white">
          <div className="max-w-md w-full p-8 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-2xl">
            <div className="p-4 rounded-full bg-rose-500/20 text-rose-400 inline-block mb-4">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold mb-2">Unexpected Application Error</h2>
            <p className="text-sm text-slate-400 mb-6">
              SkillBridge AI encountered an unhandled render exception.
            </p>
            <Button onClick={this.handleReload} variant="primary" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" /> Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
