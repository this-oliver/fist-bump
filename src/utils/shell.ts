import shell from "shelljs";

// exit if any command fails
shell.config.fatal = true;

/**
 * Returns true if the module is installed
 * 
 * @param name - name of the module to check for
 * @returns boolean
 */
function hasModule(name: string): boolean {
  return shell.which(name) !== null;
}

interface ExecuteOptions {
  /**
   * If true, the command will not be logged to the console
   */
  silent?: boolean;
}
/**
 * Executes a shell command and returns the result
 */
function execute(command: string, options?: ExecuteOptions): string {

  // default to silent
  return shell.exec(command, { silent: options?.silent ?? true }).stdout;
}

/**
 * Exits the process with a status code
 * 
 * @param code - status code
 */
function exit(code: number): void {
  shell.exit(code);
}

export { hasModule, execute, exit }