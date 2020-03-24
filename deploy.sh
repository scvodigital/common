#!/usr/bin/env bash

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")
BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPO=$(basename `git rev-parse --show-toplevel`)
PINK='\033[1;35m'
RED='\033[0;31m'
NC='\033[0m'

if [ "$BRANCH" != "development" ]; then
  echo -e "${RED}CANNOT DEPLOY: You can only deploy from the 'development' branch${NC}"
elif [[ `git status --porcelain` ]]; then
  echo -e "${RED}CANNOT DEPLOY: There are local changes${NC}"
elif [ $LOCAL = $REMOTE ]; then
  echo -e "${PINK}DEPLOYING${NC}"
  echo -e "${PINK}STEP 0 of 7: Hold on to your butts${NC}"
  echo -e "${PINK}STEP 1 of 7: Cleaning .travis.yml of any old encryption tasks${NC}"
  sed -i.bak '/before_install:/,/install:/{//p;d;}' .travis.yml
  rm .travis.yml.bak
  echo -e "${PINK}STEP 2 of 7: Encrypting secret.json${NC}"
  travis encrypt-file secret.json --add --force --pro
  echo -e "${PINK}STEP 3 of 7: Committing encrypted secret and updated Travis config to Git${NC}"
  git add secret.json.enc .travis.yml
  git commit -m "Updated secret.json"
  echo -e "${PINK}STEP 4 of 7: Bumping package version number and generating Git tag${NC}"
  npm version patch
  echo -e "${PINK}STEP 5 of 7: Pushing all previous changes to 'development' branch${NC}"
  git push
  echo -e "${PINK}STEP 6 of 7: Bringing 'production' branch up-to-date with 'development'${NC}"
  git checkout production
  git pull
  git pull origin development
  git push
  echo -e "${PINK}STEP 7 of 7: Navigating back to 'development'${NC}"
  git checkout development
  echo -e "${PINK}FINISHED LOCAL DEPLOYMENT TASKS${NC}"
  echo -e "${PINK}Navigate to https://travis-ci.com/github/scvodigital/$REPO to watch your deployment in the cloud!${NC}"
elif [ $LOCAL = $BASE ]; then
  echo -e "${RED}CANNOT DEPLOY: Need to pull${NC}"
elif [ $REMOTE = $BASE ]; then
  echo -e "${RED}CANNOT DEPLOY: Need to push${NC}"
else
  echo -e "${RED}CANNOT DEPLOY: Diverged${NC}"
fi