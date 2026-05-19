import type { AppText, Language } from "../../shared/i18n";
import type { ViewConfig, ViewId } from "../../shared/types/commands";

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
    <nav className="rail" aria-label="Primary">
      <button className="rail-logo" type="button" aria-label={text.views.home} onClick={() => onSelectView("home")}>
        INF
      </button>

      <div className="rail-nav">
        {views.map((view) => {
          const Icon = view.icon;

          return (
            <button
              key={view.id}
              className={`rail-item ${activeView === view.id ? "active" : ""}`.trim()}
              type="button"
              aria-label={text.views[view.id]}
              title={text.views[view.id]}
              onClick={() => onSelectView(view.id)}
            >
              <Icon size={18} strokeWidth={2.3} />
              <span>{view.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <button className="language-switch" type="button" aria-label="Switch language" onClick={onToggleLanguage}>
        {language.toUpperCase()}
      </button>
      <div className="rail-user">V</div>
    </nav>
  );
}
