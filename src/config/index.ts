/**
 * Package name.
 */
export const PACKAGE_NAME = "fist-bump";

/**
 * Default keywords for bumping.
 */
export const BUMP_KEYWORDS = {
  PATCH: [ "fix", "patch" ],
  MINOR: [ "feature", "config", "minor" ],
  MAJOR: [ "breaking", "major", "release" ]
}

/**
 * Keywords to skip bumping.
 */
export const SKIP_KEYWORDS = [ "skip", "wip" ];