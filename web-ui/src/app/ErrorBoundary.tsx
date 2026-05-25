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
        <section className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-5 shadow-2xl shadow-black/45">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-50">Interface crashed</h2>
            <p className="text-sm leading-6 text-zinc-400">
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
