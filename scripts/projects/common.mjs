import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { assert, bool, printJson } from "../common/cli.mjs";

export const projectsFile = process.env.INFRA_PROJECTS_FILE || "config/projects.json";
export const runtimeCatalogFile = process.env.INFRA_PROJECT_RUNTIME_CATALOG_FILE || "config/project-runtime-catalog.json";
export const projectsRoot = process.env.INFRA_PROJECTS_DIR || "projects";
export const projectNamePattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export const supportedRuntimes = ["php", "node"];

export async function initProjectsStore() {
  if (existsSync(projectsFile)) return;
  await writeJson(projectsFile, { projects: [] });
  console.log(`Created projects store: ${projectsFile}`);
}

export async function readProjectsStore() {
  const payload = await readJson(projectsFile, { projects: [] });
  return {
    projects: Array.isArray(payload.projects) ? payload.projects : [],
  };
}

export async function writeProjectsStore(store) {
  await writeJson(projectsFile, {
    projects: [...store.projects].sort((left, right) => left.name.localeCompare(right.name)),
  });
}

export async function readRuntimeCatalog() {
  return readJson(runtimeCatalogFile, {});
}

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

export async function writeJson(file, payload) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function input(options, name, fallback = "") {
  const optionKey = name.toLowerCase().replaceAll("_", "-");
  if (Object.prototype.hasOwnProperty.call(options, optionKey)) return options[optionKey] ?? fallback;
  if (hasMakeVariable(name) && Object.prototype.hasOwnProperty.call(process.env, name)) return process.env[name] ?? fallback;
  return fallback;
}

export function hasInput(options, name) {
  const optionKey = name.toLowerCase().replaceAll("_", "-");
  return Object.prototype.hasOwnProperty.call(options, optionKey) || hasMakeVariable(name);
}

export function flag(options, name) {
  return bool(input(options, name));
}

export function hasMakeVariable(name) {
  return String(process.env.MAKEFLAGS || "")
    .split(/\s+/)
    .some((item) => item === name || item.startsWith(`${name}=`));
}

export function validateProjectName(name) {
  assert(projectNamePattern.test(name || ""), "Invalid NAME. Use lowercase letters, numbers and dashes.");
  return name;
}

export function projectDir(name) {
  return path.join(projectsRoot, name);
}

export function projectComposeFile(project) {
  return path.join(project.path, "docker-compose.yml");
}

export function projectMakefile(project) {
  return path.join(project.path, "Makefile");
}

export function projectConfigFile(project) {
  return path.join(project.path, ".project.json");
}

export function findProject(store, name) {
  return store.projects.find((project) => project.name === name);
}

export function requireProject(store, name) {
  const project = findProject(store, validateProjectName(name));
  assert(project, `Project not found: ${name}`);
  return project;
}

export async function removeProjectDirectory(project) {
  await rm(project.path, { force: true, recursive: true });
}

export function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function printProject(project) {
  printJson(project);
}
