import { expect } from "chai";
import { hasKeyword, hasBumpTag, formatNewCommitMessage } from "../../src/utils/commit";
import { BUMP_KEYWORDS } from "../../src/config";

describe("utils/commit.ts", () => {

  describe("hasKeyword()", () => {
    const patch: { valid: string[], invalid: string[] } = { valid: [], invalid: [] };
    const minor: { valid: string[], invalid: string[] } = { valid: [], invalid: [] };
    const major: { valid: string[], invalid: string[] } = { valid: [], invalid: [] };

    before(() => {
      const baseMessage = "does a thing";
      
      for(const key in BUMP_KEYWORDS) {
        const valid: string[] = [];
        const invalid: string[] = [];

        for(const keyword of BUMP_KEYWORDS[key as keyof typeof BUMP_KEYWORDS]) {
          // valid because keyword is at start and before colon
          valid.push(`${keyword}: ${baseMessage}`);
          // valid because keyword is at start and in square brackets
          valid.push(`[${keyword}] ${baseMessage}`);
          // valid because keyword is at start and in square brackets
          valid.push(`[${keyword}]: ${baseMessage}`);

          // invalid because keyword is not in square brackets AND not before colon
          invalid.push(`${keyword} ${baseMessage}`);
          // invalid because keyword is not at start
          invalid.push(`${baseMessage} [${keyword}]`);
        }

        switch(key) {
        case "PATCH":
          patch.valid = valid;
          patch.invalid = invalid;
          break;
        case "MINOR":
          minor.valid = valid;
          minor.invalid = invalid;
          break;
        case "MAJOR":
          major.valid = valid;
          major.invalid = invalid;
          break;
        }
        
      }
    });

    it("should return true if the text contains any of the keywords provided for patch bump", () => {
      for(const commit of patch.valid) {
        expect(hasKeyword(BUMP_KEYWORDS.PATCH, commit), `expected '${commit}' to pass`).to.be.true;
      }
    });

    it("should return false if the text does not contain any of the keywords provided for patch bump", () => {
      for(const commit of patch.invalid) {
        expect(hasKeyword(BUMP_KEYWORDS.PATCH, commit), `expected '${commit}' to fail`).to.be.false;
      }
    });

    it("should return true if the text contains any of the keywords provided for minor bump", () => {
      for(const commit of minor.valid) {
        expect(hasKeyword(BUMP_KEYWORDS.MINOR, commit), `expected '${commit}' to pass`).to.be.true;
      }
    });

    it("should return false if the text does not contain any of the keywords provided for minor bump", () => {
      for(const commit of minor.invalid) {
        expect(hasKeyword(BUMP_KEYWORDS.MINOR, commit), `expected '${commit}' to fail`).to.be.false;
      }
    });

    it("should return true if the text contains any of the keywords provided for major bump", () => {
      for(const commit of major.valid) {
        expect(hasKeyword(BUMP_KEYWORDS.MAJOR, commit), `expected '${commit}' to pass`).to.be.true;
      }
    });

    it("should return false if the text does not contain any of the keywords provided for major bump", () => {
      for(const commit of major.invalid) {
        expect(hasKeyword(BUMP_KEYWORDS.MAJOR, commit), `expected '${commit}' to fail`).to.be.false;
      }
    });
  });

  describe("hasBumpTag()", () => {
    const commitsWithBumpTags: string[] = [];
    const commitsWithoutBumpTags: string[] = [];
    
    before(() => {
      const baseMessage = "does a thing";
      // valid bump tags are [1.0.0] and (v1.0.0)
      const validTags: string[] = [
        "(1.0.0)",
        "(v1.0.0)",
        "[1.0.0]",
        "[v1.0.0]"
      ]
      
      const invalidTags: string[] = [
        // invalid because missing 3rd version number
        "(1.0)",
        // invalid because missing 3rd version numbers
        "[v1.0]", 
        // invalid because missing square brackets and parentheses
        "v1.0.0"
      ];
      
      for(const key in BUMP_KEYWORDS) {
        for(const keyword of BUMP_KEYWORDS[key as keyof typeof BUMP_KEYWORDS]) {
          
          for(const tag of validTags) {
            commitsWithBumpTags.push(`${tag} ${keyword}: ${baseMessage}`);
            commitsWithBumpTags.push(`${tag} [${keyword}]: ${baseMessage}`);
            commitsWithBumpTags.push(`${keyword}: ${baseMessage} ${tag}`);
            commitsWithBumpTags.push(`[${keyword}]: ${baseMessage} ${tag}`);
          }

          for(const tag of invalidTags) {
            commitsWithoutBumpTags.push(`${keyword}: ${baseMessage} ${tag}`);
            commitsWithoutBumpTags.push(`[${keyword}]: ${baseMessage} ${tag}`);
            commitsWithoutBumpTags.push(`${tag} ${keyword}: ${baseMessage}`);
            commitsWithoutBumpTags.push(`${tag} [${keyword}]: ${baseMessage}`);
          }
        }
      }
    });
    
    it("should return true if the commit message already contains an existing bump tag", () => {
      for(const commit of commitsWithBumpTags) {
        expect(hasBumpTag(commit), `expected '${commit}' to pass`).to.be.true;
      }
    });

    it("should return false if the commit message does not contain an existing bump tag", () => {
      for(const commit of commitsWithoutBumpTags) {
        expect(hasBumpTag(commit), `expected '${commit}' to fail`).to.be.false;
      }
    });

  });

  describe("formatNewCommitMessage()", () => {

    const version = "1.0.0";
    const patch: string[] = [];
    const minor: string[] = [];
    const major: string[] = [];

    before(() => {
      const baseMessage = "does a thing";
      
      for(const key in BUMP_KEYWORDS) {
        const valid: string[] = [];

        for(const keyword of BUMP_KEYWORDS[key as keyof typeof BUMP_KEYWORDS]) {
          // valid because keyword is at start and before colon
          valid.push(`${keyword}: ${baseMessage}`);
          // valid because keyword is at start and in square brackets
          valid.push(`[${keyword}] ${baseMessage}`);
          // valid because keyword is at start and in square brackets
          valid.push(`[${keyword}]: ${baseMessage}`);
        }

        switch(key) {
        case "PATCH":
          patch.push(...valid);
          break;
        case "MINOR":
          minor.push(...valid);
          break;
        case "MAJOR":
          major.push(...valid);
          break;
        }
        
      }
    });

    it("should return msg with tag in brackets at start of header for default settings", () => {
      for(const commit of [ ...patch, ...minor, ...major ]) {
        expect(formatNewCommitMessage(commit, version), `expected '${commit}' to pass`).to.equal(`(v${version}) ${commit}`);
      }
    });

    it("should return msg with tag in square brackets if 'squareBrackets' config is true", () => {
      for(const commit of [ ...patch, ...minor, ...major ]) {
        expect(formatNewCommitMessage(commit, version, { squareBracket: true }), `expected '${commit}' to pass`).to.equal(`[v${version}] ${commit}`);
      }
    });

    it("should return msg with tag at end of header if position is 'end'", () => {
      for(const commit of [ ...patch, ...minor, ...major ]) {
        expect(formatNewCommitMessage(commit, version, { position: "end" }), `expected '${commit}' to pass`).to.equal(`${commit} (v${version})`);
      }
    });
    
    it("should return msg with tag in square brackets at end of header if position is 'end' and squareBrackets is true", () => {
      for(const commit of [ ...patch, ...minor, ...major ]) {
        expect(formatNewCommitMessage(commit, version, { position: "end", squareBracket: true }), `expected '${commit}' to pass`).to.equal(`${commit} [v${version}]`);
      }
    });

    it("should support multiline commit messages", () => {
      for(const commit of [ ...patch, ...minor, ...major ]) {
        
        const multilineCommit = `${commit}\n\nthis is a multiline commit message`;
        let expected = `(v${version}) ${commit}\n\nthis is a multiline commit message`;
        expect(formatNewCommitMessage(multilineCommit, version)).to.equal(expected);
        
        expected = `[v${version}] ${commit}\n\nthis is a multiline commit message`;
        expect(formatNewCommitMessage(multilineCommit, version, { squareBracket: true })).to.equal(expected);

        expected = `${commit} (v${version})\n\nthis is a multiline commit message`;
        expect(formatNewCommitMessage(multilineCommit, version, { position: "end" })).to.equal(expected);
        
        expected = `${commit} [v${version}]\n\nthis is a multiline commit message`;
        expect(formatNewCommitMessage(multilineCommit, version, { position: "end", squareBracket: true })).to.equal(expected);
      }
    });
  });
});