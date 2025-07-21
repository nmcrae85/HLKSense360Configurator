#!/bin/bash
# Script to bump version and update changelog

# Get current version from config.yaml
CURRENT_VERSION=$(grep "^version:" hlk2450-configurator/config.yaml | cut -d'"' -f2)
echo "Current version: $CURRENT_VERSION"

# Parse version components
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Determine version bump type
if [ "$1" == "major" ]; then
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
elif [ "$1" == "minor" ]; then
    MINOR=$((MINOR + 1))
    PATCH=0
elif [ "$1" == "patch" ] || [ -z "$1" ]; then
    PATCH=$((PATCH + 1))
else
    echo "Usage: $0 [major|minor|patch]"
    exit 1
fi

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "New version: $NEW_VERSION"

# Update config.yaml
sed -i "s/version: \"$CURRENT_VERSION\"/version: \"$NEW_VERSION\"/" hlk2450-configurator/config.yaml

# Update changelog
DATE=$(date +%Y-%m-%d)
sed -i "/## \[Unreleased\]/a\\\n## [$NEW_VERSION] - $DATE" hlk2450-configurator/CHANGELOG.md

echo "Version bumped to $NEW_VERSION"
echo "Don't forget to:"
echo "1. Update CHANGELOG.md with your changes"
echo "2. Commit: git commit -m \"Release v$NEW_VERSION: Your description\""
echo "3. Push: git push"