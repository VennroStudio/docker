#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { assert, parseArgs, required } from "../common/cli.mjs";

const action = process.argv[2] || "";
const rootDir = process.cwd();
const archiveDir = path.resolve(rootDir, process.env.ARCHIVE_DIR || "archives");

const options = parseArgs(process.argv.slice(3));

try {
  switch (action) {
    case "create":
      createArchive();
      break;
    case "list":
      listArchives();
      break;
    case "extract":
      extractArchive();
      break;
    case "delete":
      deleteArchive();
      break;
    default:
      usage();
      process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function createArchive() {
  const name = requireArchiveBaseName(options.name);
  const folder = required(options.folder, "FOLDER is required");
  const sourcePath = path.resolve(rootDir, folder);
  if (!existsSync(sourcePath)) throw new Error(`FOLDER does not exist: ${folder}`);

  mkdirSync(archiveDir, { recursive: true });
  const archivePath = path.join(archiveDir, `${name}-${dateStamp()}.tar.gz`);
  runTar(["--exclude=._*", "-czvf", archivePath, `${folder.replace(/\/+$/, "")}/`]);
}

function listArchives() {
  mkdirSync(archiveDir, { recursive: true });
  const archives = readdirSync(archiveDir)
    .filter((name) => name.endsWith(".tar.gz") || name.endsWith(".tgz"))
    .sort((left, right) => {
      const leftStat = statSync(path.join(archiveDir, left));
      const rightStat = statSync(path.join(archiveDir, right));
      return rightStat.mtimeMs - leftStat.mtimeMs;
    })
    .map((name) => {
      const archivePath = path.join(archiveDir, name);
      const stat = statSync(archivePath);
      return {
        modifiedAt: stat.mtime.toISOString(),
        name,
        path: path.relative(rootDir, archivePath),
        size: stat.size,
      };
    });

  console.log(JSON.stringify({ archives }, null, 2));
}

function extractArchive() {
  const name = requireArchiveFileName(options.name);
  const dest = required(options.dest, "DEST is required");
  const archivePath = archivePathFor(name);
  if (!existsSync(archivePath)) throw new Error(`Archive does not exist: ${name}`);

  const destPath = path.resolve(rootDir, dest);
  mkdirSync(destPath, { recursive: true });
  runTar(["-xzvf", archivePath, "-C", destPath]);
}

function deleteArchive() {
  const name = requireArchiveFileName(options.name);
  const archivePath = archivePathFor(name);
  if (!existsSync(archivePath)) throw new Error(`Archive does not exist: ${name}`);

  rmSync(archivePath);
  console.log(`Deleted ${path.relative(rootDir, archivePath)}`);
}

function archivePathFor(name) {
  return path.join(archiveDir, name);
}

function requireArchiveBaseName(value) {
  const name = required(value, "NAME is required");
  assert(/^[A-Za-z0-9._-]+$/.test(name), "Invalid NAME");
  return name.replace(/\.t(ar\.)?gz$/, "");
}

function requireArchiveFileName(value) {
  const name = required(value, "NAME is required");
  assert(/^[A-Za-z0-9._-]+\.t(ar\.)?gz$/.test(name), "Invalid NAME");
  return name;
}

function runTar(args) {
  const result = spawnSync("tar", args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

function dateStamp() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function usage() {
  console.log("Usage:");
  console.log("  make archive NAME=archiveName FOLDER=folderName");
  console.log("  make archive-list");
  console.log("  make unarchive NAME=archiveName-DD-MM-YYYY.tar.gz DEST=folderName");
  console.log("  make archive-delete NAME=archiveName-DD-MM-YYYY.tar.gz");
}
