import fs from "fs";
import path from "path";
import { BUMP_KEYWORDS } from "./config";
import {
  logMessage,
  hasModule,
  execute,
  exit
} from "./utils"

/**
 * Throws an error if the script is not being run in a git repository
 * with npm or pnpm installed.
 */
export function inspectDirectory() {
  if (!hasModule("git")) {
    throw new Error("Sorry, this script requires git");
  }

  if (!hasModule("npm") || !hasModule("pnpm")) {
    throw new Error("Sorry, this script requires npm or pnpm");
  }
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
 * Configuration for fistbump.
 */
interface FistBumpConfig {
  patch: string[];
  minor: string[];
  major: string[];
}

/**
 * Package.json representation.
 */
interface Package {
  name: string;
  version: string;
  scripts: unknown;
  author?: string | unknown;
  description?: string;
  license?: string;
  main?: string;
  fistbump?: FistBumpConfig;
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

type BumpType = "patch" | "minor" | "major";

/**
 * Returns the bump type based on the commit message.
 * Possible values are 'patch', 'minor', or 'major'.
 * 
 * @param commit - commit message
 * @returns string
 */
function getBumpType(commit: string): BumpType | undefined {
  const keywords = getKeywords();

  if (_hasKeyword(keywords.patch, commit)) {
    return "patch";
  } else if (_hasKeyword(keywords.minor, commit)) {
    return "minor";
  } else if (_hasKeyword(keywords.major, commit)) {
    return "major";
  }

  return undefined;
}

/**
* Returns true if the text contains any of the keywords provided
* in the pattern of `[keyword]:` or `keyword:` where keyword is
* any of the keywords provided.
* 
* @param BUMP_KEYWORDS - list of keywords to check for
* @param text - text to check
* @returns boolean
*/
function _hasKeyword(BUMP_KEYWORDS: string[], text: string): boolean {
  for (const keyword of BUMP_KEYWORDS) {
    // replace 'sample' with keyword
    const keywordRegex = new RegExp(`(\\[)?\\s*${keyword}\\s*(\\])?\\s*:`, "i");

    if (keywordRegex.test(text)) {
      return true;
    }
  }

  return false;
}

/**
 * Returns keywords from the package.json, if any. Otherwise, returns 
 * default keywords from the config file.
 * 
 * @returns keywords
 */
function getKeywords(): FistBumpConfig {
  let patch = BUMP_KEYWORDS.PATCH;
  let minor = BUMP_KEYWORDS.MINOR;
  let major = BUMP_KEYWORDS.MAJOR;

  const { fistbump } = getPackageJson();

  // return default keywords if fistbump is not defined
  if(!fistbump || (fistbump.patch.length <= 0 && fistbump.minor.length <= 0 && fistbump.major.length <= 0)) {
    return {
      patch, minor, major 
    };
  }

  patch = fistbump.patch || patch;
  minor = fistbump.minor || minor;
  major = fistbump.major || major;

  return {
    patch, minor, major
  };
}

/**
 * Updates the package.json file with the new version, adds the
 * `package.json` and `package-lock.json`/`pnpm-lock.yaml` to the git staging area,
 * and amends the commit message.
 * 
 * @param bumpType - bump type
 */
function updateVersion(bumpType: BumpType) {
  const commit = getLatestCommit();
  const rootDir = getProjectRoot() || process.cwd();

  // execute the npm version command
  execute(`npm version ${bumpType} --no-git-tag-version`);

  // add packages.json to the git staging area
  execute(`git add ${path.join(rootDir, "package.json")}`);

  // add package-lock.json to the git staging area if it exists
  if (fs.existsSync("package-lock.json")) {
    execute(`git add ${path.join(rootDir, "package-lock.json")}`);
  }

  // add pnpm-lock.yaml to the git staging area if it exists
  if (fs.existsSync("pnpm-lock.yaml")) {
    execute(`git add ${path.join(rootDir, "pnpm-lock.yaml")}`);
  }

  // get new version
  const { version } = getPackageJson();

  // build new commit message
  const msg = `[${version}] ${commit}`;

  // build git command
  const command = `git commit --amend --no-edit --no-verify -q -m '${msg}'`;

  // execute git command
  execute(command);
}

/**
 * Returns true if the commit message already contains an existing
 * bump tag (e.g. [1.0.0])
 * @param commit - commit message
 */
function _hasTag(commit: string): boolean {
  // look for a version tag in the commit message
  const versionRegex = /\[([0-9]+\.){2}[0-9]+\]/;
  return versionRegex.test(commit);
}

/**
 * Returns true if the commit message is a merge commit.
 * @param commit - commit message
 */
function _isMerge(commit: string): boolean {
  // look for a 'Merge' at the beginning of the commit message
  const mergeRegex = /^Merge/;
  return mergeRegex.test(commit);
}

/**
 * Bumps the version of the package.
 */
export function bump() {
  try {
    // throws error if required tools are not installed
    inspectDirectory();

    // get commit
    const commit = getLatestCommit();

    // check if commit is a merge commit
    if (_isMerge(commit)) {
      throw new Error("Bump not needed (merge commit)");
    }

    // check if verison is already bumped
    if (_hasTag(commit)) {
      throw new Error("Bump not needed (already bumped)");
    }

    // get bump type
    const bumpType = getBumpType(commit);

    if (!bumpType) {
      throw new Error("Bump not needed (no bump type)");
    }

    // update project
    updateVersion(bumpType);

    // exit with success
    const { version } = getPackageJson();
    logMessage(`Bumped version to ${version}`);
    exit(0);

  } catch (error) {
    logMessage((error as Error).message || "An error occurred", "error");
    exit(1);
  }
}