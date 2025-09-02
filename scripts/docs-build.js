#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bright');
  console.log('='.repeat(60) + '\n');
}

function execCommand(command, options = {}) {
  log(`Executing: ${command}`, 'cyan');
  try {
    const result = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      cwd: process.cwd(),
      ...options 
    });
    return result;
  } catch (error) {
    log(`Error executing command: ${command}`, 'red');
    throw error;
  }
}

function getPackageInfo() {
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return {
    version: rootPackage.version,
    name: rootPackage.name
  };
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`Created directory: ${dirPath}`, 'blue');
  }
}

function cleanDocsDirectory() {
  logSection('🧹 Cleaning documentation directory');
  
  const docsDir = 'docs/generated';
  if (fs.existsSync(docsDir)) {
    log(`Removing existing docs: ${docsDir}`, 'yellow');
    if (process.platform === 'win32') {
      execCommand(`powershell -Command "Remove-Item -Path '${docsDir}' -Recurse -Force -ErrorAction SilentlyContinue"`);
    } else {
      execCommand(`rm -rf "${docsDir}"`);
    }
  }
  
  ensureDirectoryExists(docsDir);
}

function updateTypedocConfig(version) {
  logSection('⚙️ Updating TypeDoc configuration');
  
  const typedocPath = 'typedoc.json';
  const config = JSON.parse(fs.readFileSync(typedocPath, 'utf8'));
  
  // Update configuration for versioned output
  config.out = `docs/generated/v${version}`;
  config.name = `Maravian Sockets Documentation v${version}`;
  
  // Include SDK package if it exists and has TypeScript files
  const sdkPath = 'packages/sdk/src/index.ts';
  if (fs.existsSync(sdkPath) && !config.entryPoints.includes(sdkPath)) {
    log('Adding SDK package to documentation', 'blue');
    config.entryPoints.push(sdkPath);
  }
  
  // Write temporary config
  const tempConfigPath = 'typedoc.temp.json';
  fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));
  
  log(`Updated TypeDoc config for version ${version}`, 'green');
  return tempConfigPath;
}

function copyPackageReadmes(version) {
  logSection('📋 Copying package README files');
  
  const packages = ['types', 'server', 'sdk', 'cli'];
  const versionDir = `docs/generated/v${version}`;
  
  for (const pkg of packages) {
    const srcReadme = `packages/${pkg}/README.md`;
    const destDir = `${versionDir}/packages/${pkg}`;
    const destReadme = `${destDir}/README.md`;
    
    if (fs.existsSync(srcReadme)) {
      ensureDirectoryExists(destDir);
      
      // Copy the README file
      try {
        const content = fs.readFileSync(srcReadme, 'utf8');
        fs.writeFileSync(destReadme, content);
        log(`✅ Copied README for ${pkg} package`, 'green');
      } catch (error) {
        log(`⚠️  Could not copy README for ${pkg}: ${error.message}`, 'yellow');
      }
    } else {
      log(`⚠️  README not found for ${pkg} package: ${srcReadme}`, 'yellow');
    }
  }
}

function generateApiDocs(version) {
  logSection('📖 Generating API documentation');
  
  const tempConfigPath = updateTypedocConfig(version);
  
  try {
    execCommand(`npx typedoc --options "${tempConfigPath}"`);
    log('✅ API documentation generated successfully', 'green');
    
    // Copy package README files to the generated docs
    copyPackageReadmes(version);
  } catch (error) {
    log('❌ API documentation generation failed', 'red');
    throw error;
  } finally {
    // Clean up temporary config
    if (fs.existsSync(tempConfigPath)) {
      fs.unlinkSync(tempConfigPath);
    }
  }
}

function generateVersionIndex() {
  logSection('📝 Generating version index');
  
  const docsDir = 'docs/generated';
  const versions = [];
  
  // Scan for version directories
  if (fs.existsSync(docsDir)) {
    const entries = fs.readdirSync(docsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('v')) {
        const version = entry.name.substring(1); // Remove 'v' prefix
        versions.push(version);
      }
    }
  }
  
  // Sort versions (latest first)
  versions.sort((a, b) => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart !== bPart) {
        return bPart - aPart; // Descending order
      }
    }
    return 0;
  });
  
  log(`Found versions: ${versions.join(', ')}`, 'blue');
  
  // Generate versions.json for the docs site
  const versionsData = {
    current: versions[0] || '0.5.0',
    latest: versions[0] || '0.5.0',
    versions: versions.map(version => ({
      version,
      path: `/api/v${version}`,
      label: `v${version}`,
      isLatest: version === versions[0],
      isStable: !version.includes('-') && !version.includes('+'),
      releaseDate: null
    })),
    count: versions.length,
    generatedAt: new Date().toISOString()
  };
  
  const versionsPath = path.join(docsDir, 'versions.json');
  fs.writeFileSync(versionsPath, JSON.stringify(versionsData, null, 2));
  
  log(`Version index written to: ${versionsPath}`, 'green');
  
  // Generate version selector component data
  generateVersionSelectorData(versionsData);
  
  return versionsData;
}

function generateVersionSelectorData(versionsData) {
  const componentData = `// Auto-generated by docs-build.js
export const DOCS_VERSIONS = ${JSON.stringify(versionsData, null, 2)};

export type DocsVersion = {
  version: string;
  path: string;
  label: string;
  isLatest: boolean;
  isStable: boolean;
  releaseDate: string | null;
};

export interface DocsVersionMetadata {
  current: string;
  latest: string;
  versions: DocsVersion[];
  count: number;
  generatedAt: string;
}

export const getCurrentVersion = () => DOCS_VERSIONS.current;
export const getAllVersions = (): DocsVersion[] => DOCS_VERSIONS.versions;
export const getLatestVersion = (): DocsVersion | undefined => 
  DOCS_VERSIONS.versions.find(v => v.isLatest);
`;
  
  const outputPath = 'apps/docs/lib/versions.ts';
  ensureDirectoryExists(path.dirname(outputPath));
  fs.writeFileSync(outputPath, componentData);
  
  log(`Version selector data written to: ${outputPath}`, 'green');
}

function createLatestSymlink(version) {
  logSection('🔗 Creating latest version symlink');
  
  const versionPath = `docs/generated/v${version}`;
  const latestPath = `docs/generated/latest`;
  
  // Remove existing latest symlink/directory
  if (fs.existsSync(latestPath)) {
    if (process.platform === 'win32') {
      execCommand(`powershell -Command "Remove-Item -Path '${latestPath}' -Recurse -Force -ErrorAction SilentlyContinue"`);
    } else {
      execCommand(`rm -rf "${latestPath}"`);
    }
  }
  
  try {
    // Create symlink on Unix-like systems, copy on Windows
    if (process.platform === 'win32') {
      execCommand(`xcopy "${versionPath}" "${latestPath}" /E /I /H /Y`);
      log('Created latest version copy (Windows)', 'green');
    } else {
      execCommand(`ln -sf "v${version}" "${latestPath}"`);
      log('Created latest version symlink', 'green');
    }
  } catch (error) {
    log('Warning: Could not create latest version link', 'yellow');
    log(error.message, 'yellow');
  }
}

function generateReadme(version) {
  logSection('📄 Generating documentation README');
  
  const readmeContent = `# Maravian Sockets Documentation

Auto-generated API documentation for Maravian Sockets v${version}.

## Available Versions

- [Latest (v${version})](./latest/)
- [v${version}](./v${version}/)

## Package Documentation

- **Types**: Core TypeScript type definitions
- **Server**: WebSocket server implementation  
- **SDK**: React hooks and components
- **CLI**: Command-line interface tools

## Documentation Structure

\`\`\`
docs/generated/
├── latest/           # Latest version (symlink/copy)
├── v${version}/           # Version-specific docs
├── versions.json     # Version metadata
└── README.md         # This file
\`\`\`

## Usage

The documentation is automatically built and deployed with the main documentation site at [your-docs-url].

Generated on: ${new Date().toISOString()}
`;

  const readmePath = 'docs/generated/README.md';
  fs.writeFileSync(readmePath, readmeContent);
  log(`Documentation README written to: ${readmePath}`, 'green');
}

function main() {
  const args = process.argv.slice(2);
  const skipClean = args.includes('--skip-clean');
  const version = args.find(arg => arg.startsWith('--version='))?.split('=')[1];
  
  const packageInfo = getPackageInfo();
  const targetVersion = version || packageInfo.version;
  
  logSection(`📚 Building documentation for v${targetVersion}`);
  
  try {
    if (!skipClean) {
      cleanDocsDirectory();
    }
    
    generateApiDocs(targetVersion);
    createLatestSymlink(targetVersion);
    const versionsData = generateVersionIndex();
    generateReadme(targetVersion);
    
    // Copy docs to apps/docs public directory for serving
    copyDocsToApps(targetVersion);
    
    logSection('🎉 Documentation build completed!');
    log(`Version: v${targetVersion}`, 'green');
    log(`Output: docs/generated/v${targetVersion}`, 'blue');
    log(`Versions available: ${versionsData.versions.map(v => v.version).join(', ')}`, 'cyan');
    
  } catch (error) {
    log('❌ Documentation build failed', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function copyDocsToApps(version) {
  logSection('📂 Copying documentation to apps/docs');
  
  const sourceDir = 'docs/generated';
  const targetDir = 'apps/docs/public/docs';
  
  // Ensure target directory exists
  ensureDirectoryExists(targetDir);
  
  try {
    // Copy the entire generated docs directory
    if (process.platform === 'win32') {
      execCommand(`xcopy "${sourceDir}" "${targetDir}" /E /I /H /Y`);
    } else {
      execCommand(`cp -r "${sourceDir}/"* "${targetDir}/"`);
    }
    
    log('✅ Documentation copied to apps/docs/public/docs', 'green');
  } catch (error) {
    log('⚠️  Could not copy docs to apps directory', 'yellow');
    log(error.message, 'yellow');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateApiDocs,
  generateVersionIndex,
  createLatestSymlink,
  generateReadme,
  copyPackageReadmes,
  copyDocsToApps,
  getPackageInfo
};
