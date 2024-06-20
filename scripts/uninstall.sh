#!/bin/sh

# uninstall.sh
#
# The purpose of this script is to remove the `post-commit.sh` 
# script from the `post-commit` git hook.

DELIMITER_START="# BEGIN FISTBUMP"
DELIMITER_END="# END FISTBUMP"

# get root directory of project
root_dir=$(git rev-parse --show-toplevel)

# get contents of .git/hooks/post-commit
hook=$(cat "$root_dir/.git/hooks/post-commit")

# get post-commit.sh content
post_commit=$(tail -n +2 "$root_dir/scripts/hooks/post-commit.sh")

# exit with success if hook doesn't have a delimiter comment
if ! grep -q "$DELIMITER_START" "$root_dir/.git/hooks/post-commit"; then
  echo "[fist-bump] fist-bump not installed to .git/hooks/post-commit"
  exit 0
fi

# get contents of .git/hooks/post-commit excluding fist-bump content
content=$(echo "$hook" | sed "/$DELIMITER_START/,/$DELIMITER_END/d")

# overwrite .git/hooks/post-commit with extracted content
if echo "$content" > "$root_dir/.git/hooks/post-commit"; then
    echo "[fist-bump] fist-bump removed from .git/hooks/post-commit"
else
    echo "[fist-bump] Error: Failed to write to .git/hooks/post-commit (use sudo)"
    exit 1
fi