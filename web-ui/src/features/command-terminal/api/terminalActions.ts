import type {
  ArchiveCreateForm,
  ArchiveExtractForm,
  CommandId,
  MariaDbDatabaseForm,
  MariaDbExportForm,
  MariaDbImportForm,
  MariaDbInstanceAction,
  MariaDbInstanceForm,
  PostgresDatabaseForm,
  PostgresExportForm,
  PostgresImportForm,
  PostgresInstanceAction,
  PostgresInstanceForm,
  ProjectAction,
  ProjectForm,
  ProxyFormState,
  SshKeyForm,
  SshServerForm,
} from "@/entities/infrastructure";
import { openTerminal, type TerminalHandlers, type TerminalSession } from "./terminalClient";

export function openCommandTerminal(command: CommandId, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ command, type: "command" }, handlers);
}

export function openHostTerminal(
  action: "add" | "remove",
  domain: string,
  handlers: TerminalHandlers,
): TerminalSession {
  return openTerminal({ action, domain, type: "host" }, handlers);
}

export function openProxyTerminal(form: ProxyFormState, handlers: TerminalHandlers): TerminalSession {
  return openTerminal(
    {
      domain: form.domain,
      port: form.port,
      ssl: form.ssl,
      target: form.target,
      type: "proxy",
    },
    handlers,
  );
}

export function openProxyDeleteTerminal(domain: string, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ domain, type: "proxy-delete" }, handlers);
}

export function openShellTerminal(container: string, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ container, type: "shell" }, handlers);
}

export function openProjectCreateTerminal(form: ProjectForm, handlers: TerminalHandlers): TerminalSession {
  return openTerminal(projectPayload(form, "project-create"), handlers);
}

export function openProjectUpdateTerminal(form: ProjectForm, handlers: TerminalHandlers): TerminalSession {
  return openTerminal(projectPayload(form, "project-update"), handlers);
}

export function openProjectRemoveTerminal(name: string, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ name, type: "project-remove" }, handlers);
}

export function openProjectActionTerminal(
  name: string,
  action: ProjectAction,
  handlers: TerminalHandlers,
): TerminalSession {
  return openTerminal({ action, name, type: "project-action" }, handlers);
}

export function openProjectShellTerminal(name: string, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ name, type: "project-shell" }, handlers);
}

export function openArchiveCreateTerminal(form: ArchiveCreateForm, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ folder: form.folder, name: form.name, type: "archive-create" }, handlers);
}

export function openArchiveExtractTerminal(form: ArchiveExtractForm, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ dest: form.dest, name: form.name, type: "archive-extract" }, handlers);
}

export function openArchiveDeleteTerminal(name: string, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ name, type: "archive-delete" }, handlers);
}

export function openSshServerAddTerminal(form: SshServerForm, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ ...form, type: "ssh-add" }, handlers);
}

export function openSshServerUpdateTerminal(
  id: number,
  form: SshServerForm,
  handlers: TerminalHandlers,
): TerminalSession {
  return openTerminal({ ...form, id, type: "ssh-update" }, handlers);
}

export function openSshServerRemoveTerminal(id: number, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ id, type: "ssh-remove" }, handlers);
}

export function openSshKeyGenerateTerminal(form: SshKeyForm, handlers: TerminalHandlers): TerminalSession {
  return openTerminal(
    { comment: form.comment, force: form.force, id: form.serverId, keyPath: form.keyPath, type: "ssh-key-generate" },
    handlers,
  );
}

export function openSshCommandAddTerminal(
  serverId: number,
  command: string,
  handlers: TerminalHandlers,
): TerminalSession {
  return openTerminal({ command, serverId, type: "ssh-command-add" }, handlers);
}

export function openSshCommandUpdateTerminal(id: number, command: string, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ command, id, type: "ssh-command-update" }, handlers);
}

export function openSshCommandRemoveTerminal(id: number, handlers: TerminalHandlers): TerminalSession {
  return openTerminal({ id, type: "ssh-command-remove" }, handlers);
}

export function openMariaDbInstanceCreateTerminal(
  form: MariaDbInstanceForm,
  handlers: TerminalHandlers,
): TerminalSession {
  return openTerminal(
    {
      authMode: form.authMode,
      password: form.password,
      port: form.port,
      rootPassword: form.rootPassword,
      type: "mariadb-instance-add",
      user: form.user,
      version: form.version,
    },
    handlers,
  );
}

export function openMariaDbInstanceActionTerminal(
  name: string,
  action: MariaDbInstanceAction,
  handlers: TerminalHandlers,
): TerminalSession {
  return openTerminal({ action, name, type: "mariadb-instance" }, handlers);
}

export function openMariaDbImportTerminal(form: MariaDbImportForm, handlers: TerminalHandlers): TerminalSession {
  return openTerminal(
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
      type: "mariadb-import",
    },
    handlers,
  );
}

export function openMariaDbExportTerminal(form: MariaDbExportForm, handlers: TerminalHandlers): TerminalSession {
  return openTerminal(
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
      type: "mariadb-export",
    },
    handlers,
  );
}

export function openMariaDbDatabaseTerminal(
  form: MariaDbDatabaseForm,
  action: "create" | "drop",
  handlers: TerminalHandlers,
): TerminalSession {
  return openTerminal(
    {
      action,
      container: form.container,
      database: form.database,
      type: "mariadb-database",
    },
    handlers,
  );
}

export function openPostgresInstanceCreateTerminal(
  form: PostgresInstanceForm,
  handlers: TerminalHandlers,
): TerminalSession {
  return openTerminal(
    {
      database: form.database,
      password: form.password,
      type: "postgres-instance-add",
      user: form.user,
      version: form.version,
    },
    handlers,
  );
}

export function openPostgresInstanceActionTerminal(
  name: string,
  action: PostgresInstanceAction,
  handlers: TerminalHandlers,
): TerminalSession {
  return openTerminal({ action, name, type: "postgres-instance" }, handlers);
}

export function openPostgresImportTerminal(form: PostgresImportForm, handlers: TerminalHandlers): TerminalSession {
  return openTerminal(
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
      type: "postgres-import",
    },
    handlers,
  );
}

export function openPostgresExportTerminal(form: PostgresExportForm, handlers: TerminalHandlers): TerminalSession {
  return openTerminal(
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
      type: "postgres-export",
    },
    handlers,
  );
}

export function openPostgresDatabaseTerminal(
  form: PostgresDatabaseForm,
  action: "create" | "drop",
  handlers: TerminalHandlers,
): TerminalSession {
  return openTerminal(
    {
      action,
      container: form.container,
      database: form.database,
      type: "postgres-database",
    },
    handlers,
  );
}

function projectPayload(form: ProjectForm, type: "project-create" | "project-update") {
  return {
    documentRoot: form.documentRoot,
    enableNode: form.enableNode,
    name: form.name,
    nodePackageManager: form.enableNode ? form.nodePackageManager : "",
    nodeVersion: form.enableNode ? form.nodeVersion : "",
    phpExtensions: form.phpExtensions,
    phpPreset: form.phpPreset,
    phpVersion: form.phpVersion,
    type,
    removeNode: form.webStack === "node" || form.enableNode ? "" : "1",
    webCommand: form.webStack === "node" ? form.webCommand : "",
    webPort: form.webPort,
    webStack: form.webStack,
  };
}
