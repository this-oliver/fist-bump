#!/bin/sh

# install.sh
#
# The purpose of this script is to add `post-commit.sh` to the end of the 
# post-commit git hook (.git/hooks/post-commit). This ensures that the 
# version it can run after every commit. This ensures that the version
# number is bumped before every commit automatically instead of having
# to (remember) to do it manually every time.

DELIMITER_START="# BEGIN FISTBUMP"
DELIMITER_END="# END FISTBUMP"

# get root directory of project
root_dir=$(git rev-parse --show-toplevel)

# create .git/hooks/post-commit if it doesn't exist
if [ ! -f "$root_dir/.git/hooks/post-commit" ]; then
  touch "$root_dir/.git/hooks/post-commit"
  echo "[fist-bump] .git/hooks/post-commit created"
fi

# get contents of post-commit.sh (minus the shebang)
post_commit=$(tail -n +2 "$root_dir/scripts/hooks/post-commit.sh")

# wrap contents in a delimiter comment (BEGIN/END FISTBUMP)
content="$DELIMITER_START\n$post_commit\n$DELIMITER_END"

# exit with success if hook has a delimiter comment
if grep -q "$DELIMITER_START" "$root_dir/.git/hooks/post-commit"; then
  echo "[fist-bump] fist-bump already installed to .git/hooks/post-commit"
  exit 0
fi

# add contents of post-commit.sh to the end of .git/hooks/post-commit
# overwrite .git/hooks/post-commit with extracted content
if echo "$content" >> "$root_dir/.git/hooks/post-commit"; then
    echo "[fist-bump] fist-bump added to .git/hooks/post-commit"
else
    echo "[fist-bump] Error: Failed to write to .git/hooks/post-commit (use sudo)"
    exit 1
fi
