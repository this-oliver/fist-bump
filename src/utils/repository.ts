import fs from "fs";
import path from "path";
import { BUMP_KEYWORDS } from "../config";
import { hasModule, execute } from "./shell";
import type { FistBumpConfig, Package } from "../types";

/**
 * Returns the fistbump configuration from the package.json file. If no
 * configuration is provided, the default configuration is returned.
 * 
 * The default configuration is:
 * 
 * - patch: [ "fix", "patch" ]
 * - minor: [ "feature", "config", "minor" ]
 * - major: [ "breaking", "release", "major" ]
 * - position: "start"
 * 
 * @returns keywords
 */
function getFistBumpConfig(): FistBumpConfig {
  const config: FistBumpConfig = {
    patch: BUMP_KEYWORDS.PATCH,
    minor: BUMP_KEYWORDS.MINOR,
    major: BUMP_KEYWORDS.MAJOR,
    position: "start"
  };

  const { fistbump } = getPackageJson();

  if (fistbump?.patch && fistbump.patch.length > 0) {
    config.patch = fistbump.patch;
  }

  if (fistbump?.minor && fistbump.minor.length > 0) {
    config.minor = fistbump.minor;
  }

  if (fistbump?.major && fistbump.major.length > 0) {
    config.major = fistbump.major;
  }

  if (fistbump?.position) {
    config.position = fistbump.position;
  }

  return config;
}

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
 * Returns true if the script is being run in a git repository.
 */
function isGitRepo(): boolean {
  return hasModule("git");
}

/**
 * Returns true if the script is being run with npm or pnpm installed.
 */
function isNpmRepo(): boolean {
  return hasModule("npm");
}

export {
  getFistBumpConfig,
  getProjectRoot,
  getPackageJson,
  getLatestCommit,
  isMergeCommit,
  isGitRepo,
  isNpmRepo
}