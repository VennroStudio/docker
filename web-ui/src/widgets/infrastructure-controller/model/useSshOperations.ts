import type { AppText, SshKeyForm, SshServer, SshServerForm } from "@/entities/infrastructure";
import type { SshTerminalAction } from "@/features/ssh-terminal";
import {
  openSshKeyGenerateTerminal,
  openSshServerAddTerminal,
  openSshServerRemoveTerminal,
  openSshServerUpdateTerminal,
} from "@/features/command-terminal";
import type { ConfirmDialogApi, RunWithTerminal } from "./operationTypes";

type UseSshOperationsConfig = {
  confirmDialog: ConfirmDialogApi;
  openSshTerminal: (server: SshServer, action: SshTerminalAction) => void;
  refreshSshServers: () => Promise<void> | void;
  runWithTerminal: RunWithTerminal;
  text: AppText;
};

export function useSshOperations({
  confirmDialog,
  openSshTerminal,
  refreshSshServers,
  runWithTerminal,
  text,
}: UseSshOperationsConfig) {
  const runSshServerAdd = (form: SshServerForm) => {
    runWithTerminal({
      key: "ssh:add",
      label: text.ssh.actions.addServer,
      onSettled: refreshSshServers,
      open: (handlers) => openSshServerAddTerminal(form, handlers),
      preview: `make ssh-add NAME=${form.name} HOST=${form.host} PORT=${form.port} USER=${form.user}`,
    });
  };

  const runSshServerUpdate = (server: SshServer, form: SshServerForm) => {
    runWithTerminal({
      key: `ssh:update:${server.id}`,
      label: text.ssh.actions.saveServer,
      onSettled: refreshSshServers,
      open: (handlers) => openSshServerUpdateTerminal(server.id, form, handlers),
      preview: `make ssh-update ID=${server.id}`,
    });
  };

  const runSshServerRemove = async (server: SshServer) => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.runCommand.body(`make ssh-remove ID=${server.id}`),
      cancelLabel: text.common.cancel,
      confirmLabel: text.confirm.runCommand.confirmLabel,
      title: text.ssh.actions.deleteServer,
      tone: "danger",
    });
    if (!confirmed) return;

    runWithTerminal({
      key: `ssh:remove:${server.id}`,
      label: text.ssh.actions.deleteServer,
      onSettled: refreshSshServers,
      open: (handlers) => openSshServerRemoveTerminal(server.id, handlers),
      preview: `make ssh-remove ID=${server.id}`,
    });
  };

  const runSshConnect = (server: SshServer) => {
    openSshTerminal(server, "connect");
  };

  const runSshKeyGenerate = (form: SshKeyForm) => {
    runWithTerminal({
      key: `ssh:key-generate:${form.serverId}`,
      label: text.ssh.actions.generateKey,
      onSettled: refreshSshServers,
      open: (handlers) => openSshKeyGenerateTerminal(form, handlers),
      preview: `make ssh-key-generate ID=${form.serverId}`,
    });
  };

  const runSshKeyPush = (server: SshServer) => {
    openSshTerminal(server, "key-push");
  };

  const runSshKeyRemove = async (server: SshServer) => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.runCommand.body(`make ssh-key-remove ID=${server.id}`),
      cancelLabel: text.common.cancel,
      confirmLabel: text.confirm.runCommand.confirmLabel,
      title: text.ssh.actions.keyRemove,
      tone: "danger",
    });
    if (!confirmed) return;

    openSshTerminal(server, "key-remove");
  };

  return {
    runSshConnect,
    runSshKeyGenerate,
    runSshKeyRemove,
    runSshKeyPush,
    runSshServerAdd,
    runSshServerRemove,
    runSshServerUpdate,
  };
}
