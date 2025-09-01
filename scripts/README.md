# Build Scripts

This directory contains the build system for Maravian Sockets, including comprehensive package building and versioned documentation generation.

## Scripts Overview

### `build.js`
Main build script that orchestrates the entire build process.

**Usage:**
```bash
# Full build (clean, build packages, run tests, generate docs)
npm run build

# Build packages only (skip docs)
npm run build:packages

# Skip cleaning step
npm run build:clean

# Fast build (skip clean and tests)
npm run build:fast

# Documentation only
npm test
```

**Features:**
- ✅ Builds packages in dependency order
- ✅ Cleans previous builds
- ✅ Runs tests
- ✅ Generates documentation
- ✅ Colored console output
- ✅ Error handling and reporting

### `docs-build.js`
Documentation generation script with version support.

**Usage:**
```bash
# Generate docs for current version
npm run docs:generate

# Generate docs for specific version
npm run docs:generate:version -- --version=1.0.0

# Skip cleaning
node scripts/docs-build.js --skip-clean
```

**Features:**
- ✅ Versioned documentation output
- ✅ TypeDoc integration
- ✅ Version index generation
- ✅ Latest version symlinks
- ✅ Version metadata for Next.js

### `version-utils.js`
Utility functions for managing documentation versions.

**Usage:**
```bash
# Update all version files
node scripts/version-utils.js --update

# List available versions
node scripts/version-utils.js --list

# Clean up old versions (keep latest 3)
node scripts/version-utils.js --cleanup 3

# Show help
node scripts/version-utils.js --help
```

**Features:**
- ✅ Semantic version sorting
- ✅ Version metadata generation
- ✅ TypeScript type generation
- ✅ Old version cleanup
- ✅ Git tag integration

## Build Process

The build system follows this order:

1. **Clean** - Remove previous build artifacts
2. **Types** - Build type definitions first
3. **Server** - Build server package
4. **SDK** - Build React SDK
5. **CLI** - Build command-line tools
6. **Apps** - Build dashboard and demo apps
7. **Tests** - Run package tests
8. **Documentation** - Generate API docs

## Documentation Versioning

Documentation is generated with version support:

```
docs/generated/
├── v0.5.0/           # Versioned API docs
├── v0.4.0/           # Previous version
├── latest/           # Symlink to latest
├── versions.json     # Version metadata
└── README.md         # Documentation info
```

Version data is also generated for the Next.js docs site:

```typescript
// apps/docs/lib/versions.ts
export const DOCS_VERSIONS = {
  current: "0.5.0",
  latest: "0.5.0",
  versions: [
    {
      version: "0.5.0",
      path: "/api/v0.5.0",
      label: "v0.5.0",
      isLatest: true,
      isStable: true,
      releaseDate: "2024-01-15T10:30:00.000Z"
    }
  ]
};
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Full build with all steps |
| `npm run build:packages` | Build packages only |
| `npm run build:clean` | Build without cleaning |
| `npm run build:fast` | Fast build (skip clean & tests) |
| `npm run docs:generate` | Generate documentation |
| `npm run docs:clean` | Clean documentation |
| `npm run docs:serve` | Serve docs locally |

## Configuration

### TypeDoc Configuration
The `typedoc.json` file is dynamically updated by the documentation build script to support versioned output. The script:

- Updates output directory to `docs/generated/v{version}`
- Includes/excludes packages based on availability
- Handles JSX/TSX files appropriately
- Configures markdown output for better integration

### Package Dependencies
The build order is defined in `build.js` and respects package dependencies:

```javascript
const buildOrder = [
  'packages/types',    // Core types (no dependencies)
  'packages/server',   // Depends on types
  'packages/sdk',      // Depends on types
  'packages/cli',      // Depends on types, server
  'apps/dashboard',    // Depends on SDK
  'apps/chat-demo',    // Depends on SDK
  'apps/docs'          // Documentation site
];
```

## Error Handling

All scripts include comprehensive error handling:
- ✅ Colored output for easy scanning
- ✅ Detailed error messages
- ✅ Graceful fallbacks for missing packages
- ✅ Non-blocking documentation failures
- ✅ Process exit codes for CI/CD

## CI/CD Integration

The scripts are designed to work in CI/CD environments:

```yaml
# Example GitHub Action
- name: Build packages
  run: npm run build

- name: Generate documentation
  run: npm run docs:generate

- name: Deploy documentation
  run: npm run docs:build
```

## Development Workflow

Typical development workflow:

```bash
# Development build (fast)
npm run build:fast

# Full build before commit
npm run build

# Documentation only
npm test

# Clean everything and rebuild
npm run docs:clean && npm run build
```

## Troubleshooting

### Documentation Generation Issues
If TypeDoc fails to generate documentation:
1. Check that all packages have built successfully
2. Verify TypeScript configuration
3. Run with `--skip-clean` to preserve debugging info
4. Check for JSX/TSX files that may need special handling

### Version Management Issues
If version detection fails:
1. Ensure semantic versioning in package.json
2. Check git tags for version history
3. Verify directory structure in `docs/generated`
4. Run version utils directly: `node scripts/version-utils.js --list`

### Build Order Issues
If packages fail to build:
1. Check the dependency order in `getBuildOrder()`
2. Verify package.json scripts exist
3. Run individual package builds to isolate issues
4. Check for circular dependencies
