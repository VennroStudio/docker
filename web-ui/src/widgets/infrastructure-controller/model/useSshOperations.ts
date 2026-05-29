import type { AppText, SshKeyForm, SshQuickCommand, SshServer, SshServerForm } from "@/entities/infrastructure";
import type { SshTerminalAction } from "@/features/ssh-terminal";
import {
  openSshCommandAddTerminal,
  openSshCommandRemoveTerminal,
  openSshCommandUpdateTerminal,
  openSshKeyGenerateTerminal,
  openSshServerAddTerminal,
  openSshServerRemoveTerminal,
  openSshServerUpdateTerminal,
} from "@/features/command-terminal";
import type { ConfirmDialogApi, RunWithTerminal } from "./operationTypes";

type UseSshOperationsConfig = {
  confirmDialog: ConfirmDialogApi;
  insertSshCommand: (server: SshServer, command: string) => void;
  openSshTerminal: (server: SshServer, action: SshTerminalAction) => void;
  refreshSshServers: () => Promise<void> | void;
  runWithTerminal: RunWithTerminal;
  text: AppText;
};

export function useSshOperations({
  confirmDialog,
  insertSshCommand,
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

  const runSshCommandAdd = (server: SshServer, command: string) => {
    runWithTerminal({
      key: `ssh:command-add:${server.id}`,
      label: text.ssh.actions.addCommand,
      onSettled: refreshSshServers,
      open: (handlers) => openSshCommandAddTerminal(server.id, command, handlers),
      preview: `make ssh-command-add SERVER_ID=${server.id}`,
    });
  };

  const runSshCommandUpdate = (quickCommand: SshQuickCommand, command: string) => {
    runWithTerminal({
      key: `ssh:command-update:${quickCommand.id}`,
      label: text.ssh.actions.saveCommand,
      onSettled: refreshSshServers,
      open: (handlers) => openSshCommandUpdateTerminal(quickCommand.id, command, handlers),
      preview: `make ssh-command-update ID=${quickCommand.id}`,
    });
  };

  const runSshCommandRemove = async (quickCommand: SshQuickCommand) => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.runCommand.body(`make ssh-command-remove ID=${quickCommand.id}`),
      cancelLabel: text.common.cancel,
      confirmLabel: text.confirm.runCommand.confirmLabel,
      title: text.ssh.actions.deleteCommand,
      tone: "danger",
    });
    if (!confirmed) return;

    runWithTerminal({
      key: `ssh:command-remove:${quickCommand.id}`,
      label: text.ssh.actions.deleteCommand,
      onSettled: refreshSshServers,
      open: (handlers) => openSshCommandRemoveTerminal(quickCommand.id, handlers),
      preview: `make ssh-command-remove ID=${quickCommand.id}`,
    });
  };

  const runSshCommandInsert = (server: SshServer, command: string) => {
    insertSshCommand(server, command);
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
    runSshCommandAdd,
    runSshCommandInsert,
    runSshCommandRemove,
    runSshCommandUpdate,
    runSshKeyGenerate,
    runSshKeyRemove,
    runSshKeyPush,
    runSshServerAdd,
    runSshServerRemove,
    runSshServerUpdate,
  };
}
