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
import { openPostStream, openStream, sendJsonRequest, streamUrl, type StreamHandlers } from "./streamClient";

export function streamCommand(command: CommandId, handlers: StreamHandlers): () => void {
  return openStream(streamUrl("/api/stream/run", { command }), handlers);
}

export function streamHost(action: "add" | "remove", domain: string, handlers: StreamHandlers): () => void {
  return openStream(streamUrl("/api/stream/host", { action, domain }), handlers);
}

export function streamProxy(form: ProxyFormState, handlers: StreamHandlers): () => void {
  return openStream(
    streamUrl("/api/stream/proxy", {
      domain: form.domain,
      port: form.port,
      ssl: form.ssl,
      target: form.target,
    }),
    handlers,
  );
}

export function streamProxyDelete(domain: string, handlers: StreamHandlers): () => void {
  return openStream(streamUrl("/api/stream/proxy-delete", { domain }), handlers);
}

export function streamShell(container: string, handlers: StreamHandlers): () => void {
  return openStream(streamUrl("/api/stream/shell", { container }), handlers);
}

export function streamArchiveCreate(form: ArchiveCreateForm, handlers: StreamHandlers): () => void {
  return openPostStream("/api/stream/archive-create", { folder: form.folder, name: form.name }, handlers);
}

export function streamArchiveExtract(form: ArchiveExtractForm, handlers: StreamHandlers): () => void {
  return openPostStream("/api/stream/archive-extract", { dest: form.dest, name: form.name }, handlers);
}

export function streamArchiveDelete(name: string, handlers: StreamHandlers): () => void {
  return openPostStream("/api/stream/archive-delete", { name }, handlers);
}

export function streamSshServerAdd(form: SshServerForm, handlers: StreamHandlers): () => void {
  return openPostStream("/api/stream/ssh-add", form, handlers);
}

export function streamSshServerUpdate(id: number, form: SshServerForm, handlers: StreamHandlers): () => void {
  return openPostStream("/api/stream/ssh-update", { ...form, id }, handlers);
}

export function streamSshServerRemove(id: number, handlers: StreamHandlers): () => void {
  return openPostStream("/api/stream/ssh-remove", { id }, handlers);
}

export function streamSshConnect(id: number, handlers: StreamHandlers): () => void {
  return openPostStream("/api/stream/ssh-connect", { id }, handlers);
}

export function streamSshKeyGenerate(form: SshKeyForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/ssh-key-generate",
    { comment: form.comment, force: form.force, id: form.serverId, keyPath: form.keyPath },
    handlers,
  );
}

export function streamSshKeyPush(id: number, handlers: StreamHandlers): () => void {
  return openPostStream("/api/stream/ssh-key-push", { id }, handlers);
}

export function streamMariaDbInstanceCreate(form: MariaDbInstanceForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/mariadb-instance-add",
    {
      authMode: form.authMode,
      password: form.password,
      port: form.port,
      rootPassword: form.rootPassword,
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
): () => void {
  return openStream(streamUrl("/api/stream/mariadb-instance", { action, name }), handlers);
}

export function streamMariaDbImport(form: MariaDbImportForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/mariadb-import",
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
    },
    handlers,
  );
}

export function streamMariaDbExport(form: MariaDbExportForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/mariadb-export",
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
    },
    handlers,
  );
}

export function streamMariaDbDatabase(
  form: MariaDbDatabaseForm,
  action: "create" | "drop",
  handlers: StreamHandlers,
): () => void {
  return openPostStream(
    "/api/stream/mariadb-database",
    {
      action,
      container: form.container,
      database: form.database,
    },
    handlers,
  );
}

export function streamPostgresInstanceCreate(form: PostgresInstanceForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/postgres-instance-add",
    {
      database: form.database,
      password: form.password,
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
): () => void {
  return openStream(streamUrl("/api/stream/postgres-instance", { action, name }), handlers);
}

export function streamPostgresImport(form: PostgresImportForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/postgres-import",
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
    },
    handlers,
  );
}

export function streamPostgresExport(form: PostgresExportForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/postgres-export",
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
    },
    handlers,
  );
}

export function streamPostgresDatabase(
  form: PostgresDatabaseForm,
  action: "create" | "drop",
  handlers: StreamHandlers,
): () => void {
  return openPostStream(
    "/api/stream/postgres-database",
    {
      action,
      container: form.container,
      database: form.database,
    },
    handlers,
  );
}

export async function sendShellInput(sessionId: string, input: string): Promise<void> {
  await sendJsonRequest("/api/stream/shell/input", { input, sessionId });
}

export async function stopShellSession(sessionId: string): Promise<void> {
  await sendJsonRequest("/api/stream/shell/stop", { sessionId });
}
