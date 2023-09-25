import shell from "shelljs";

// exit if any command fails
shell.config.fatal = true;

/**
 * Returns true if the module is installed
 * 
 * @param name - name of the module to check for
 * @returns boolean
 */
export function hasModule(name: string): boolean {
  return shell.which(name) !== null;
}


interface ExecuteOptions {
  /**
   * If true, the command will not be logged to the console
   */
  silent?: boolean;

  /**
   * Exit the process if the command fails
   */
  fatal?: boolean;
}
/**
 * Executes a shell command and returns the result
 */
export function execute(command: string, options?: ExecuteOptions): string {

  let output: string;

  try {
    // default to silent
    output = shell.exec(command, { silent: options?.silent ?? true, fatal: options?.fatal ?? false }).stdout;
  } catch (error) {
    if((error as Error).message.includes("Permission denied")){
      throw new Error("Permission denied. Try running the command with sudo.");
    }

    throw error;
  }

  return output;

}

/**
 * Exits the process with a status code
 * 
 * @param code - status code
 */
export function exit(code: number): void {
  shell.exit(code);
}