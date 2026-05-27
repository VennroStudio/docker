import type { ReactNode } from "react";
import { views } from "@/entities/infrastructure";
import type { AppText, Language } from "@/entities/infrastructure";
import type { ViewId } from "@/entities/infrastructure";
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
    <main className="grid min-h-screen grid-cols-[76px_minmax(0,1fr)] bg-transparent text-slate-950 max-[760px]:grid-cols-1">
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
