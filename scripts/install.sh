#!/bin/sh

# install.sh
#
# The purpose of this script is to add `post-comit.sh` to the end of the 
# post-commit git hook (.git/hooks/post-commit). This ensures that the 
# version it can run after every commit. This ensures that the version
# number is bumped before every commit automatically instead of having
# to (remember) to do it manually every time.



# create .git/hooks/post-commit if it doesn't exist
if [ ! -f .git/hooks/post-commit ]; then
  touch .git/hooks/post-commit
fi

# add fist-bump script to .git/hooks/post-commit
cat ./post-commit.sh > .git/hooks/post-commit
echo "[fist-bump] fist-bump installed to .git/hooks/post-commit"