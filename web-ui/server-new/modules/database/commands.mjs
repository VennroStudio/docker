export function mariaDbInstanceCreateCommand({ authMode, password, port, rootPassword, user, version }) {
  const args = [
    "mariadb-instance-add",
    `VERSION=${version}`,
    `DB_USER=${user}`,
    `PASSWORD=${password}`,
    `ROOT_PASSWORD=${rootPassword}`,
  ];

  if (port) args.push(`PORT=${port}`);
  if (authMode) args.push(`AUTH_MODE=${authMode}`);
  return ["make", args];
}

export function mariaDbInstanceActionCommand(name, action) {
  return ["make", [`mariadb-instance-${action}`, `NAME=${name}`]];
}

export function mariaDbImportCommand({ container, database, filePath }) {
  return ["make", ["mariadb-import", `CONTAINER=${container}`, `DATABASE=${database}`, `DUMP_FILE=${filePath}`]];
}

export function mariaDbExportCommand({ container, database, filePath }) {
  return ["make", ["mariadb-export", `CONTAINER=${container}`, `DATABASE=${database}`, `DUMP_FILE=${filePath}`]];
}

export function mariaDbDatabaseCommand({ action, container, database }) {
  return ["make", [`mariadb-db-${action}`, `CONTAINER=${container}`, `DATABASE=${database}`]];
}

export function mariaDbDatabaseListCommand({ container }) {
  return ["make", ["mariadb-db-list", `CONTAINER=${container}`]];
}

export function mariaDbDumpListCommand() {
  return ["make", ["mariadb-dump-list"]];
}

export function postgresInstanceCreateCommand({ database, password, port, user, version }) {
  const args = [
    "postgres-instance-add",
    `VERSION=${version}`,
    `DB_USER=${user}`,
    `PASSWORD=${password}`,
    `DATABASE=${database}`,
  ];

  if (port) args.push(`PORT=${port}`);
  return ["make", args];
}

export function postgresInstanceActionCommand(name, action) {
  return ["make", [`postgres-instance-${action}`, `NAME=${name}`]];
}

export function postgresImportCommand({ container, database, filePath }) {
  return ["make", ["postgres-import", `CONTAINER=${container}`, `POSTGRES_DB=${database}`, `DUMP_FILE=${filePath}`]];
}

export function postgresExportCommand({ container, database, filePath }) {
  return ["make", ["postgres-export", `CONTAINER=${container}`, `POSTGRES_DB=${database}`, `DUMP_FILE=${filePath}`]];
}

export function postgresDatabaseCommand({ action, container, database }) {
  return ["make", [`postgres-db-${action}`, `CONTAINER=${container}`, `DATABASE=${database}`]];
}

export function postgresDatabaseListCommand({ container }) {
  return ["make", ["postgres-db-list", `CONTAINER=${container}`]];
}

export function postgresDumpListCommand() {
  return ["make", ["postgres-dump-list"]];
}
