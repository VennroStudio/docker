#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { parseArgs, assert, printJson } from "../common/cli.mjs";
import { runInherit } from "../common/process.mjs";
import {
  findProject,
  flag,
  input,
  initProjectsStore,
  printProject,
  projectDir,
  projectsRoot,
  readProjectsStore,
  readRuntimeCatalog,
  removeProjectDirectory,
  requireProject,
  validateProjectName,
  writeProjectsStore,
} from "./common.mjs";
import { generateProjectFiles, normalizeProjectConfig, projectConfigChanged } from "./generate.mjs";

const action = process.argv[2] || "";
const options = parseArgs(process.argv.slice(3));

try {
  switch (action) {
    case "init":
      await initProjectsStore();
      break;
    case "catalog":
      printJson(await readRuntimeCatalog());
      break;
    case "list":
      await listProjects();
      break;
    case "show":
      await showProject();
      break;
    case "create":
      await createProject();
      break;
    case "update":
      await updateProject();
      break;
    case "remove":
      await removeProject();
      break;
    case "generate":
      await generateProject();
      break;
    case "shell":
    case "up":
    case "down":
    case "build":
    case "logs":
    case "logs-follow":
    case "clean":
    case "status":
      await runProjectMake(action);
      break;
    default:
      usage();
      process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

async function listProjects() {
  const store = await readProjectsStore();
  printJson(store.projects);
}

async function showProject() {
  const store = await readProjectsStore();
  printProject(requireProject(store, input(options, "NAME")));
}

async function createProject() {
  const store = await readProjectsStore();
  const catalog = await readRuntimeCatalog();
  const name = validateProjectName(input(options, "NAME"));
  const path = projectDir(name);

  assert(!findProject(store, name), `Project already exists: ${name}`);
  assert(!existsSync(path), `Project directory already exists: ${path}`);

  const now = new Date().toISOString();
  const config = normalizeProjectConfig(projectPayload(name), catalog);
  const project = {
    name,
    path,
    ...config,
    createdAt: now,
    updatedAt: now,
  };

  await mkdir(projectsRoot, { recursive: true });
  await generateProjectFiles(project);
  store.projects.push(project);
  await writeProjectsStore(store);
  await runProjectMake("up", project);
  printProject(project);
}

async function updateProject() {
  const store = await readProjectsStore();
  const catalog = await readRuntimeCatalog();
  const name = validateProjectName(input(options, "NAME"));
  const project = requireProject(store, name);
  const config = normalizeProjectConfig(projectPayload(name), catalog, project);
  const changed = projectConfigChanged({ runtimes: project.runtimes, web: project.web }, config);
  const next = {
    ...project,
    ...config,
    updatedAt: new Date().toISOString(),
  };

  if (changed) await cleanupRuntimeArtifacts(next);
  await generateProjectFiles(next);

  store.projects = store.projects.map((item) => (item.name === name ? next : item));
  await writeProjectsStore(store);
  if (changed) await runProjectMake("up", next);
  printProject(next);
}

async function removeProject() {
  const store = await readProjectsStore();
  const name = validateProjectName(input(options, "NAME"));
  const project = requireProject(store, name);

  assert(flag(options, "FORCE"), "FORCE=1 is required to remove a project");

  await runProjectMake("clean", project, { optional: true });
  await removeProjectDirectory(project);
  store.projects = store.projects.filter((item) => item.name !== name);
  await writeProjectsStore(store);
  console.log(`Removed project: ${name}`);
}

async function generateProject() {
  const store = await readProjectsStore();
  const project = requireProject(store, input(options, "NAME"));
  await generateProjectFiles(project);
  printProject(project);
}

async function runProjectMake(command, project = null, { optional = false } = {}) {
  const store = await readProjectsStore();
  const target = project || requireProject(store, input(options, "NAME"));
  const args = ["-C", target.path, command];

  try {
    await runInherit("make", args);
  } catch (error) {
    if (!optional) throw error;
  }
}

async function cleanupRuntimeArtifacts(project) {
  await runProjectMake("down", project, { optional: true });
}

function projectPayload(name = input(options, "NAME")) {
  return {
    name,
    runtimes: input(options, "RUNTIMES"),
    removeRuntimes: input(options, "REMOVE_RUNTIMES"),
    webStack: input(options, "WEB_STACK"),
    documentRoot: input(options, "DOCUMENT_ROOT"),
    webPort: input(options, "WEB_PORT"),
    webCommand: input(options, "WEB_COMMAND"),
    phpVersion: input(options, "PHP_VERSION"),
    phpPreset: input(options, "PHP_PRESET"),
    phpExtensions: input(options, "PHP_EXTENSIONS"),
    phpPackageManagers: input(options, "PHP_PACKAGE_MANAGERS"),
    nodeVersion: input(options, "NODE_VERSION"),
    nodePackageManager: input(options, "NODE_PACKAGE_MANAGER"),
    pythonVersion: input(options, "PYTHON_VERSION"),
    pythonPackageManager: input(options, "PYTHON_PACKAGE_MANAGER"),
    goVersion: input(options, "GO_VERSION"),
    javaVersion: input(options, "JAVA_VERSION"),
    javaPackageManager: input(options, "JAVA_PACKAGE_MANAGER"),
    dotnetVersion: input(options, "DOTNET_VERSION"),
    rubyVersion: input(options, "RUBY_VERSION"),
    rubyPackageManager: input(options, "RUBY_PACKAGE_MANAGER"),
  };
}

function usage() {
  console.log("Usage:");
  console.log("  make project-init");
  console.log("  make project-catalog");
  console.log("  make project-list");
  console.log("  make project-show NAME=project-a");
  console.log("  make project-create NAME=project-a WEB_STACK=nginx-fpm PHP_VERSION=8.4 PHP_PRESET=laravel");
  console.log("  make project-update NAME=project-a WEB_STACK=apache PHP_PRESET=wordpress");
  console.log("  make project-remove NAME=project-a FORCE=1");
  console.log("  make project-shell NAME=project-a");
  console.log("  make project-up NAME=project-a");
  console.log("  make project-down NAME=project-a");
  console.log("  make project-build NAME=project-a");
  console.log("  make project-logs NAME=project-a");
  console.log("  make project-logs-follow NAME=project-a");
  console.log("  make project-clean NAME=project-a");
  console.log("  make project-status NAME=project-a");
}
