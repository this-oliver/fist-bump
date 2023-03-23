#!/usr/bin/env node

/**
 * @description An executable that adds `fistbump` to the git hooks
 * of a project.
 */

import fs from "fs";
import path from "path";
import { getProjectRoot, logMessage } from "./utils";

type GitHook = "pre-commit" | "prepare-commit-msg" | "commit-msg" | "post-commit";

/**
 * Get path to a githook
 */
function getHookPath(hook: GitHook): string {
  const root = getProjectRoot() || process.cwd();

  return path.join(root, ".git", "hooks", hook);
}


/**
 * Add a command to a git hook
 */
function addCommandToHook(hook: GitHook, command: string): void {
  // get file path
  const filePath = getHookPath(hook);

  // add command to hook
  fs.appendFileSync(filePath, command);
}

/**
 * command to run in the git hook
 */
const COMMAND = "npx fistbump";

/**
 * hook to add the command to. 
 * 
 * By default, this is the `prepare-commit-msg` hook because it the 
 * last hook that runs before the commit message created as opposed to
 * the `commit-msg` hook which runs after the commit message is created.
 */
const HOOK = "pre-commit";

try {
  addCommandToHook(HOOK, COMMAND);
} catch (error) {
  const msg = (error as Error).message || `An error occurred while adding fistbump to the ${HOOK} git hook.`;
  logMessage(msg, "error");
}