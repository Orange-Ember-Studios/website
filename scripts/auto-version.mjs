import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Automates semantic versioning before git push.
 * Always bumps 'patch' version unless manually specified.
 */

try {
  // 1. Ensure we are on a clean state (optional, but recommended)
  // const status = execSync('git status --porcelain').toString().trim();
  // if (status) {
  //   console.error('❌ Please commit your changes before pushing.');
  //   process.exit(1);
  // }

  // 2. Prevent infinite loops: Check if the last commit was a version bump
  // Standard-version uses "chore(release): X.X.X" by default
  const lastCommitMsg = execSync('git log -1 --pretty=%B').toString().trim();
  if (lastCommitMsg.includes('chore(release):')) {
    console.log('✅ Version already bumped by standard-version. Skipping.');
    process.exit(0);
  }

  console.log(`🚀 Analyzing commits and bumping version with standard-version...`);

  // 3. Run standard-version
  // This will:
  // - Look at commit history since last tag
  // - Decide if it's patch, minor or major
  // - Update package.json
  // - Update/Create CHANGELOG.md
  // - Commit the changes and tag it
  execSync('npx standard-version');

  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const newPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const newVersion = newPkg.version;

  console.log(`✨ Version bumped, CHANGELOG updated and tagged: v${newVersion}`);
  console.log(`📢 Important: New commits and tags were created locally.`);
  console.log(`📢 ACTION REQUIRED: Please run "git push --follow-tags" to upload the release.`);
  
  // Stop the current push so the user can push the new version-commit/tag
  process.exit(1);

} catch (error) {
  console.error('❌ Error during auto-versioning:', error.message);
  process.exit(1);
}
