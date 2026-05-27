import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/shared/ui";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center p-6">
        <section className="w-full max-w-md rounded-lg border border-sky-100 bg-white p-5 shadow-[0_24px_70px_rgba(14,165,233,0.16),0_12px_34px_rgba(168,85,247,0.12)] ring-1 ring-fuchsia-100/55">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-950">Interface crashed</h2>
            <p className="text-sm leading-6 text-slate-600">
              The local UI hit an unexpected error. Reloading the interface usually restores the control panel.
            </p>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="button" tone="primary" onClick={() => window.location.reload()}>
              Reload UI
            </Button>
          </div>
        </section>
      </main>
    );
  }
}
