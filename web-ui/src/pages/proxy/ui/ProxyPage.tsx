import { ProxyPanel } from "@/features/manage-proxy";
import type { ContainerStateInfo } from "@/entities/infrastructure";
import type { ServiceLink } from "@/entities/infrastructure";
import type { AppText } from "@/entities/infrastructure";
import type { CommandAction, ProxyFormState, ShellAction, ViewConfig } from "@/entities/infrastructure";
import { ServicePageLayout } from "@/widgets/service-page-layout";
import { ProxyRuntimeModules } from "./ProxyRuntimeModules";

type ProxyPageProps = {
  activeOperationKey?: null | string;
  networkActions: CommandAction[];
  nginxActions: CommandAction[];
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  shellActions: ShellAction[];
  serviceLinks: Record<string, ServiceLink>;
  statusByContainer: Record<string, ContainerStateInfo>;
  text: AppText;
  value: ProxyFormState;
  view: ViewConfig;
  onChange: (value: ProxyFormState) => void;
  onCreateProxy: () => void;
  onHostAdd: () => void;
  onHostRemove: () => void;
  onProxyDelete: () => void;
  onRunCommand: (action: CommandAction) => void;
  onShellOpen: (action: ShellAction) => void;
};

export function ProxyPage({
  activeOperationKey,
  networkActions,
  nginxActions,
  onChange,
  onCreateProxy,
  onHostAdd,
  onHostRemove,
  onProxyDelete,
  onRunCommand,
  onShellOpen,
  operationDisabled,
  operationDisabledTitle,
  serviceLinks,
  shellActions,
  statusByContainer,
  text,
  value,
  view,
}: ProxyPageProps) {
  const page = text.servicePages.proxy;
  const shellAction = shellActions[0];

  return (
    <ServicePageLayout view={view} eyebrow={page.eyebrow} description={page.description}>
      <div className="space-y-4">
        <section className="grid gap-4 min-[1500px]:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <ProxyPanel
            activeOperationKey={activeOperationKey}
            operationDisabled={operationDisabled}
            operationDisabledTitle={operationDisabledTitle}
            text={text}
            value={value}
            onChange={onChange}
            onCreateProxy={onCreateProxy}
            onHostAdd={onHostAdd}
            onHostRemove={onHostRemove}
            onProxyDelete={onProxyDelete}
          />

          <ProxyRuntimeModules
            networkActions={networkActions}
            nginxActions={nginxActions}
            activeOperationKey={activeOperationKey}
            operationDisabled={operationDisabled}
            operationDisabledTitle={operationDisabledTitle}
            serviceLinks={serviceLinks}
            shellAction={shellAction}
            statusByContainer={statusByContainer}
            text={text}
            onRunCommand={onRunCommand}
            onShellOpen={onShellOpen}
          />
        </section>
      </div>
    </ServicePageLayout>
  );
}
