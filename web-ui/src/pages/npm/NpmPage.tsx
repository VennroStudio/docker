import { ModuleAccordion } from "../../features/modules/ModuleAccordion";
import { ProxyPanel } from "../../features/proxy/ProxyPanel";
import type { ContainerStateInfo } from "../../shared/api/containers";
import type { ServiceLink } from "../../shared/api/links";
import type { AppText } from "../../shared/i18n";
import type { CommandAction, ProxyFormState, ShellAction, ViewConfig } from "../../shared/types/commands";
import { ServicePage } from "../service/ServicePage";

type NpmPageProps = {
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

export function NpmPage({
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
}: NpmPageProps) {
  const page = text.servicePages.proxy;
  const shellAction = shellActions[0];

  return (
    <ServicePage view={view} eyebrow={page.eyebrow} description={page.description}>
      <div className="npm-page">
        <section className="npm-management-grid">
          <ProxyPanel
            text={text}
            value={value}
            onChange={onChange}
            onCreateProxy={onCreateProxy}
            onHostAdd={onHostAdd}
            onHostRemove={onHostRemove}
            onProxyDelete={onProxyDelete}
          />

          <ModuleAccordion
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

        <ModuleAccordion
          actions={networkActions}
          eyebrow={text.panels.npm.networkEyebrow}
          defaultOpen
          title={text.panels.npm.networkTitle}
          details={[{ label: "Network", value: "proxy" }]}
          onRun={onRunCommand}
        />
      </div>
    </ServicePage>
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
