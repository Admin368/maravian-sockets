#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
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
    log(error.message, 'red');
    process.exit(1);
  }
}

function getPackageInfo() {
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return {
    version: rootPackage.version,
    name: rootPackage.name
  };
}

function getBuildOrder() {
  // Define the correct build order based on dependencies
  return [
    'packages/types',
    'packages/server', 
    'packages/sdk',
    'packages/cli',
    'apps/dashboard',
    'apps/chat-demo',
    'apps/docs'
  ];
}

function packageExists(packagePath) {
  return fs.existsSync(path.join(packagePath, 'package.json'));
}

function hasScript(packagePath, scriptName) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'), 'utf8'));
    return pkg.scripts && pkg.scripts[scriptName];
  } catch {
    return false;
  }
}

function cleanBuild() {
  logSection('🧹 Cleaning previous builds');
  
  const buildOrder = getBuildOrder();
  
  for (const packagePath of buildOrder) {
    if (!packageExists(packagePath)) {
      log(`Skipping ${packagePath} (not found)`, 'yellow');
      continue;
    }
    
    log(`Cleaning ${packagePath}`, 'blue');
    
    // Clean dist, build, .next directories
    const cleanDirs = ['dist', 'build', '.next', 'out'];
    for (const dir of cleanDirs) {
      const fullPath = path.join(packagePath, dir);
      if (fs.existsSync(fullPath)) {
        log(`  Removing ${fullPath}`, 'yellow');
        if (process.platform === 'win32') {
          execCommand(`powershell -Command "Remove-Item -Path '${fullPath}' -Recurse -Force -ErrorAction SilentlyContinue"`);
        } else {
          execCommand(`rm -rf "${fullPath}"`);
        }
      }
    }
  }
}

function buildPackages() {
  logSection('🔨 Building packages');
  
  const buildOrder = getBuildOrder();
  
  for (const packagePath of buildOrder) {
    if (!packageExists(packagePath)) {
      log(`Skipping ${packagePath} (not found)`, 'yellow');
      continue;
    }
    
    if (!hasScript(packagePath, 'build')) {
      log(`Skipping ${packagePath} (no build script)`, 'yellow');
      continue;
    }
    
    log(`Building ${packagePath}`, 'green');
    
    try {
      process.chdir(packagePath);
      execCommand('pnpm run build');
      process.chdir(path.join(__dirname, '..'));
      log(`✅ ${packagePath} built successfully`, 'green');
    } catch (error) {
      log(`❌ Failed to build ${packagePath}`, 'red');
      log(error.message, 'red');
      process.exit(1);
    }
  }
}

function runTests() {
  logSection('🧪 Running tests');
  
  const buildOrder = getBuildOrder();
  let hasTests = false;
  
  for (const packagePath of buildOrder) {
    if (!packageExists(packagePath)) continue;
    
    if (hasScript(packagePath, 'test')) {
      hasTests = true;
      log(`Testing ${packagePath}`, 'blue');
      
      try {
        process.chdir(packagePath);
        execCommand('pnpm run test');
        process.chdir(path.join(__dirname, '..'));
        log(`✅ ${packagePath} tests passed`, 'green');
      } catch (error) {
        log(`❌ Tests failed for ${packagePath}`, 'red');
        // Continue with other tests instead of failing the entire build
      }
    }
  }
  
  if (!hasTests) {
    log('No test scripts found in packages', 'yellow');
  }
}

function generateDocumentation() {
  logSection('📚 Generating documentation');
  
  try {
    execCommand('node scripts/docs-build.js');
    log('✅ Documentation generated successfully', 'green');
  } catch (error) {
    log('❌ Documentation generation failed', 'red');
    log(error.message, 'red');
    // Don't fail the entire build for documentation issues
  }
}

function main() {
  const args = process.argv.slice(2);
  const skipClean = args.includes('--skip-clean');
  const skipTests = args.includes('--skip-tests');
  const skipDocs = args.includes('--skip-docs');
  const docsOnly = args.includes('--docs-only');
  
  const packageInfo = getPackageInfo();
  
  logSection(`🚀 Building ${packageInfo.name} v${packageInfo.version}`);
  
  if (docsOnly) {
    generateDocumentation();
    return;
  }
  
  if (!skipClean) {
    cleanBuild();
  }
  
  buildPackages();
  
  if (!skipTests) {
    runTests();
  }
  
  if (!skipDocs) {
    generateDocumentation();
  }
  
  logSection('🎉 Build completed successfully!');
  log(`Project: ${packageInfo.name}`, 'green');
  log(`Version: ${packageInfo.version}`, 'green');
  log(`Built at: ${new Date().toISOString()}`, 'blue');
}

if (require.main === module) {
  main();
}

module.exports = {
  cleanBuild,
  buildPackages,
  runTests,
  generateDocumentation,
  getPackageInfo,
  getBuildOrder
};
