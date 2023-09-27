import fs from "fs";
import path from "path";
import { BUMP_KEYWORDS, SKIP_KEYWORDS } from "./config";
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
  // remove leading and trailing whitespace
  const trimmedText = text.trim();

  for (const keyword of BUMP_KEYWORDS) {
    const keywordRegex = new RegExp(`^((\\[\\s*${keyword}\\s*\\])|(\\s*${keyword}\\s*:))`, "i");

    if (keywordRegex.test(trimmedText)) {
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
function _hasBumpTag(commit: string): boolean {
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
  const config: FistBumpConfig = getFistBumpConfig();
  
  try {
    // throws error if required tools are not installed
    isValidRepository();

    // get commit
    const commit = getLatestCommit();

    // check if commit is a merge commit
    if (isMergeCommit(commit)) {
      throw new Error("Bump not needed (merge commit)");
    }

    // check if commit contains a skip keyword
    if (_hasKeyword(SKIP_KEYWORDS, commit)) {
      throw new Error("Bump not needed (skip keyword found)");
    }

    // check if verison is already bumped
    if (_hasBumpTag(commit)) {
      throw new Error("Bump not needed (already bumped)");
    }

    // get bump type
    let bumpType: BumpType;

    if (_hasKeyword(config.patch, commit)) {
      bumpType = "patch";
    } else if (_hasKeyword(config.minor, commit)) {
      bumpType = "minor";
    } else if (_hasKeyword(config.major, commit)) {
      bumpType = "major";
    } else {
      throw new Error("Keyword not found");
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