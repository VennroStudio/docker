import type { AppText, SshKeyForm, SshServer, SshServerForm } from "@/entities/infrastructure";
import {
  streamSshConnect,
  streamSshKeyGenerate,
  streamSshKeyPush,
  streamSshKeyTest,
  streamSshServerAdd,
  streamSshServerRemove,
  streamSshServerUpdate,
} from "@/features/command-terminal";
import type { ConfirmDialogApi, RunWithTerminal } from "./operationTypes";

type UseSshOperationsConfig = {
  confirmDialog: ConfirmDialogApi;
  refreshSshServers: () => Promise<void> | void;
  runWithTerminal: RunWithTerminal;
  text: AppText;
};

export function useSshOperations({ confirmDialog, refreshSshServers, runWithTerminal, text }: UseSshOperationsConfig) {
  const runSshServerAdd = (form: SshServerForm) => {
    runWithTerminal({
      key: "ssh:add",
      label: text.ssh.actions.addServer,
      onSettled: refreshSshServers,
      open: (handlers) => streamSshServerAdd(form, handlers),
      preview: `make ssh-add NAME=${form.name} HOST=${form.host} PORT=${form.port} USER=${form.user}`,
    });
  };

  const runSshServerUpdate = (server: SshServer, form: SshServerForm) => {
    runWithTerminal({
      key: `ssh:update:${server.id}`,
      label: text.ssh.actions.saveServer,
      onSettled: refreshSshServers,
      open: (handlers) => streamSshServerUpdate(server.id, form, handlers),
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
      open: (handlers) => streamSshServerRemove(server.id, handlers),
      preview: `make ssh-remove ID=${server.id}`,
    });
  };

  const runSshConnect = (server: SshServer) => {
    runWithTerminal({
      key: `ssh:connect:${server.id}`,
      label: `${text.ssh.actions.terminal}: ${server.name}`,
      open: (handlers) => streamSshConnect(server.id, handlers),
      preview: `make ssh-connect ID=${server.id}`,
    });
  };

  const runSshKeyGenerate = (form: SshKeyForm) => {
    runWithTerminal({
      key: `ssh:key-generate:${form.serverId}`,
      label: text.ssh.actions.generateKey,
      onSettled: refreshSshServers,
      open: (handlers) => streamSshKeyGenerate(form, handlers),
      preview: `make ssh-key-generate ID=${form.serverId}`,
    });
  };

  const runSshKeyPush = (server: SshServer) => {
    runWithTerminal({
      key: `ssh:key-push:${server.id}`,
      label: text.ssh.actions.keyPush,
      open: (handlers) => streamSshKeyPush(server.id, handlers),
      preview: `make ssh-key-push ID=${server.id}`,
    });
  };

  const runSshKeyTest = (server: SshServer) => {
    runWithTerminal({
      key: `ssh:key-test:${server.id}`,
      label: text.ssh.actions.keyTest,
      open: (handlers) => streamSshKeyTest(server.id, handlers),
      preview: `make ssh-key-test ID=${server.id}`,
    });
  };

  return {
    runSshConnect,
    runSshKeyGenerate,
    runSshKeyPush,
    runSshKeyTest,
    runSshServerAdd,
    runSshServerRemove,
    runSshServerUpdate,
  };
}
