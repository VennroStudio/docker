import type { AppText, Language } from "@/entities/infrastructure";
import type { ViewConfig, ViewId } from "@/entities/infrastructure";

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
      className="sticky top-0 z-20 flex h-screen flex-col items-center gap-4 border-r border-zinc-800/90 bg-zinc-950/88 px-3 py-4 backdrop-blur max-[760px]:h-auto max-[760px]:flex-row max-[760px]:overflow-x-auto max-[760px]:border-b max-[760px]:border-r-0"
      aria-label="Primary"
    >
      <button
        className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-teal-300/35 bg-teal-400/12 text-xs font-black text-teal-100"
        type="button"
        aria-label={text.views.home}
        onClick={() => onSelectView("home")}
      >
        INF
      </button>

      <div className="flex flex-1 flex-col gap-2 max-[760px]:flex-row">
        {views.map((view) => {
          const Icon = view.icon;
          const active = activeView === view.id;

          return (
            <button
              key={view.id}
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg border text-[10px] font-bold transition outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60 ${
                active
                  ? "border-teal-300/55 bg-teal-400/14 text-teal-100"
                  : "border-transparent text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200"
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
        className="h-10 w-12 shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold text-zinc-300 transition hover:border-zinc-600 hover:text-zinc-50"
        type="button"
        aria-label="Switch language"
        onClick={onToggleLanguage}
      >
        {language.toUpperCase()}
      </button>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-zinc-800 bg-zinc-900 text-sm font-bold text-zinc-300">
        V
      </div>
    </nav>
  );
}
