import type { CommandAction, ShellAction, ViewConfig } from "@/entities/infrastructure";
import type { AppText } from "@/entities/infrastructure";
import { SettingsConfigForm, type useSettings } from "@/entities/settings";
import { ServiceModuleAccordion } from "@/widgets/service-module";
import { ServicePageLayout } from "@/widgets/service-page-layout";
import type { ServiceModuleDescriptor } from "../model/types";

type ServiceModulesPageProps = {
  activeOperationKey?: null | string;
  description: string;
  eyebrow: string;
  modules: ServiceModuleDescriptor[];
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  settingsState: ReturnType<typeof useSettings>;
  text: AppText;
  view: ViewConfig;
  onRun: (action: CommandAction) => void;
  onShellOpen: (action: ShellAction) => void;
};

export function ServiceModulesPage({
  activeOperationKey,
  description,
  eyebrow,
  modules,
  onRun,
  onShellOpen,
  operationDisabled,
  operationDisabledTitle,
  settingsState,
  text,
  view,
}: ServiceModulesPageProps) {
  return (
    <ServicePageLayout view={view} eyebrow={eyebrow} description={description}>
      <div className="space-y-4">
        {modules.map((module) => {
          const configSections = module.configSections || (module.configSection ? [module.configSection] : []);

          return (
            <ServiceModuleAccordion
              key={`${module.eyebrow}:${module.title}`}
              actions={module.actions}
              details={module.details}
              eyebrow={module.eyebrow}
              link={module.link}
              activeOperationKey={activeOperationKey}
              operationDisabled={operationDisabled}
              operationDisabledTitle={operationDisabledTitle}
              shell={module.shell}
              shellDisabled={module.shellDisabled}
              shellDisabledTitle={module.shellDisabledTitle}
              status={module.status}
              statusLabel={module.statusLabel}
              stateEyebrow={module.stateEyebrow}
              title={module.title}
              onRun={onRun}
              onShellOpen={onShellOpen}
            >
              {configSections.length > 0 ? (
                <div className="grid gap-4 border-t border-sky-100 pt-4">
                  {configSections.map((section) => (
                    <section
                      key={`${section.eyebrow || text.panels.npm.configEyebrow}:${section.title || text.panels.npm.configTitle}`}
                      className="rounded-lg border border-sky-100 bg-white/72 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.08)]"
                    >
                      <header className="mb-3">
                        <p className="text-xs font-semibold uppercase text-teal-700">
                          {section.eyebrow || text.panels.npm.configEyebrow}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-slate-950">
                          {section.title || text.panels.npm.configTitle}
                        </h3>
                      </header>
                      <SettingsConfigForm
                        copy={text.settings}
                        fields={section.fields}
                        generateEnvAfterSave={section.generateEnvAfterSave}
                        settingsState={settingsState}
                      />
                    </section>
                  ))}
                </div>
              ) : null}
            </ServiceModuleAccordion>
          );
        })}
      </div>
    </ServicePageLayout>
  );
}
