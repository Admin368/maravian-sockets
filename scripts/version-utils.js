#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Utility functions for managing documentation versions
 */

/**
 * Compare two semantic version strings
 * @param {string} a - First version (e.g., '1.2.3')
 * @param {string} b - Second version (e.g., '1.2.4')
 * @returns {number} - Negative if a < b, positive if a > b, zero if equal
 */
function compareVersions(a, b) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  const maxLength = Math.max(aParts.length, bParts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart !== bPart) {
      return aPart - bPart;
    }
  }
  
  return 0;
}

/**
 * Sort version strings in descending order (latest first)
 * @param {string[]} versions - Array of version strings
 * @returns {string[]} - Sorted array
 */
function sortVersionsDescending(versions) {
  return versions.slice().sort((a, b) => compareVersions(b, a));
}

/**
 * Check if a version string is valid semantic version
 * @param {string} version - Version string to validate
 * @returns {boolean} - True if valid
 */
function isValidVersion(version) {
  const semverRegex = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;
  return semverRegex.test(version);
}

/**
 * Get all available documentation versions from the file system
 * @param {string} docsDir - Documentation directory path
 * @returns {string[]} - Array of version strings
 */
function getAvailableVersions(docsDir = 'docs/generated') {
  if (!fs.existsSync(docsDir)) {
    return [];
  }
  
  const entries = fs.readdirSync(docsDir, { withFileTypes: true });
  const versions = [];
  
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('v')) {
      const version = entry.name.substring(1); // Remove 'v' prefix
      if (isValidVersion(version)) {
        versions.push(version);
      }
    }
  }
  
  return sortVersionsDescending(versions);
}

/**
 * Get the latest version from an array of versions
 * @param {string[]} versions - Array of version strings
 * @returns {string|null} - Latest version or null if empty
 */
function getLatestVersion(versions) {
  if (versions.length === 0) return null;
  return sortVersionsDescending(versions)[0];
}

/**
 * Create version metadata object
 * @param {string[]} versions - Array of version strings
 * @returns {Object} - Version metadata
 */
function createVersionMetadata(versions) {
  const sortedVersions = sortVersionsDescending(versions);
  const latest = getLatestVersion(sortedVersions);
  
  return {
    current: latest,
    latest: latest,
    versions: sortedVersions.map((version, index) => ({
      version,
      path: `/api/v${version}`,
      label: `v${version}`,
      isLatest: index === 0,
      isStable: !version.includes('-') && !version.includes('+'),
      releaseDate: getVersionDate(version) || null
    })),
    count: sortedVersions.length,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Get version release date from git tags or file system
 * @param {string} version - Version string
 * @returns {string|null} - ISO date string or null
 */
function getVersionDate(version) {
  try {
    const { execSync } = require('child_process');
    const tagName = `v${version}`;
    
    // Try to get date from git tag
    const gitDate = execSync(`git log -1 --format=%ai ${tagName}`, { 
      encoding: 'utf8',
      stdio: 'pipe' 
    }).trim();
    
    if (gitDate) {
      return new Date(gitDate).toISOString();
    }
  } catch (error) {
    // Fall back to file system date if git fails
    const versionDir = path.join('docs/generated', `v${version}`);
    if (fs.existsSync(versionDir)) {
      const stats = fs.statSync(versionDir);
      return stats.mtime.toISOString();
    }
  }
  
  return null;
}

/**
 * Clean up old versions, keeping only the specified number
 * @param {number} keepCount - Number of versions to keep
 * @param {string} docsDir - Documentation directory
 * @returns {string[]} - Array of removed version directories
 */
function cleanupOldVersions(keepCount = 5, docsDir = 'docs/generated') {
  const versions = getAvailableVersions(docsDir);
  
  if (versions.length <= keepCount) {
    return [];
  }
  
  const toRemove = versions.slice(keepCount);
  const removed = [];
  
  for (const version of toRemove) {
    const versionDir = path.join(docsDir, `v${version}`);
    if (fs.existsSync(versionDir)) {
      try {
        const { execSync } = require('child_process');
        execSync(`rimraf "${versionDir}"`, { stdio: 'inherit' });
        removed.push(`v${version}`);
        console.log(`Removed old version: v${version}`);
      } catch (error) {
        console.warn(`Failed to remove version ${version}:`, error.message);
      }
    }
  }
  
  return removed;
}

/**
 * Generate version selector data for Next.js components
 * @param {Object} metadata - Version metadata object
 * @returns {string} - TypeScript module content
 */
function generateVersionSelectorCode(metadata) {
  return `// Auto-generated by version-utils.js
// Do not edit this file manually

export interface DocsVersion {
  version: string;
  path: string;
  label: string;
  isLatest: boolean;
  isStable: boolean;
  releaseDate: string | null;
}

export interface DocsVersionMetadata {
  current: string;
  latest: string;
  versions: DocsVersion[];
  count: number;
  generatedAt: string;
}

export const DOCS_VERSIONS: DocsVersionMetadata = ${JSON.stringify(metadata, null, 2)};

export const getCurrentVersion = (): string => DOCS_VERSIONS.current;
export const getLatestVersion = (): string => DOCS_VERSIONS.latest;
export const getAllVersions = (): DocsVersion[] => DOCS_VERSIONS.versions;
export const getStableVersions = (): DocsVersion[] => 
  DOCS_VERSIONS.versions.filter(v => v.isStable);
export const getVersionByNumber = (version: string): DocsVersion | undefined =>
  DOCS_VERSIONS.versions.find(v => v.version === version);

// Helper functions for version comparison
export const isNewerVersion = (a: string, b: string): boolean => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart !== bPart) {
      return aPart > bPart;
    }
  }
  
  return false;
};
`;
}

/**
 * Main function to update all version-related files
 * @param {string} docsDir - Documentation directory
 * @param {string} outputDir - Output directory for generated files
 */
function updateVersionFiles(docsDir = 'docs/generated', outputDir = 'apps/docs/lib') {
  const versions = getAvailableVersions(docsDir);
  const metadata = createVersionMetadata(versions);
  
  // Write versions.json
  const versionsJsonPath = path.join(docsDir, 'versions.json');
  fs.writeFileSync(versionsJsonPath, JSON.stringify(metadata, null, 2));
  
  // Write TypeScript version data
  const versionTsPath = path.join(outputDir, 'versions.ts');
  const versionCode = generateVersionSelectorCode(metadata);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(versionTsPath, versionCode);
  
  console.log(`Updated version files:`);
  console.log(`  - ${versionsJsonPath}`);
  console.log(`  - ${versionTsPath}`);
  console.log(`  - Found ${versions.length} versions: ${versions.join(', ')}`);
  
  return { versions, metadata };
}

module.exports = {
  compareVersions,
  sortVersionsDescending,
  isValidVersion,
  getAvailableVersions,
  getLatestVersion,
  createVersionMetadata,
  getVersionDate,
  cleanupOldVersions,
  generateVersionSelectorCode,
  updateVersionFiles
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Version Utils CLI

Usage: node version-utils.js [options]

Options:
  --update                Update all version files
  --cleanup [number]      Remove old versions (keep 5 by default)
  --list                  List all available versions
  --help, -h              Show this help message

Examples:
  node version-utils.js --update
  node version-utils.js --cleanup 3
  node version-utils.js --list
    `);
    process.exit(0);
  }
  
  if (args.includes('--list')) {
    const versions = getAvailableVersions();
    console.log('Available versions:');
    versions.forEach((v, i) => {
      const marker = i === 0 ? ' (latest)' : '';
      console.log(`  v${v}${marker}`);
    });
    process.exit(0);
  }
  
  if (args.includes('--cleanup')) {
    const keepIndex = args.indexOf('--cleanup') + 1;
    const keepCount = args[keepIndex] ? parseInt(args[keepIndex]) : 5;
    const removed = cleanupOldVersions(keepCount);
    console.log(`Cleanup complete. Removed ${removed.length} old versions.`);
    process.exit(0);
  }
  
  if (args.includes('--update')) {
    updateVersionFiles();
    process.exit(0);
  }
  
  // Default: show current status
  const versions = getAvailableVersions();
  const latest = getLatestVersion(versions);
  console.log(`Current latest version: ${latest || 'none'}`);
  console.log(`Total versions: ${versions.length}`);
}
