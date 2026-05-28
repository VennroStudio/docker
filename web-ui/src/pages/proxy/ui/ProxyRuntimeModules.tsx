import { ServiceModuleAccordion } from "@/widgets/service-module";
import type { AppText, CommandAction, ContainerStateInfo, ServiceLink, ShellAction } from "@/entities/infrastructure";

type ProxyRuntimeModulesProps = {
  activeOperationKey?: null | string;
  nginxActions: CommandAction[];
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  serviceLinks: Record<string, ServiceLink>;
  shellAction?: ShellAction;
  statusByContainer: Record<string, ContainerStateInfo>;
  text: AppText;
  onRunCommand: (action: CommandAction) => void;
  onShellOpen: (action: ShellAction) => void;
};

export function ProxyRuntimeModules({
  activeOperationKey,
  nginxActions,
  onRunCommand,
  onShellOpen,
  operationDisabled,
  operationDisabledTitle,
  serviceLinks,
  shellAction,
  statusByContainer,
  text,
}: ProxyRuntimeModulesProps) {
  return (
    <div className="space-y-4">
      <ServiceModuleAccordion
        actions={nginxActions}
        activeOperationKey={activeOperationKey}
        eyebrow={text.panels.npm.nginxEyebrow}
        link={shellAction ? serviceLinks[shellAction.container] : undefined}
        operationDisabled={operationDisabled}
        operationDisabledTitle={operationDisabledTitle}
        shell={shellAction}
        status={shellAction ? statusByContainer[shellAction.container] : undefined}
        stateEyebrow
        statusLabel={text.mariadbInstances.statusLabel}
        title={text.panels.npm.nginxTitle}
        details={moduleDetails(serviceLinks, shellAction?.container, text)}
        onRun={onRunCommand}
        onShellOpen={onShellOpen}
      />
    </div>
  );
}

function linkDetail(links: Record<string, ServiceLink>, container: string | undefined, label: string) {
  if (!container) return undefined;

  const link = links[container];
  return link ? { href: link.url, label, value: link.url } : undefined;
}

function moduleDetails(links: Record<string, ServiceLink>, container: string | undefined, text: AppText) {
  const details: Array<{ href?: string; label: string; value?: string }> = [
    { label: text.mariadbInstances.containerLabel, value: container },
  ];
  const link = linkDetail(links, container, text.common.link);

  if (link) details.push(link);
  return details;
}
