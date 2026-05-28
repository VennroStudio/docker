export type AppSettings = {
  proxy: {
    npmUrl: string;
    npmEmail: string;
    npmPassword: string;
  };
  phpmyadmin: {
    pmaUrl: string;
  };
  pgadmin: {
    pgaUrl: string;
    pgaEmail: string;
    pgaPassword: string;
  };
  redis: {
    redisPassword: string;
  };
  redisinsight: {
    riUrl: string;
  };
};

export type SettingsResponse = {
  exists: boolean;
  path: string;
  settings: AppSettings;
};

export type GenerateEnvResponse = {
  ok: boolean;
  path: string;
  settings: AppSettings;
};
