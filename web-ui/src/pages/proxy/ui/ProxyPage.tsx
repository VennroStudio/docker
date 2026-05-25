import { ServiceModuleAccordion } from "@/widgets/service-module";
import { ProxyPanel } from "@/features/manage-proxy";
import type { ContainerStateInfo } from "@/entities/infrastructure";
import type { ServiceLink } from "@/entities/infrastructure";
import type { AppText } from "@/entities/infrastructure";
import type { CommandAction, ProxyFormState, ShellAction, ViewConfig } from "@/entities/infrastructure";
import { ServicePageLayout } from "@/widgets/service-page-layout";

type ProxyPageProps = {
  networkActions: CommandAction[];
  nginxActions: CommandAction[];
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
  networkActions,
  nginxActions,
  onChange,
  onCreateProxy,
  onHostAdd,
  onHostRemove,
  onProxyDelete,
  onRunCommand,
  onShellOpen,
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
            text={text}
            value={value}
            onChange={onChange}
            onCreateProxy={onCreateProxy}
            onHostAdd={onHostAdd}
            onHostRemove={onHostRemove}
            onProxyDelete={onProxyDelete}
          />

          <ServiceModuleAccordion
            actions={nginxActions}
            eyebrow={text.panels.npm.nginxEyebrow}
            link={shellAction ? serviceLinks[shellAction.container] : undefined}
            shell={shellAction}
            status={shellAction ? statusByContainer[shellAction.container] : undefined}
            statusLabel={text.mariadbInstances.statusLabel}
            title={text.panels.npm.nginxTitle}
            details={moduleDetails(serviceLinks, shellAction?.container, text)}
            onRun={onRunCommand}
            onShellOpen={onShellOpen}
          />
        </section>

        <ServiceModuleAccordion
          actions={networkActions}
          eyebrow={text.panels.npm.networkEyebrow}
          defaultOpen
          title={text.panels.npm.networkTitle}
          details={[{ label: "Network", value: "proxy" }]}
          onRun={onRunCommand}
        />
      </div>
    </ServicePageLayout>
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
