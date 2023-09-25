import fs from "fs";
import path from "path";
import { hasModule, execute } from "./shell";
import type { Package } from "../types";

/**
 * Returns the path to the root directory of the project (where the package.json is located).
 * This function assumes that it is in the node_modules directory of the project
 * and will need to go up one directory at a time until it finds the package.json.
 * 
 * @param directory - directory to start from (default: process.cwd())
 * @returns string
 */
function getProjectRoot(directory = process.cwd(), depth = 0): string | undefined {
  const MAX_DEPTH = 5;

  // return undefined if we've gone up too many directories
  if (depth > MAX_DEPTH) {
    return undefined;
  }

  // return the directory if it contains a package.json
  if (fs.existsSync(path.join(directory, "package.json"))) {
    return directory;
  }

  // otherwise, go up one directory and try again
  return getProjectRoot(path.join(directory, ".."), depth + 1);
}

/**
 * Returns the package.json as an object.
 * 
 * @returns package.json
 */
function getPackageJson(directory?: string): Package {
  directory = directory || process.cwd();

  const root = getProjectRoot(directory) || directory;
  const packageJsonContent = fs.readFileSync(path.join(root, "package.json"), "utf8");
  const packageJson = JSON.parse(packageJsonContent);

  return {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    scripts: packageJson.scripts,
    author: packageJson.author,
    license: packageJson.license,
    main: packageJson.main,
    fistbump: packageJson.fistbump
  };
}

/**
 * Returns the latest commit message.
 * 
 * @returns string
 */
function getLatestCommit(): string {
  return execute("git log -1 --pretty=%B");
}

/**
 * Returns true if the commit message is a merge commit.
 * @param commit - commit message
 */
function isMergeCommit(commit: string): boolean {
  // look for a 'Merge' at the beginning of the commit message
  const mergeRegex = /^Merge/;
  return mergeRegex.test(commit);
}

/**
 * Throws an error if the script is not being run in a git repository
 * with npm or pnpm installed.
 */
function isValidRepository() {
  if (!hasModule("git")) {
    throw new Error("Sorry, this script requires git");
  }

  if (!hasModule("npm") || !hasModule("pnpm")) {
    throw new Error("Sorry, this script requires npm or pnpm");
  }
}

export {
  getProjectRoot,
  getPackageJson,
  getLatestCommit,
  isMergeCommit,
  isValidRepository
}