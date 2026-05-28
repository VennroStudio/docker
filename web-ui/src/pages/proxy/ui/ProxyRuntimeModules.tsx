import { ServiceModuleAccordion } from "@/widgets/service-module";
import type { AppText, CommandAction, ShellAction, useNginxStatus } from "@/entities/infrastructure";
import type { useSettings } from "@/entities/settings";
import { SettingsConfigAccordion, type SettingsConfigField } from "@/features/manage-settings";

const npmConfigFields: SettingsConfigField[] = [
  { autocomplete: "username", group: "proxy", label: "NPM email", name: "npmEmail" },
  { autocomplete: "current-password", group: "proxy", label: "NPM password", name: "npmPassword", type: "password" },
];

type ProxyRuntimeModulesProps = {
  activeOperationKey?: null | string;
  nginxActions: CommandAction[];
  nginxStatus: ReturnType<typeof useNginxStatus>;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  settingsState: ReturnType<typeof useSettings>;
  shellAction?: ShellAction;
  text: AppText;
  onRunCommand: (action: CommandAction) => void;
  onShellOpen: (action: ShellAction) => void;
};

export function ProxyRuntimeModules({
  activeOperationKey,
  nginxActions,
  nginxStatus,
  onRunCommand,
  onShellOpen,
  operationDisabled,
  operationDisabledTitle,
  settingsState,
  shellAction,
  text,
}: ProxyRuntimeModulesProps) {
  const status = nginxStatus.status;
  const container = status?.container || shellAction?.container;

  return (
    <div className="space-y-4">
      <ServiceModuleAccordion
        actions={nginxActions}
        activeOperationKey={activeOperationKey}
        eyebrow={text.panels.npm.nginxEyebrow}
        link={status?.url ? { label: "NPM", source: "local", url: status.url } : undefined}
        operationDisabled={operationDisabled}
        operationDisabledTitle={operationDisabledTitle}
        shell={shellAction}
        status={status ? { state: status.state, status: status.uptime } : undefined}
        stateEyebrow
        statusLabel={text.mariadbInstances.statusLabel}
        title={text.panels.npm.nginxTitle}
        details={moduleDetails(container, status?.url, text)}
        onRun={onRunCommand}
        onShellOpen={onShellOpen}
      />
      <SettingsConfigAccordion
        copy={text.settings}
        eyebrow={text.panels.npm.configEyebrow}
        fields={npmConfigFields}
        settingsState={settingsState}
        title={text.panels.npm.configTitle}
      />
    </div>
  );
}

function moduleDetails(container: string | undefined, url: string | undefined, text: AppText) {
  const details: Array<{ href?: string; label: string; value?: string }> = [
    { label: text.mariadbInstances.containerLabel, value: container },
  ];

  if (url) details.push({ href: url, label: text.common.link, value: url });
  return details;
}
