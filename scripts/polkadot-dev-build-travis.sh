#!/bin/bash
# ISC, Copyright 2017 Jaco Greeff

set -e

BUMP_VERSION=

function run_check () {
  echo ""
  echo "*** Running checks"

  yarn run check

  echo ""
  echo "*** Checks completed"
}

function run_build () {
  echo ""
  echo "*** Running build"

  yarn run build

  echo ""
  echo "*** Build completed"
}

function run_test () {
  echo ""
  echo "*** Running tests"

  yarn run test

  if [ -f ".coveralls.yml" ]; then
    echo ""
    echo "*** Submitting coverage"

    cat coverage/lcov.info | yarn run coveralls
  fi

  echo ""
  echo "*** Tests completed"
}

function lerna_get_version () {
  LERNA_VERSION=$(cat lerna.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g')
}

function lerna_bump () {
  echo ""
  echo "*** Incrementing lerna version"

  lerna_get_version
  LERNA_VERSION_PRE="$LERNA_VERSION"

  lerna publish --skip-git --skip-npm --yes --cd-version patch
  git add .

  lerna_get_version
  LERNA_VERSION_POST="$LERNA_VERSION"

  echo ""
  echo "*** Lerna increment completed"
}

function npm_bump () {
  echo ""
  echo "*** Incrementing npm version"

  yarn config set version-sign-git-tag false
  yarn config set version-git-tag false
  yarn config set version-git-message "$GIT_MESSAGE"
  yarn version --new-version $BUMP_VERSION
  git add .

  echo ""
  echo "*** Npm increment completed"
}

function npm_setup () {
  echo ""
  echo "*** Setting up npm"

  yarn run makeshift

  echo ""
  echo "*** Npm setup completed"
}

function npm_get_version () {
  NPM_VERSION=$(cat package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g')
}

function npm_publish () {
  if [ ! -f ".npmroot" ]; then
    echo ""
    echo "*** Copying package files to build"

    PUBLISH_BUILD=1
    cp LICENSE README.md package.json build/
    cd build
  fi

  echo ""
  echo "*** Publishing to npm"

  yarn publish --access public --new-version $NPM_VERSION

  echo ""
  echo "*** Npm publish completed"

  if [ -n "$PUBLISH_BUILD" ]; then
    cd ..
  fi
}

function git_setup () {
  echo ""
  echo "*** Setting up GitHub for $TRAVIS_REPO_SLUG"

  git config push.default simple
  git config merge.ours.driver true
  git config user.name "Travis CI"
  git config user.email "$COMMIT_AUTHOR_EMAIL"
  git remote set-url origin https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git > /dev/null 2>&1

  echo ""
  echo "*** Adding build artifacts"

  git checkout $TRAVIS_BRANCH
  git add .

  echo ""
  echo "*** GitHub setup completed"
}

function git_push () {
  echo ""
  echo "*** Pushing to GitHub"

  git commit -m "[CI Skip] $NPM_VERSION"
  git push --quiet origin HEAD:refs/heads/$TRAVIS_BRANCH > /dev/null 2>&1

  echo ""
  echo "*** Github push completed"
}

function git_bump () {
  if [ -f "lerna.json" ]; then
    lerna_bump

    if [ "$LERNA_VERSION_PRE" != "$LERNA_VERSION_POST" ]; then
      BUMP_VERSION="$LERNA_VERSION"
    fi
  else
    BUMP_VERSION="patch"
  fi

  if [ -n "$BUMP_VERSION" ]; then
    npm_bump
  fi
}

function loop_func () {
  FUNC=$1

  if [ -f "lerna.json" ]; then
    PACKAGES=( $(ls -1d packages/*) )

    for PACKAGE in "${PACKAGES[@]}"; do
      echo ""
      echo "*** Executing in $PACKAGE"

      cd $PACKAGE
      $FUNC
      cd ../..
    done
  else
    $FUNC
  fi
}

run_check
run_build
run_test

if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "master" ]; then
  echo ""
  echo "*** Branch check completed"

  exit 0
fi

git_setup
git_bump

if [ -n "$BUMP_VERSION" ]; then
  npm_get_version

  if [ -n "$NPM_TOKEN" ]; then
    npm_setup
    loop_func npm_publish
  fi

  git_push
fi

echo ""
echo "*** CI completed"

exit 0