import type { AppText } from "../types";

export const enAnsible = {
  actions: {
    addRow: "Add row",
    addVariable: "Add variable",
    build: "Build container",
    clean: "Clean container",
    deleteRow: "Delete row",
    savePlaybook: "Save playbook",
    saveVariables: "Save variables",
    setup: "Setup server",
  },
  configEyebrow: "Variables",
  configTitle: "config/ansible.json",
  deployEyebrow: "Playbook",
  deployTitle: "docker/ansible/deploy.yml",
  description: "Edit Ansible variables and run the deploy playbook against an SSH server.",
  emptyServers: "No SSH servers",
  fields: {
    parameter: "Parameter",
    server: "SSH server",
    value: "Value",
  },
  loading: "Loading Ansible config...",
  messages: {
    configSaved: "Ansible config saved",
    playbookSaved: "Deploy playbook saved",
  },
  runEyebrow: "Runner",
  runTitle: "Ansible actions",
  title: "Ansible",
  validation: {
    duplicateVariable: (name) => `Duplicate variable: ${name}`,
    parameter: "Use uppercase letters, numbers and underscores. First character must be a letter or underscore.",
    server: "Select SSH server",
  },
  variablesEmpty: "No variables yet.",
  variablesMissing: "Run make init to create config/ansible.json.",
  variablesModalTitle: "Ansible variables",
} satisfies AppText["ansible"];
