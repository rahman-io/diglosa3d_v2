import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Terjadi kesalahan tak terduga.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0f172a] p-6 text-white">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#1e293b] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-amber-300">Koneksi atau Sistem Terganggu</h2>
            <p className="mt-2 text-sm text-slate-300">
              Terjadi kendala saat memproses data permainan atau papan peringkat daring.
            </p>
            <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-rose-300">
              {this.state.errorMessage}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              Muat Ulang Permainan
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
