import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "../shared/ui/Button";

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
      <main className="error-screen">
        <section className="confirm-dialog">
          <div className="dialog-copy">
            <h2>Interface crashed</h2>
            <p>The local UI hit an unexpected error. Reloading the interface usually restores the control panel.</p>
          </div>
          <div className="dialog-actions">
            <Button type="button" tone="primary" onClick={() => window.location.reload()}>
              Reload UI
            </Button>
          </div>
        </section>
      </main>
    );
  }
}
