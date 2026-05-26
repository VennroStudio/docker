export type AppSettings = {
  environment: {
    env: string;
    nodeLibrary: string;
  };
  proxy: {
    npmUrl: string;
    npmEmail: string;
    npmPassword: string;
  };
  mariadb: {
    defaultVersion: string;
    rootPassword: string;
    defaultDatabase: string;
    dumpName: string;
    homeDumpPath: string;
    serverDumpPath: string;
  };
  deployment: {
    ssh: string;
    host: string;
    port: string;
    user: string;
    sshKey: string;
  };
  registry: {
    registryUser: string;
    registryPassword: string;
    dockerhubUsername: string;
    dockerhubPassword: string;
  };
  storage: {
    minioRootUser: string;
    minioRootPassword: string;
    redisPassword: string;
  };
  postgres: {
    user: string;
    password: string;
    database: string;
    dumpName: string;
    homeDumpPath: string;
    serverDumpPath: string;
    pgAdminEmail: string;
    pgAdminPassword: string;
  };
};

export type SettingsResponse = {
  exists: boolean;
  path: string;
  settings: AppSettings;
};
