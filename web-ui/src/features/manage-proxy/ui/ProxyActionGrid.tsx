import { Globe2, Link2, Trash2, Unlink2 } from "lucide-react";
import type { AppText } from "@/entities/infrastructure";
import { Button } from "@/shared/ui";

type ProxyActionGridProps = {
  copy: AppText["panels"]["proxy"];
  hostReady: boolean;
  proxyReady: boolean;
  onCreateProxy: () => void;
  onHostAdd: () => void;
  onHostRemove: () => void;
  onProxyDelete: () => void;
};

export function ProxyActionGrid({
  copy,
  hostReady,
  onCreateProxy,
  onHostAdd,
  onHostRemove,
  onProxyDelete,
  proxyReady,
}: ProxyActionGridProps) {
  const hostTitle = hostReady ? undefined : copy.validation.hostDisabled;
  const proxyTitle = proxyReady ? undefined : copy.validation.proxyDisabled;

  return (
    <div className="mt-4 grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="w-full"
          tone="primary"
          icon={<Link2 size={17} />}
          disabled={!proxyReady}
          title={proxyTitle}
          onClick={onCreateProxy}
        >
          {copy.createProxy}
        </Button>
        <Button
          className="w-full"
          tone="danger"
          icon={<Unlink2 size={17} />}
          disabled={!hostReady}
          title={hostTitle}
          onClick={onProxyDelete}
        >
          {copy.deleteProxy}
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="w-full"
          icon={<Globe2 size={17} />}
          disabled={!hostReady}
          title={hostTitle}
          onClick={onHostAdd}
        >
          {copy.addHost}
        </Button>
        <Button
          className="w-full"
          tone="danger"
          icon={<Trash2 size={17} />}
          disabled={!hostReady}
          title={hostTitle}
          onClick={onHostRemove}
        >
          {copy.removeHost}
        </Button>
      </div>
    </div>
  );
}
