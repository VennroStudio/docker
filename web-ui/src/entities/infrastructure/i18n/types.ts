import type { CommandId, ServiceRuntimeState, StreamState, ViewId } from "../model/types";

export type Language = "en" | "ru";

export type AppText = {
  actions: Record<CommandId, { detail: string; label: string }>;
  common: {
    cancel: string;
    clear: string;
    hide: string;
    link: string;
    panels: string;
    statusLabels: Record<ServiceRuntimeState, string>;
    stop: string;
    streamLabels: Record<StreamState, string>;
    terminal: string;
  };
  operationToast: {
    blocked: (label: string) => string;
    error: (label: string) => string;
    stopped: (label: string) => string;
    success: (label: string) => string;
  };
  shell: {
    detail: (container: string) => string;
    inputPlaceholder: string;
    openLabel: (label: string) => string;
    panelEyebrow: string;
    panelTitle: string;
  };
  confirm: {
    deleteHost: {
      body: (domain: string) => string;
      confirmLabel: string;
      title: string;
    };
    deleteProxy: {
      body: (domain: string) => string;
      confirmLabel: string;
      title: string;
    };
    runCommand: {
      body: (command: string) => string;
      confirmLabel: string;
    };
  };
  home: {
    hero: {
      action: string;
      eyebrow: string;
      lead: string;
      title: string;
    };
    services: {
      eyebrow: string;
      title: string;
    };
    serviceCards: Record<
      Exclude<ViewId, "home" | "network" | "settings">,
      { description: string; meta: string; title: string }
    >;
    workflow: {
      eyebrow: string;
      steps: Array<{ detail: string; title: string }>;
      title: string;
    };
  };
  mariadbInstances: {
    actions: Record<
      "clean" | "down" | "logs" | "shell" | "start" | "stop" | "up",
      {
        detail: string;
        label: string;
      }
    >;
    authModes: {
      config: string;
      cookie: string;
    };
    containerLabel: string;
    addVersion: string;
    create: string;
    createTitle: string;
    empty: string;
    error: string;
    fields: {
      authMode: string;
      password: string;
      port: string;
      rootPassword: string;
      user: string;
      version: string;
    };
    import: {
      action: string;
      container: string;
      containerPlaceholder: string;
      database: string;
      databasePlaceholder: string;
      emptyFiles: string;
      emptyInstances: string;
      filePath: string;
      filePathPlaceholder: string;
      fileSelect: string;
      fileSelectPlaceholder: string;
      refreshFiles: string;
      title: string;
      titleEyebrow: string;
      validation: {
        container: string;
        database: string;
        disabled: string;
        filePath: string;
      };
    };
    export: {
      action: string;
      container: string;
      containerPlaceholder: string;
      database: string;
      databasePlaceholder: string;
      emptyInstances: string;
      filePath: string;
      filePathPlaceholder: string;
      title: string;
      titleEyebrow: string;
      validation: {
        container: string;
        database: string;
        disabled: string;
        filePath: string;
      };
    };
    databaseManager: {
      container: string;
      containerPlaceholder: string;
      createAction: string;
      createPlaceholder: string;
      database: string;
      deleteAction: string;
      emptyDatabases: string;
      emptyInstances: string;
      refresh: string;
      title: string;
      titleEyebrow: string;
      validation: {
        container: string;
        createDisabled: string;
        database: string;
        deleteDisabled: string;
      };
    };
    instanceTitle: (version: string) => string;
    loading: string;
    phpmyadminEyebrow: string;
    portAuto: string;
    portLabel: string;
    serversTitle: string;
    statusLabel: string;
    title: string;
    titleEyebrow: string;
  };
  postgresInstances: {
    addVersion: string;
    containerLabel: string;
    create: string;
    createTitle: string;
    databaseLabel: string;
    empty: string;
    error: string;
    fields: {
      database: string;
      password: string;
      user: string;
      version: string;
    };
    import: {
      action: string;
      container: string;
      containerPlaceholder: string;
      database: string;
      databasePlaceholder: string;
      emptyFiles: string;
      emptyInstances: string;
      filePath: string;
      filePathPlaceholder: string;
      fileSelect: string;
      fileSelectPlaceholder: string;
      refreshFiles: string;
      title: string;
      titleEyebrow: string;
      validation: {
        container: string;
        database: string;
        disabled: string;
        filePath: string;
      };
    };
    export: {
      action: string;
      container: string;
      containerPlaceholder: string;
      database: string;
      databasePlaceholder: string;
      emptyInstances: string;
      filePath: string;
      filePathPlaceholder: string;
      title: string;
      titleEyebrow: string;
      validation: {
        container: string;
        database: string;
        disabled: string;
        filePath: string;
      };
    };
    databaseManager: {
      container: string;
      containerPlaceholder: string;
      createAction: string;
      createPlaceholder: string;
      database: string;
      deleteAction: string;
      emptyDatabases: string;
      emptyInstances: string;
      refresh: string;
      title: string;
      titleEyebrow: string;
      validation: {
        container: string;
        createDisabled: string;
        database: string;
        deleteDisabled: string;
      };
    };
    instanceTitle: (version: string) => string;
    loading: string;
    pgadminConfigTitle: string;
    pgadminEyebrow: string;
    portLabel: string;
    serversTitle: string;
    statusLabel: string;
    title: string;
    titleEyebrow: string;
  };
  panels: {
    npm: {
      configEyebrow: string;
      configTitle: string;
      networkEyebrow: string;
      networkTitle: string;
      nginxEyebrow: string;
      nginxTitle: string;
    };
    serviceControl: {
      adminPanel: string;
      cache: string;
      database: string;
      interface: string;
    };
    proxy: {
      addHost: string;
      createProxy: string;
      deleteProxy: string;
      domain: string;
      eyebrow: string;
      hints: {
        domain: string;
        port: string;
        target: string;
      };
      removeHost: string;
      target: string;
      title: string;
      validation: {
        domain: string;
        hostDisabled: string;
        port: string;
        proxyDisabled: string;
        target: string;
      };
    };
  };
  servicePages: Record<
    Exclude<ViewId, "home" | "settings">,
    {
      description: string;
      eyebrow: string;
      panelEyebrow: string;
      panelTitle: string;
    }
  >;
  settings: {
    clean: string;
    description: string;
    envGenerated: string;
    eyebrow: string;
    generateEnv: string;
    loading: string;
    reset: string;
    save: string;
    saved: string;
    sectionEyebrow: string;
    sections: {
      pgadmin: string;
      phpmyadmin: string;
      proxy: string;
    };
    sourceLabel: string;
    sourceMissing: string;
    sourceReady: string;
    title: string;
    unsaved: string;
  };
  views: Record<ViewId, string>;
};
