#!/usr/bin/env bash

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")
BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPO=$(basename `git rev-parse --show-toplevel`)

if [ "$BRANCH" != "development" ]; then
  echo "CANNOT DEPLOY: You can only deploy from the 'development' branch"
elif [[ `git status --porcelain` ]]; then
  echo "CANNOT DEPLOY: There are local changes"
elif [ $LOCAL = $REMOTE ]; then
  echo "DEPLOYING"
  echo "STEP 0 of 7: Hold on to your butts"
  echo "STEP 1 of 7: Cleaning .travis.yml of any old encryption tasks"
  sed -i.bak '/before_install:/,/install:/{//p;d;}' .travis.yml
  echo "STEP 2 of 7: Encrypting secret.json"
  travis encrypt-file secret.json --add --force
  echo "STEP 3 of 7: Committing encrypted secret and updated Travis config to Git"
  git add secret.json.enc .travis.yml
  git commit -m "Updated secret.json"
  echo "STEP 4 of 7: Bumping package version number and generating Git tag"
  npm version patch
  echo "STEP 5 of 7: Pushing all previous changes to 'development' branch"
  git push
  echo "STEP 6 of 7: Bringing 'production' branch up-to-date with 'development'"
  git checkout production
  git pull
  git pull origin development
  git push
  echo "STEP 7 of 7: Navigating back to 'development'"
  git checkout development
  echo "FINISHED LOCAL DEPLOYMENT TASKS"
  echo "Navigate to https://travis-ci.org/scvodigital/$REPO to watch your deployment in the cloud!"
elif [ $LOCAL = $BASE ]; then
  echo "CANNOT DEPLOY: Need to pull"
elif [ $REMOTE = $BASE ]; then
  echo "CANNOT DEPLOY: Need to push"
else
  echo "CANNOT DEPLOY: Diverged"
fi