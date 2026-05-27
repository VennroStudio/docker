import { Languages } from "lucide-react";
import type { AppText, Language } from "@/entities/infrastructure";
import type { ViewConfig, ViewId } from "@/entities/infrastructure";
import logoUrl from "../../../../logo.png";

type RailNavProps = {
  activeView: ViewId;
  language: Language;
  text: AppText;
  views: ViewConfig[];
  onSelectView: (view: ViewId) => void;
  onToggleLanguage: () => void;
};

export function RailNav({ activeView, language, onSelectView, onToggleLanguage, text, views }: RailNavProps) {
  return (
    <nav
      className="sticky top-0 z-20 flex h-screen flex-col items-center gap-4 border-r border-sky-100/90 bg-white/90 px-3 py-4 shadow-[8px_0_30px_rgba(14,165,233,0.12)] backdrop-blur max-[760px]:h-auto max-[760px]:flex-row max-[760px]:overflow-x-auto max-[760px]:border-b max-[760px]:border-r-0"
      aria-label="Primary"
    >
      <div className="flex flex-1 flex-col gap-2 max-[760px]:flex-row">
        {views.map((view) => {
          const Icon = view.icon;
          const active = activeView === view.id;

          return (
            <button
              key={view.id}
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border text-[10px] font-bold transition outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60 ${
                active
                  ? "border-teal-400/70 bg-teal-50 text-teal-700 shadow-[0_8px_18px_rgba(20,184,166,0.18),0_0_0_1px_rgba(168,85,247,0.10)]"
                  : "border-transparent text-slate-500 hover:border-sky-100 hover:bg-sky-50 hover:text-slate-900 hover:shadow-[0_8px_18px_rgba(14,165,233,0.10)]"
              }`}
              type="button"
              aria-label={text.views[view.id]}
              title={text.views[view.id]}
              onClick={() => onSelectView(view.id)}
            >
              <Icon size={18} strokeWidth={2.3} />
              <span className="mt-0.5">{view.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <button
        className="flex h-11 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-sky-100 bg-white text-[10px] font-bold text-slate-600 shadow-[0_8px_18px_rgba(14,165,233,0.12)] transition hover:border-teal-300 hover:text-teal-700"
        type="button"
        aria-label="Switch language"
        onClick={onToggleLanguage}
      >
        <Languages size={15} strokeWidth={2.3} />
        <span className="flex items-center gap-0.5 leading-none">
          <span className={language === "ru" ? "text-teal-700" : "text-slate-400"}>ru</span>
          <span className="text-slate-300">/</span>
          <span className={language === "en" ? "text-teal-700" : "text-slate-400"}>en</span>
        </span>
      </button>
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-fuchsia-100 bg-white p-1.5 shadow-[0_8px_20px_rgba(168,85,247,0.18),0_4px_14px_rgba(249,115,22,0.10)]">
        <img className="h-full w-full object-contain" src={logoUrl} alt="VS" />
      </div>
    </nav>
  );
}
