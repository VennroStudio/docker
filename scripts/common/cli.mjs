export function parseArgs(args) {
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      options[key] = "1";
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return options;
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function required(value, message) {
  assert(value, message);
  return value;
}

export function bool(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());
}

export function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}
