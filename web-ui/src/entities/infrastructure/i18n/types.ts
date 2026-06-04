import type { CommandId, ServiceRuntimeState, ServiceViewId, TerminalState, ViewId } from "../model/types";

export type Language = "en" | "ru";

export type AppText = {
  actions: Record<CommandId, { detail: string; label: string }>;
  common: {
    cancel: string;
    clear: string;
    hide: string;
    link: string;
    panel: string;
    panels: string;
    statusLabels: Record<ServiceRuntimeState, string>;
    stop: string;
    terminalStateLabels: Record<TerminalState, string>;
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
      eyebrow: string;
      lead: string;
      title: string;
    };
    modules: {
      eyebrow: string;
      title: string;
    };
    services: {
      eyebrow: string;
      title: string;
    };
    serviceCards: Record<ServiceViewId, { description: string; meta: string; title: string }>;
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
    portLabel: string;
    serversTitle: string;
    statusLabel: string;
    title: string;
    titleEyebrow: string;
  };
  projects: {
    actions: Record<
      | "build"
      | "clean"
      | "create"
      | "down"
      | "edit"
      | "logs"
      | "logsFollow"
      | "refresh"
      | "remove"
      | "shell"
      | "start"
      | "status"
      | "stop"
      | "up",
      string
    >;
    containers: string;
    description: string;
    empty: string;
    eyebrow: string;
    fields: {
      documentRoot: string;
      enableNode: string;
      link: string;
      name: string;
      nodePackageManager: string;
      nodeVersion: string;
      phpVersion: string;
      webCommand: string;
      webPort: string;
      webStack: string;
    };
    loading: string;
    modal: {
      create: string;
      edit: string;
    };
    options: {
      apache: string;
      node: string;
      nginx: string;
    };
    runtime: string;
    sections: {
      create: string;
      details: string;
      runtime: string;
      web: string;
    };
    title: string;
    validation: {
      name: string;
      nodeVersion: string;
      phpVersion: string;
    };
  };
  panels: {
    npm: {
      configEyebrow: string;
      configTitle: string;
      nginxEyebrow: string;
      nginxTitle: string;
    };
    serviceControl: {
      adminPanel: string;
      auth: string;
      cache: string;
      containerRequired: string;
      database: string;
      interface: string;
      mariadbRequired: string;
      port: string;
      pgadminCredentialsRequired: string;
      postgresRequired: string;
      minioCredentialsRequired: string;
      redisPasswordRequired: string;
      redisRequired: string;
      registryCredentialsRequired: string;
      registryRequired: string;
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
  utilities: {
    archive: {
      archiveName: string;
      archiveNamePlaceholder: string;
      archiveSelect: string;
      archiveSelectPlaceholder: string;
      createAction: string;
      createTitle: string;
      deleteAction: string;
      deleteTitle: string;
      dest: string;
      destPlaceholder: string;
      emptyArchives: string;
      extractAction: string;
      extractTitle: string;
      folder: string;
      folderPlaceholder: string;
      refresh: string;
      title: string;
      titleEyebrow: string;
      validation: {
        archive: string;
        createDisabled: string;
        dest: string;
        folder: string;
        name: string;
      };
    };
    description: string;
    eyebrow: string;
  };
  ssh: {
    actions: {
      addServer: string;
      addCommand: string;
      copyPassword: string;
      deleteCommand: string;
      deleteServer: string;
      generateKey: string;
      insertCommand: string;
      keyRemove: string;
      keyPush: string;
      saveCommand: string;
      saveServer: string;
      terminal: string;
    };
    authType: string;
    description: string;
    empty: string;
    eyebrow: string;
    fields: {
      comment: string;
      command: string;
      force: string;
      host: string;
      keyPath: string;
      name: string;
      password: string;
      passwordMode: string;
      port: string;
      server: string;
      user: string;
    };
    modals: {
      addServer: string;
      generateKey: string;
    };
    options: {
      key: string;
      manual: string;
      password: string;
      sshpass: string;
    };
    placeholders: {
      comment: string;
      command: string;
      host: string;
      keyPath: string;
      name: string;
      password: string;
      port: string;
      user: string;
    };
    sectionEyebrow: string;
    sections: {
      commandsEyebrow: string;
      commandsTitle: string;
      serverEyebrow: string;
      serverTitle: string;
    };
    title: string;
    validation: {
      command: string;
      host: string;
      name: string;
      password: string;
      port: string;
      server: string;
      user: string;
    };
    messages: {
      commandInserted: string;
      connectFirst: string;
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
      minio: string;
      proxy: string;
      redis: string;
      registry: string;
    };
    sourceLabel: string;
    sourceMissing: string;
    sourceReady: string;
    title: string;
    unsaved: string;
  };
  views: Record<ViewId, string>;
};
