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
 * Bump type.
 * 
 * - patch: 1.0.0 -> 1.0.1
 * - minor: 1.0.0 -> 1.1.0
 * - major: 1.0.0 -> 2.0.0
 */
type BumpType = "patch" | "minor" | "major";

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

export {
  BumpType,
  FistBumpConfig,
  Package,
  TagPosition
}