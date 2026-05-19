import type { ReactNode } from "react";
import { views } from "../../shared/config/views";
import type { AppText, Language } from "../../shared/i18n";
import type { ViewId } from "../../shared/types/commands";
import { RailNav } from "./RailNav";

type AppShellProps = {
  activeView: ViewId;
  children: ReactNode;
  language: Language;
  text: AppText;
  onSelectView: (view: ViewId) => void;
  onToggleLanguage: () => void;
};

export function AppShell({ activeView, children, language, onSelectView, onToggleLanguage, text }: AppShellProps) {
  return (
    <main className="app-shell">
      <RailNav
        activeView={activeView}
        language={language}
        text={text}
        views={views}
        onSelectView={onSelectView}
        onToggleLanguage={onToggleLanguage}
      />
      {children}
    </main>
  );
}
