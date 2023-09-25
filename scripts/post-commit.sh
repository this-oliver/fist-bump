#!/bin/sh

# post-commit.sh
#
# The purpose of this script is to add `fist-bump` to git hooks. This ensures that
# the version number is bumped before every commit automatically instead of having
# to (remember) to do it manually every time.
#
# how does it work?
# 
# The script adds `fist-bump` to the `post-commit` git hook. However, in order to 
# avoid an infinite loop, the script sets checks for an env var called `FIST_BUMP`
# (which is set after the first `post-commit` hook call) prior to running
# `fist-bump`. If the env var is set, `fist-bump` will not run.

# Check if the environment variable BUMP_VERSION_DONE is set to 1
if [ "$FIST_BUMP" != "1" ]; then
    # If it's not set or not equal to 1, then run your package/script
    ./lib/cli.js

    # Set the flag to prevent the loop
    export BUMP_VERSION_DONE=1

    # Amend the commit with the changes made by your script
    git commit --amend --no-edit
fi