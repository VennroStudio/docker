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
  ProxyFormState,
  SshKeyForm,
  SshServerForm,
} from "@/entities/infrastructure";
import { openTerminal, type StreamHandlers, type TerminalSession } from "./terminalClient";

export function streamCommand(command: CommandId, handlers: StreamHandlers): TerminalSession {
  return openTerminal({ command, type: "command" }, handlers);
}

export function streamHost(action: "add" | "remove", domain: string, handlers: StreamHandlers): TerminalSession {
  return openTerminal({ action, domain, type: "host" }, handlers);
}

export function streamProxy(form: ProxyFormState, handlers: StreamHandlers): TerminalSession {
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

export function streamProxyDelete(domain: string, handlers: StreamHandlers): TerminalSession {
  return openTerminal({ domain, type: "proxy-delete" }, handlers);
}

export function streamShell(container: string, handlers: StreamHandlers): TerminalSession {
  return openTerminal({ container, type: "shell" }, handlers);
}

export function streamArchiveCreate(form: ArchiveCreateForm, handlers: StreamHandlers): TerminalSession {
  return openTerminal({ folder: form.folder, name: form.name, type: "archive-create" }, handlers);
}

export function streamArchiveExtract(form: ArchiveExtractForm, handlers: StreamHandlers): TerminalSession {
  return openTerminal({ dest: form.dest, name: form.name, type: "archive-extract" }, handlers);
}

export function streamArchiveDelete(name: string, handlers: StreamHandlers): TerminalSession {
  return openTerminal({ name, type: "archive-delete" }, handlers);
}

export function streamSshServerAdd(form: SshServerForm, handlers: StreamHandlers): TerminalSession {
  return openTerminal({ ...form, type: "ssh-add" }, handlers);
}

export function streamSshServerUpdate(id: number, form: SshServerForm, handlers: StreamHandlers): TerminalSession {
  return openTerminal({ ...form, id, type: "ssh-update" }, handlers);
}

export function streamSshServerRemove(id: number, handlers: StreamHandlers): TerminalSession {
  return openTerminal({ id, type: "ssh-remove" }, handlers);
}

export function streamSshKeyGenerate(form: SshKeyForm, handlers: StreamHandlers): TerminalSession {
  return openTerminal(
    { comment: form.comment, force: form.force, id: form.serverId, keyPath: form.keyPath, type: "ssh-key-generate" },
    handlers,
  );
}

export function streamMariaDbInstanceCreate(form: MariaDbInstanceForm, handlers: StreamHandlers): TerminalSession {
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

export function streamMariaDbInstanceAction(
  name: string,
  action: MariaDbInstanceAction,
  handlers: StreamHandlers,
): TerminalSession {
  return openTerminal({ action, name, type: "mariadb-instance" }, handlers);
}

export function streamMariaDbImport(form: MariaDbImportForm, handlers: StreamHandlers): TerminalSession {
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

export function streamMariaDbExport(form: MariaDbExportForm, handlers: StreamHandlers): TerminalSession {
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

export function streamMariaDbDatabase(
  form: MariaDbDatabaseForm,
  action: "create" | "drop",
  handlers: StreamHandlers,
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

export function streamPostgresInstanceCreate(form: PostgresInstanceForm, handlers: StreamHandlers): TerminalSession {
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

export function streamPostgresInstanceAction(
  name: string,
  action: PostgresInstanceAction,
  handlers: StreamHandlers,
): TerminalSession {
  return openTerminal({ action, name, type: "postgres-instance" }, handlers);
}

export function streamPostgresImport(form: PostgresImportForm, handlers: StreamHandlers): TerminalSession {
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

export function streamPostgresExport(form: PostgresExportForm, handlers: StreamHandlers): TerminalSession {
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

export function streamPostgresDatabase(
  form: PostgresDatabaseForm,
  action: "create" | "drop",
  handlers: StreamHandlers,
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
