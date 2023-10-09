import type { TagPosition } from "../types";

/**
* Returns true if the text contains any of the keywords provided
* in the pattern of `[keyword]` or `keyword:` where keyword is
* any of the keywords provided.
* 
* @param BUMP_KEYWORDS - list of keywords to check for
* @param text - text to check
* @returns boolean
*/
function hasKeyword(BUMP_KEYWORDS: string[], text: string): boolean {
  // remove leading and trailing whitespace
  const trimmedText = text.trim();

  for (const keyword of BUMP_KEYWORDS) {
    const keywordRegex = new RegExp(`^((\\[\\s*${keyword}\\s*\\])|(\\s*${keyword}\\s*:))`, "i");

    if (keywordRegex.test(trimmedText)) {
      return true;
    }
  }

  return false;
}

/**
 * Returns true if the commit message already contains an existing
 * bump tag. 
 * 
 * For example:
 * - square brackets: [v1.0.0]
 * - parentheses: (v1.0.0)
 * 
 * @param commit - commit message
 */
function hasBumpTag(commit: string): boolean {
  // look for square brackets - [v1.0.0]
  const squareBracket = /\[([vV]?)([0-9]+\.){2}[0-9]+\]/;

  // look for parentheses - (v1.0.0)
  const parentheses = /\(([vV]?)([0-9]+\.){2}[0-9]+\)/;

  return squareBracket.test(commit) || parentheses.test(commit);
}

/**
 * Returns the new commit message based on the bump type.
 * 
 * @param commit - commit message
 * @param version - new version
 * @param config - configuration
 * @param config.position - position of the tag in the commit message (default: "start")
 * @param config.squareBracket - use square brackets instead of parentheses (default: false)
 */
function formatNewCommitMessage(commit: string, version: string, config?: { position?: TagPosition, squareBracket?: boolean }): string {
  const lines = commit.split("\n");
  const tag = config?.squareBracket ? `[v${version}]` : `(v${version})`;

  return lines.map((line, index) => {
    if (index === 0) {
      return config?.position === "end" ? `${line} ${tag}` : `${tag} ${line}`;
    }

    return line;
  }).join("\n");
}

export { hasKeyword, hasBumpTag, formatNewCommitMessage }