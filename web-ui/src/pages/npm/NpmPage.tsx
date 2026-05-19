import { CommandPanel } from "../../features/commands/CommandPanel";
import { ServiceControlPanel } from "../../features/commands/ServiceControlPanel";
import { ProxyPanel } from "../../features/proxy/ProxyPanel";
import type { AppText } from "../../shared/i18n";
import type { CommandAction, ProxyFormState, ShellAction, ViewConfig } from "../../shared/types/commands";
import { ServicePage } from "../service/ServicePage";

type NpmPageProps = {
  networkActions: CommandAction[];
  nginxActions: CommandAction[];
  shellActions: ShellAction[];
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
  shellActions,
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

          <ServiceControlPanel
            actions={nginxActions}
            eyebrow={text.panels.npm.nginxEyebrow}
            shell={shellAction}
            title={text.panels.npm.nginxTitle}
            onRun={onRunCommand}
            onShellOpen={onShellOpen}
          />
        </section>

        <CommandPanel
          actions={networkActions}
          eyebrow={text.panels.npm.networkEyebrow}
          title={text.panels.npm.networkTitle}
          onRun={onRunCommand}
        />
      </div>
    </ServicePage>
  );
}
