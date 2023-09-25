#!/usr/bin/env node

import { execute, getProjectRoot } from "./utils";
import { runFistBump } from "./index";

const MAXIMUM_ARGS = 3;

/**
 * Returns true if the user has passed a flag that indicates
 * to install the git hook.
 * 
 * Valid flags:
 * - `-H`
 * - `--hook`
 */
function _isHookSet(): boolean {
  // set hook if a flag `--hook` or `-H` is passed
  const set = process.argv.includes("-H") || process.argv.includes("--hook");

  return set;
}

/**
 * Returns true if invalid argument is passed.
 * 
 * Valid arguments: 
 * - `./lib/cli.js`, 
 * - `./lib/cli.js -H`
 * - `./lib/cli.js --hook`,
 */
function _isInvalidArg(): boolean {
  if (process.argv.length > MAXIMUM_ARGS) {
    return true;
  } else if (process.argv.length === MAXIMUM_ARGS && !_isHookSet()) {
    return true;
  } else {
    return false;
  }
}

// exit if invalid argument is passed
if(_isInvalidArg()) {
  console.error("Invalid argument passed. Only `--hook` or `-H` is allowed.");
  process.exit(1);
}

// install hook if flag is passed
else if(_isHookSet()) {
  const rootDir = getProjectRoot() || process.cwd();
  const scriptPath = `${rootDir}/scripts/install.sh`;
  execute(`chmod +x ${scriptPath}`);
}

// run fist-bump
else {
  runFistBump();
}