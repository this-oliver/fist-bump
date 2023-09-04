import fs from "fs";
import path from "path";
import { BUMP_KEYWORDS } from "./config";
import {
  logMessage,
  hasModule,
  execute,
  exit
} from "./utils"

type TagPosition = "start" | "end";

/**
 * Configuration for fistbump.
 */
interface FistBumpConfig {
  /**
   * Custom keywords for patch bumps.
   */
  patch: string[];
  /**
   * Custom keywords for minor bumps.
   */
  minor: string[];
  /**
   * Custom keywords for major bumps.
   */
  major: string[];
  /**
   * position of the tag in the commit message
   */
  position: TagPosition;
}

/**
 * Represents `package.json` file as an object.
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
 * Bump type.
 * 
 * - patch: 1.0.0 -> 1.0.1
 * - minor: 1.0.0 -> 1.1.0
 * - major: 1.0.0 -> 2.0.0
 */
type BumpType = "patch" | "minor" | "major";

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
 * Returns the bump type based on the commit message.
 * Possible values are 'patch', 'minor', or 'major'.
 * 
 * @param commit - commit message
 * @returns string
 */
function getBumpType(commit: string): BumpType | undefined {
  const config: FistBumpConfig = getFistBumpConfig();

  if (_hasKeyword(config.patch, commit)) {
    return "patch";
  } else if (_hasKeyword(config.minor, commit)) {
    return "minor";
  } else if (_hasKeyword(config.major, commit)) {
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
 * Returns the new commit message based on the bump type.
 * 
 * @param commit - commit message
 * @param version - new version
 * @param tagFirst - place tage at the beginning of the commit message
 */
function _formatNewCommitMessage(commit: string, version: string, config: { position: TagPosition }): string {
  const lines = commit.split("\n");

  return lines.map((line, index) => {
    if (index === 0) {
      return config.position === "end" ? `${line} (v${version})` : `(v${version}) ${line}`;
    }

    return line;
  }).join("\n");
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

  // get fistbump config
  const fistbump: FistBumpConfig = getFistBumpConfig();

  // build new commit message
  const msg = _formatNewCommitMessage(commit, version, { position: fistbump.position });

  // build git command
  const command = `git commit --amend --no-edit --no-verify -q -m '${msg}'`;

  // execute git command
  execute(command);
}

/**
 * Returns true if the commit message already contains an existing
 * bump tag. 
 * 
 * For example:
 * - square brackets: [1.0.0]
 * - parentheses: (v1.0.0)
 * 
 * @param commit - commit message
 */
function _hasTag(commit: string): boolean {
  // look for square brackets - [1.0.0]
  const squareBracket = /\[([0-9]+\.){2}[0-9]+\]/;

  // look for parentheses - (v1.0.0)
  const parentheses = /\(([vV]?)([0-9]+\.){2}[0-9]+\)/;

  return squareBracket.test(commit) || parentheses.test(commit);
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