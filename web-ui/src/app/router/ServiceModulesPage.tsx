import type {
  CommandAction,
  ContainerStateInfo,
  ServiceLink,
  ShellAction,
  ViewConfig,
} from "@/entities/infrastructure";
import { ServiceModuleAccordion } from "@/widgets/service-module";
import { ServicePageLayout } from "@/widgets/service-page-layout";

export type ServiceModuleDescriptor = {
  actions: CommandAction[];
  details?: Array<{ href?: string; label: string; value?: string }>;
  eyebrow: string;
  link?: ServiceLink;
  shell?: ShellAction;
  status?: ContainerStateInfo;
  statusLabel: string;
  title: string;
};

type ServiceModulesPageProps = {
  description: string;
  eyebrow: string;
  modules: ServiceModuleDescriptor[];
  view: ViewConfig;
  onRun: (action: CommandAction) => void;
  onShellOpen: (action: ShellAction) => void;
};

export function ServiceModulesPage({
  description,
  eyebrow,
  modules,
  onRun,
  onShellOpen,
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
            shell={module.shell}
            status={module.status}
            statusLabel={module.statusLabel}
            title={module.title}
            onRun={onRun}
            onShellOpen={onShellOpen}
          />
        ))}
      </div>
    </ServicePageLayout>
  );
}
