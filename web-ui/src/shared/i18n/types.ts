import type { CommandId, ServiceRuntimeState, ViewId } from "../types/commands";

export type Language = "en" | "ru";

export type AppText = {
  actions: Record<CommandId, { detail: string; label: string }>;
  common: {
    clear: string;
    hide: string;
    link: string;
    panels: string;
    statusLabels: Record<ServiceRuntimeState, string>;
    stop: string;
    terminal: string;
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
    serviceCards: Record<Exclude<ViewId, "home" | "network">, { description: string; meta: string; title: string }>;
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
    create: string;
    createTitle: string;
    domainLabel: string;
    domainUnknown: string;
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
    instanceTitle: (version: string) => string;
    legacy: string;
    loading: string;
    phpmyadminEyebrow: string;
    portAuto: string;
    portLabel: string;
    serversTitle: string;
    statusLabel: string;
    title: string;
    titleEyebrow: string;
  };
  panels: {
    npm: {
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
      removeHost: string;
      target: string;
      title: string;
    };
  };
  servicePages: Record<
    Exclude<ViewId, "home">,
    {
      description: string;
      eyebrow: string;
      panelEyebrow: string;
      panelTitle: string;
    }
  >;
  views: Record<ViewId, string>;
};
