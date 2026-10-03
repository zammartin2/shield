#!/bin/bash
# Релиз FAB Shield.
# ВАЖНО: пуш идёт ТОЛЬКО в локальный GitLab (remote `lab`), в GitHub — никогда.
set -euo pipefail

VERSION=${1:-}
if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version>"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "📦 Releasing version $VERSION"

# package.json + package-lock.json (root version)
npm version "$VERSION" --no-git-tag-version

# fab.json npm version не трогает
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" fab.json

# SHIELD_VERSION иначе разойдётся с package.json и уронит тесты getVersion()
sed -i "s/const SHIELD_VERSION = '[^']*'/const SHIELD_VERSION = '$VERSION'/" src/core/FABShield.ts

for f in package.json fab.json src/core/FABShield.ts; do
  if ! grep -q "$VERSION" "$f"; then
    echo "❌ $f не содержит $VERSION" >&2
    exit 1
  fi
done

npm run lint
npm run type-check
npm run test:coverage
npm run build

git add package.json package-lock.json fab.json src/core/FABShield.ts CHANGELOG.md
git commit -m "Release $VERSION"
git tag -a "v$VERSION" -m "Release $VERSION"
git push lab main
git push lab "v$VERSION"
echo "✅ Release $VERSION complete!"
