import fs from "fs";
import path from "path";
import { BUMP_KEYWORDS } from "./config";
import {
  getProjectRoot,
  getPackageJson,
  getLatestCommit,
  isValidRepository,
  isMergeCommit,
  logMessage,
  execute,
  exit
} from "./utils"
import type {
  FistBumpConfig,
  BumpType,
  TagPosition 
} from "./types";

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
 * Updates the package.json file with the new version, adds the
 * `package.json` and `package-lock.json`/`pnpm-lock.yaml` to the git staging area,
 * and amends the commit message.
 * 
 * @param bumpType - bump type
 */
function bumpVersion(bumpType: BumpType): void {
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

  // build command
  const command = `git commit --amend --no-edit --no-verify -q -m '${msg}'`;

  // execute
  execute(command);
}

/**
 * Searches for the latest commit in a reposiroty and bumps 
 * the version of the project if the commit message contains
 * a bump keyword.
 */
function runFistBump() {
  try {
    // throws error if required tools are not installed
    isValidRepository();

    // get commit
    const commit = getLatestCommit();

    // check if commit is a merge commit
    if (isMergeCommit(commit)) {
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
    bumpVersion(bumpType);

    // exit with success
    const { version } = getPackageJson();
    logMessage(`Bumped version to ${version}`);
    exit(0);

  } catch (error) {
    logMessage((error as Error).message || "An error occurred", "error");
    exit(1);
  }
}

export { runFistBump }