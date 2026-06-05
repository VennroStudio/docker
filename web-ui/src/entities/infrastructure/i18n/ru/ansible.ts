import type { AppText } from "../types";

export const ruAnsible = {
  actions: {
    addRow: "Добавить строку",
    addVariable: "Добавить переменную",
    build: "Собрать контейнер",
    clean: "Удалить контейнер",
    deleteRow: "Удалить строку",
    savePlaybook: "Сохранить playbook",
    saveVariables: "Сохранить переменные",
    setup: "Установить на сервер",
  },
  configEyebrow: "Переменные",
  configTitle: "config/ansible.json",
  deployEyebrow: "Playbook",
  deployTitle: "docker/ansible/deploy.yml",
  description: "Редактируй Ansible переменные и запускай deploy playbook на выбранном SSH сервере.",
  emptyServers: "Нет SSH серверов",
  fields: {
    parameter: "Параметр",
    server: "SSH сервер",
    value: "Значение",
  },
  loading: "Загрузка Ansible config...",
  messages: {
    configSaved: "Ansible config сохранен",
    playbookSaved: "Deploy playbook сохранен",
  },
  runEyebrow: "Runner",
  runTitle: "Ansible действия",
  title: "Ansible",
  validation: {
    duplicateVariable: (name) => `Переменная дублируется: ${name}`,
    parameter: "Используй заглавные буквы, цифры и underscore. Первый символ - буква или underscore.",
    server: "Выбери SSH сервер",
  },
  variablesEmpty: "Переменных пока нет.",
  variablesMissing: "Выполни make init, чтобы создать config/ansible.json.",
  variablesModalTitle: "Ansible переменные",
} satisfies AppText["ansible"];
