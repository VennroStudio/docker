import { StrictMode, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "../ErrorBoundary";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>{children}</BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  );
}
