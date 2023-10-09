/**
 * Package name.
 */
const PACKAGE_NAME = "fist-bump";

/**
 * Default keywords for bumping.
 */
const BUMP_KEYWORDS = {
  PATCH: [ "fix", "patch" ],
  MINOR: [ "feature", "config", "minor" ],
  MAJOR: [ "breaking", "major", "release" ]
}

/**
 * Keywords to skip bumping.
 */
const SKIP_KEYWORDS = [ "skip", "wip" ];

export { PACKAGE_NAME, BUMP_KEYWORDS, SKIP_KEYWORDS }