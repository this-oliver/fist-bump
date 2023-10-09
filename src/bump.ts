import fs from "fs";
import path from "path";
import { SKIP_KEYWORDS } from "./config";
import { execute, exit } from "./utils/shell";
import { logMessage } from "./utils/log";
import { getFistBumpConfig, getProjectRoot, getPackageJson, getLatestCommit, isMergeCommit, isGitRepo, isNpmRepo } from "./utils/repository";
import { hasKeyword, hasBumpTag, formatNewCommitMessage } from "./utils/commit";
import type { FistBumpConfig, BumpType } from "./types";

/**
 * Updates the package.json file with the new version, adds the
 * `package.json` and `package-lock.json`/`pnpm-lock.yaml` to the git staging area,
 * and amends the commit message.
 * 
 * @param bumpType - bump type
 */
function updateVersion(bumpType: BumpType): void {
  const commit = getLatestCommit();
  const rootDir: string = getProjectRoot() || process.cwd();

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
  const msg: string = formatNewCommitMessage(commit, version, { position: fistbump.position });

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
function bump() {
  const config: FistBumpConfig = getFistBumpConfig();
  
  try {
    if (!isGitRepo()) {
      throw new Error("Sorry, this script requires git");
    }
    
    if (!isNpmRepo()) {
      throw new Error("Sorry, this script requires npm or pnpm");
    }

    // get commit
    const commit: string = getLatestCommit();

    // check if commit is a merge commit
    if (isMergeCommit(commit)) {
      throw new Error("Bump not needed (merge commit)");
    }

    // check if commit contains a skip keyword
    if (hasKeyword(SKIP_KEYWORDS, commit)) {
      throw new Error("Bump not needed (skip keyword found)");
    }

    // check if verison is already bumped
    if (hasBumpTag(commit)) {
      throw new Error("Bump not needed (already bumped)");
    }

    // get bump type
    let bumpType: BumpType;

    if (hasKeyword(config.patch, commit)) {
      bumpType = "patch";
    } else if (hasKeyword(config.minor, commit)) {
      bumpType = "minor";
    } else if (hasKeyword(config.major, commit)) {
      bumpType = "major";
    } else {
      throw new Error("Keyword not found");
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

export { bump }