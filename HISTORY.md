# Maravian Sockets - Version History

This document tracks the major changes, objectives, and improvements for each version of the Maravian Sockets library.

## v0.5.0 (In Development)

### 🎯 Main Objectives
- Implement comprehensive documentation system with automated generation
- Set up version management and history tracking
- Create documentation website for easy access to API docs

### 📚 Documentation & Tooling
- **NEW**: Added TypeDoc for automated TypeScript API documentation generation
- **NEW**: Created documentation website using Next.js to serve generated docs
- **NEW**: Configured automated documentation generation from source code comments
- **NEW**: Added version-specific documentation with proper navigation

### 🔧 Development Workflow
- **IMPROVED**: Enhanced monorepo tooling with documentation scripts
- **NEW**: Added version management system with HISTORY.md tracking
- **NEW**: Established branch-specific versioning workflow (v0.5.0 branch)

### 📦 Package Updates
- All packages version bumped to 0.5.0 (pending)
- Documentation generation integrated into build process

---

## v0.4.0 (Released)

### 🎯 Main Objectives
- Establish secure publishing workflow 
- Fix dependency management issues
- Implement security best practices

### 🔒 Security & Publishing
- **CRITICAL**: Fixed .env file exposure in npm packages
- **NEW**: Added .npmignore to exclude sensitive files (databases, environment files)
- **NEW**: Added publishing restrictions and guidelines in WARP.md
- **IMPROVED**: Package size reduced from 783.8 kB to 39.8 kB by excluding sensitive data

### 📦 Package Management
- **FIXED**: CLI package dependency resolution for workspace types
- **NEW**: Added publishConfig for public access across all packages
- **IMPROVED**: Established proper monorepo dependency management

### 🚀 Published Packages
- `@maravian/maravian-sockets-types@0.4.0` - Core type definitions
- `@maravian/maravian-sockets-sdk@0.4.0` - React SDK 
- `@maravian/maravian-sockets-server@0.4.0` - Server implementation
- `@maravian/maravian-sockets-cli@0.4.0` - Command-line tools

---

## v0.3.0 and Earlier

### Legacy Versions
- Previous versions focused on core functionality development
- Established basic monorepo structure with pnpm workspaces
- Implemented TypeScript SDK, server, and CLI tools
- Created chat demo and dashboard applications

*Note: Detailed history for versions prior to v0.4.0 was not systematically tracked. Starting with v0.4.0, all changes are documented in this file.*

---

## Version Management Guidelines

### For Each Release:
1. Create version branch (e.g., `v0.5.0`) 
2. Update all package.json versions to match branch version
3. Complete development and testing
4. Update this HISTORY.md with version details
5. Build and publish packages (following security guidelines)
6. Merge to main and tag release
7. Generate and deploy documentation

### Documentation:
- TypeDoc generates API docs automatically from code comments
- Documentation website rebuilds on each release
- Version-specific docs maintained for reference
