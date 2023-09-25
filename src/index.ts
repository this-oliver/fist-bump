#!/usr/bin/env node

import { execute, getProjectRoot, logMessage } from "./utils";
import { bump } from "./bump";

const FLAG = {
  INSTALL: [ "-I", "--install" ],
  UNINSTALL: [ "-U", "--uninstall" ]
}

const MAXIMUM_ARGS = 3;

/**
 * Returns true if a string is in the args
 * 
 * @param string - sample arg
 * @returns boolean
 */
function _inArgs(string: string): boolean {
  return process.argv.includes(string)
}

/**
 * Returns true if the install flag has been passed
 * 
 * Valid flags:
 * - `-I`
 * - `--install`
 */
function _isInstall(): boolean {
  let set = false;

  for(const flag of FLAG.INSTALL){
    if(_inArgs(flag)){
      set = true;
      break;
    }
  }
  
  return set;
}

/**
 * Returns true if the uninstall flag has been passed.
 * 
 * Valid flags:
 * - `-U`
 * - `--uninstall`
 */
function _isUninstall(): boolean {
  let set = false;

  for(const flag of FLAG.UNINSTALL){
    if(_inArgs(flag)){
      set = true;
      break;
    }
  }
  
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
  } else if (process.argv.length === MAXIMUM_ARGS && !(_isInstall() || _isUninstall())) {
    return true;
  } else {
    return false;
  }
}

/**
 * Runs a script to install/uninstall a command that executes the
 * fist-bump command when the post-commit git hook is triggered.
 * 
 * @param type - `install` or `uninstall`
 * @param silent - if true, the script will not log any messages (default: false)
 */
function _executeHookScript(type: "install" | "uninstall"): void {
  const rootDir = getProjectRoot() || process.cwd();
  const scriptPath = `${rootDir}/scripts/${type}.sh`;
  
  try {
    execute(`chmod +x ${scriptPath}`);
    execute(`${scriptPath}`);
  } catch (error) {
    logMessage(`Failed to ${type} git hook. ${error}`, "error");
  }
}

if(_isInvalidArg()) {
  logMessage("Invalid argument passed. Only `--hook` or `-H` is allowed.", "error")
  process.exit(1);
} else if(_isInstall()) {
  _executeHookScript("install");
  logMessage("Git hook installed successfully.");
} else if(_isUninstall()) {
  _executeHookScript("uninstall");
  logMessage("Git hook uninstalled successfully.");
} else {
  bump();
}
