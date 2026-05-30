import type { CommandAction, ContainerRuntimeState } from "./types";

type ContainerActionOptions = {
  disabledTitle?: string;
  upBlockedTitle?: string;
};

export function isContainerRunning(state?: ContainerRuntimeState | null) {
  return state === "running";
}

export function commandActionSuffix(action: Pick<CommandAction, "id">) {
  return String(action.id).split(":").at(-1) || "";
}

export function applyContainerActionRules(
  actions: CommandAction[],
  state?: ContainerRuntimeState | null,
  options: ContainerActionOptions = {},
) {
  const running = isContainerRunning(state);

  return actions.map((action) => {
    const suffix = commandActionSuffix(action);
    const nextAction = { ...action };

    if (!running && suffix !== "up") {
      nextAction.disabled = true;
      nextAction.disabledTitle = options.disabledTitle || action.disabledTitle;
    }

    if (suffix === "up" && options.upBlockedTitle) {
      nextAction.blockedTitle = options.upBlockedTitle;
      nextAction.disabled = false;
      delete nextAction.disabledTitle;
    }

    return nextAction;
  });
}

export function shellDisabledForContainerState(state?: ContainerRuntimeState | null) {
  return !isContainerRunning(state);
}
