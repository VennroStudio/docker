import { readFile } from "node:fs/promises";

export async function getRuntimeEnv() {
  return { ...(await readDotEnv()), ...process.env };
}

export async function readDotEnv(file = ".env") {
  try {
    const envFile = await readFile(file, "utf8");
    return Object.fromEntries(
      envFile
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          const key = line.slice(0, index).trim();
          const value = line
            .slice(index + 1)
            .trim()
            .replace(/^["']|["']$/g, "");
          return [key, value];
        }),
    );
  } catch {
    return {};
  }
}
