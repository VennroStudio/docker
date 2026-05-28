import type { CommandAction, ShellAction, ViewConfig } from "@/entities/infrastructure";
import type { AppText } from "@/entities/infrastructure";
import type { useSettings } from "@/entities/settings";
import { SettingsConfigForm } from "@/features/manage-settings";
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
        {modules.map((module) => (
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
            status={module.status}
            statusLabel={module.statusLabel}
            stateEyebrow={module.stateEyebrow}
            title={module.title}
            onRun={onRun}
            onShellOpen={onShellOpen}
          >
            {module.configSection ? (
              <div className="border-t border-sky-100 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase text-slate-500">{text.panels.npm.configTitle}</p>
                <SettingsConfigForm
                  copy={text.settings}
                  fields={module.configSection.fields}
                  generateEnvAfterSave={module.configSection.generateEnvAfterSave}
                  settingsState={settingsState}
                />
              </div>
            ) : null}
          </ServiceModuleAccordion>
        ))}
      </div>
    </ServicePageLayout>
  );
}
