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

# get root directory of project
root_dir=$(git rev-parse --show-toplevel)

# function to remove the flag environment variable
cleanup() {
    unset FIST_BUMP
}

# set a trap to always cleanup on exit
trap cleanup EXIT

# Only run if the environment variable is not set
if [ "$FIST_BUMP" != "1" ]; then
    
    # run fist-bump
    ./lib/index.js

    # set environment variable
    export FIST_BUMP=1

    # amend the commit with the changes made by your script
    git commit --amend --no-edit
fi
