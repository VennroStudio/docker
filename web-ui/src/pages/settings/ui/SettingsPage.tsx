import type { AppText, ViewConfig } from "@/entities/infrastructure";
import type { useSettings } from "@/entities/settings";
import { SettingsForm } from "@/features/manage-settings";
import { ServicePageLayout } from "@/widgets/service-page-layout";

type SettingsPageProps = {
  settingsState: ReturnType<typeof useSettings>;
  text: AppText;
  view: ViewConfig;
};

export function SettingsPage({ settingsState, text, view }: SettingsPageProps) {
  return (
    <ServicePageLayout
      view={view}
      eyebrow={text.settings.eyebrow}
      title={text.settings.title}
      description={text.settings.description}
    >
      {settingsState.loading || !settingsState.settings ? (
        <section className="rounded-lg border border-sky-100/90 bg-white/76 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.12)]">
          <p className="text-sm font-semibold text-slate-500">{text.settings.loading}</p>
        </section>
      ) : (
        <SettingsForm
          copy={text.settings}
          exists={settingsState.exists}
          path={settingsState.path}
          saving={settingsState.saving}
          settings={settingsState.settings}
          onSave={settingsState.save}
        />
      )}
      {settingsState.error ? <p className="mt-3 text-sm font-semibold text-red-600">{settingsState.error}</p> : null}
    </ServicePageLayout>
  );
}
