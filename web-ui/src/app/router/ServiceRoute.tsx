import type { InfrastructureController } from "../model/useInfrastructureController";
import { ServiceModulesPage } from "./ServiceModulesPage";
import { getServiceRouteModel } from "./serviceRouteModel";

type ServiceRouteProps = {
  controller: InfrastructureController;
};

export function ServiceRoute({ controller }: ServiceRouteProps) {
  const route = getServiceRouteModel(controller);
  if (!route) return null;

  return (
    <ServiceModulesPage
      activeOperationKey={controller.activeOperationKey}
      description={route.description}
      eyebrow={route.eyebrow}
      modules={route.modules}
      operationDisabled={controller.operationRunning}
      operationDisabledTitle={controller.operationBlockTitle}
      view={controller.activeConfig}
      onRun={controller.runCommand}
      onShellOpen={controller.runShell}
    />
  );
}
