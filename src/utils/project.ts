import fs from "fs";
import path from "path";

/**
 * Returns the path to the root directory of the project (where the package.json is located).
 * This function assumes that it is in the node_modules directory of the project
 * and will need to go up one directory at a time until it finds the package.json.
 * 
 * @param directory - directory to start from (default: process.cwd())
 * @returns string
 */
export function getProjectRoot(directory = process.cwd(), depth = 0): string | undefined {
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