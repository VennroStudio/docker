import type { ProxyFormState } from "@/entities/infrastructure";
import {
  hostPreview,
  proxyDeletePreview,
  proxyPreview,
  streamHost,
  streamProxy,
  streamProxyDelete,
} from "@/features/command-terminal";
import type { ConfirmDialogApi, OperationTextConfig, RunWithTerminal } from "./operationTypes";

type UseProxyOperationsConfig = OperationTextConfig & {
  confirmDialog: ConfirmDialogApi;
  proxyForm: ProxyFormState;
  refreshNginxStatus: () => Promise<void> | void;
  runWithTerminal: RunWithTerminal;
};

export function useProxyOperations({
  confirmDialog,
  proxyForm,
  refreshNginxStatus,
  runWithTerminal,
  text,
}: UseProxyOperationsConfig) {
  const runProxy = () => {
    runWithTerminal({
      key: "proxy:create",
      label: text.panels.proxy.createProxy,
      onSettled: refreshNginxStatus,
      open: (handlers) => streamProxy(proxyForm, handlers),
      preview: proxyPreview(proxyForm),
    });
  };

  const runProxyDelete = async () => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.deleteProxy.body(proxyForm.domain),
      cancelLabel: text.common.cancel,
      confirmLabel: text.confirm.deleteProxy.confirmLabel,
      title: text.confirm.deleteProxy.title,
      tone: "danger",
    });
    if (!confirmed) return;

    runWithTerminal({
      key: "proxy:delete",
      label: text.panels.proxy.deleteProxy,
      onSettled: refreshNginxStatus,
      open: (handlers) => streamProxyDelete(proxyForm.domain, handlers),
      preview: proxyDeletePreview(proxyForm.domain),
    });
  };

  const runHost = async (action: "add" | "remove") => {
    if (action === "remove") {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.deleteHost.body(proxyForm.domain),
        cancelLabel: text.common.cancel,
        confirmLabel: text.confirm.deleteHost.confirmLabel,
        title: text.confirm.deleteHost.title,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal({
      key: `host:${action}`,
      label: action === "add" ? text.panels.proxy.addHost : text.panels.proxy.removeHost,
      onSettled: refreshNginxStatus,
      open: (handlers) => streamHost(action, proxyForm.domain, handlers),
      preview: hostPreview(action, proxyForm.domain),
    });
  };

  return {
    runHost,
    runProxy,
    runProxyDelete,
  };
}
