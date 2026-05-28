export function hostCommand(action, domain) {
  return ["make", [action === "add" ? "host-add" : "host-remove", `DOMAIN=${domain}`]];
}

export function proxyCommand({ domain, port, ssl, target }) {
  const args = ["app-proxy", `DOMAIN=${domain}`, `TARGET=${target}`, `PORT=${String(port)}`];
  if (ssl) args.push("SSL=1");
  return ["make", args];
}

export function proxyDeleteCommand(domain) {
  return ["make", ["app-proxy-remove", `DOMAIN=${domain}`]];
}

export function shellCommand() {
  return ["make", ["npm-shell", "COMPOSE_EXEC_FLAGS=-T"]];
}
