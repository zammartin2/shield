#!/bin/bash
VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version>"
  exit 1
fi

echo "📦 Releasing version $VERSION"
npm version $VERSION --no-git-tag-version
npm run build
npm test
git add package.json CHANGELOG.md
git commit -m "Release $VERSION"
git tag -a "v$VERSION" -m "Release $VERSION"
git push origin main
git push origin "v$VERSION"
echo "✅ Release $VERSION complete!"
