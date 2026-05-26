import { Globe2, Link2, Trash2, Unlink2 } from "lucide-react";
import type { AppText } from "@/entities/infrastructure";
import { Button } from "@/shared/ui";

type ProxyActionGridProps = {
  activeOperationKey?: null | string;
  copy: AppText["panels"]["proxy"];
  hostReady: boolean;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  proxyReady: boolean;
  onCreateProxy: () => void;
  onHostAdd: () => void;
  onHostRemove: () => void;
  onProxyDelete: () => void;
};

export function ProxyActionGrid({
  activeOperationKey,
  copy,
  hostReady,
  onCreateProxy,
  onHostAdd,
  onHostRemove,
  onProxyDelete,
  operationDisabled = false,
  operationDisabledTitle,
  proxyReady,
}: ProxyActionGridProps) {
  const actionTitle = (ready: boolean, operationKey: string, validationTitle: string) => {
    if (!ready) return validationTitle;
    if (operationDisabled && activeOperationKey !== operationKey) return operationDisabledTitle;
    return undefined;
  };
  const isLoading = (operationKey: string) => operationDisabled && activeOperationKey === operationKey;
  const isDisabled = (ready: boolean) => !ready || operationDisabled;

  return (
    <div className="mt-4 grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="w-full"
          tone="primary"
          icon={<Link2 size={17} />}
          disabled={isDisabled(proxyReady)}
          loading={isLoading("proxy:create")}
          title={actionTitle(proxyReady, "proxy:create", copy.validation.proxyDisabled)}
          onClick={onCreateProxy}
        >
          {copy.createProxy}
        </Button>
        <Button
          className="w-full"
          tone="danger"
          icon={<Unlink2 size={17} />}
          disabled={isDisabled(hostReady)}
          loading={isLoading("proxy:delete")}
          title={actionTitle(hostReady, "proxy:delete", copy.validation.hostDisabled)}
          onClick={onProxyDelete}
        >
          {copy.deleteProxy}
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="w-full"
          icon={<Globe2 size={17} />}
          disabled={isDisabled(hostReady)}
          loading={isLoading("host:add")}
          title={actionTitle(hostReady, "host:add", copy.validation.hostDisabled)}
          onClick={onHostAdd}
        >
          {copy.addHost}
        </Button>
        <Button
          className="w-full"
          tone="danger"
          icon={<Trash2 size={17} />}
          disabled={isDisabled(hostReady)}
          loading={isLoading("host:remove")}
          title={actionTitle(hostReady, "host:remove", copy.validation.hostDisabled)}
          onClick={onHostRemove}
        >
          {copy.removeHost}
        </Button>
      </div>
    </div>
  );
}
