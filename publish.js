#!/usr/bin/env node

/**
 * Auto-version increment and publish script for NPM
 *
 * This script automatically increments the version number in package.json
 * and publishes the package to NPM.
 *
 * Usage:
 *   node publish.js [patch|minor|major]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get version increment type from command line argument
const versionType = process.argv[2] || 'patch';

// Validate version type
if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

try {
  // Read current package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  console.log(`Current version: ${packageJson.version}`);

  // Run npm version to increment the version
  console.log(`Incrementing ${versionType} version...`);
  execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: 'inherit' });

  // Read updated package.json to get the new version
  const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log(`New version: ${updatedPackageJson.version}`);

  // Publish to npm
  console.log('Publishing to npm...');

  // Use --access=public for scoped packages
  const isScoped = updatedPackageJson.name.startsWith('@');
  const publishCommand = isScoped
    ? 'npm publish --access=public'
    : 'npm publish';

  execSync(publishCommand, { stdio: 'inherit' });

  console.log(`Successfully published ${updatedPackageJson.name}@${updatedPackageJson.version}`);

  // Create git tag and push if in a git repository
  try {
    // Check if .git directory exists
    if (fs.existsSync(path.join(__dirname, '.git'))) {
      console.log('Creating git tag...');
      execSync(`git tag v${updatedPackageJson.version}`, { stdio: 'inherit' });
      console.log('Pushing git tag...');
      execSync(`git push origin v${updatedPackageJson.version}`, { stdio: 'inherit' });
    }
  } catch (gitError) {
    console.warn('Warning: Could not create or push git tag:', gitError.message);
  }

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}