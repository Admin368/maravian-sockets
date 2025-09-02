import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';

interface ApiPackagePageProps {
  params: {
    version: string;
    package: string;
  };
}

async function getPackageData(version: string, packageName: string) {
  const packagePath = path.join(process.cwd(), 'public/docs', version, 'packages', packageName);
  
  if (!fs.existsSync(packagePath)) {
    return null;
  }
  
  // Get README content if it exists
  const readmePath = path.join(packagePath, 'README.md');
  let readmeContent = '';
  
  if (fs.existsSync(readmePath)) {
    readmeContent = fs.readFileSync(readmePath, 'utf8');
  }
  
  // Get generated docs structure
  const srcPath = path.join(packagePath, 'src');
  const hasDocs = fs.existsSync(srcPath);
  
  let docSections: string[] = [];
  if (hasDocs) {
    const srcContents = fs.readdirSync(srcPath, { withFileTypes: true });
    docSections = srcContents
      .filter(item => item.isDirectory())
      .map(item => item.name);
  }
  
  return {
    version,
    packageName,
    readmeContent,
    hasDocs,
    docSections,
    basePath: `/docs/${version}/packages/${packageName}`
  };
}

export default async function ApiPackagePage({ params }: ApiPackagePageProps) {
  const packageData = await getPackageData(params.version, params.package);
  
  if (!packageData) {
    notFound();
  }
  
  const { version, packageName, readmeContent, hasDocs, docSections, basePath } = packageData;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <nav className="mb-6 flex items-center gap-2 text-sm">
            <Link 
              href="/api" 
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
            >
              API Docs
            </Link>
            <span className="text-gray-400">/</span>
            <Link 
              href={`/api/${version}`}
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
            >
              {version}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-300">{packageName}</span>
          </nav>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {getPackageInfo(packageName).icon} {getPackageInfo(packageName).title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              @maravian/maravian-sockets-{packageName} • {version}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {version}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                TypeDoc
              </span>
              {hasDocs && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  API Reference
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          {/* Quick Links */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📖 README
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Package overview, installation guide, and quick start examples.
              </p>
              <a
                href={`${basePath}/README.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                View README
              </a>
            </div>

            {hasDocs && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🔍 API Reference
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Complete TypeDoc-generated API documentation with all functions, types, and interfaces.
                </p>
                <a
                  href={`${basePath}/src/README.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  Browse API
                </a>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🏠 Package Home
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Visit the main package documentation with examples and guides.
              </p>
              <Link
                href={`/${packageName}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Package Docs
              </Link>
            </div>
          </div>

          {/* API Documentation Sections */}
          {hasDocs && docSections.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                API Documentation Sections
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docSections.map((section) => (
                  <a
                    key={section}
                    href={`${basePath}/src/${section}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-purple-600 dark:text-purple-400 text-lg">
                        {getSectionIcon(section)}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                          {section.replace('-', ' ')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {getSectionDescription(section)}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Package Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              About This Package
            </h2>
            
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                {getPackageInfo(packageName).description}
              </p>
              
              {readmeContent && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    README Preview
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {readmeContent.slice(0, 500)}...
                    </p>
                    <a
                      href={`${basePath}/README.md`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                    >
                      Read full README →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPackageInfo(pkg: string) {
  const packageMap: Record<string, {
    title: string;
    description: string;
    icon: string;
  }> = {
    types: {
      title: 'Types Package',
      description: 'Core TypeScript definitions, interfaces, and schema utilities that provide type safety across the entire Maravian Sockets ecosystem. Includes schema definition helpers, validation utilities, and foundational types.',
      icon: '🏗️'
    },
    server: {
      title: 'Server Package',
      description: 'Production-ready WebSocket server implementation with built-in authentication, room management, real-time messaging, and administrative dashboard. Includes RESTful APIs, database management, and comprehensive logging.',
      icon: '🖥️'
    },
    sdk: {
      title: 'SDK Package',
      description: 'React hooks and components for seamless client-side integration with Maravian Sockets. Provides type-safe hooks, context providers, automatic reconnection, and real-time state management.',
      icon: '⚛️'
    },
    cli: {
      title: 'CLI Package',
      description: 'Command-line tools for schema management, TypeScript code generation, and development workflow automation. Includes schema validation, server deployment helpers, and type generation utilities.',
      icon: '⌨️'
    }
  };
  
  return packageMap[pkg] || {
    title: `${pkg.charAt(0).toUpperCase() + pkg.slice(1)} Package`,
    description: `Documentation and API reference for the ${pkg} package.`,
    icon: '📦'
  };
}

function getSectionIcon(section: string): string {
  const sectionMap: Record<string, string> = {
    'functions': '⚡',
    'classes': '🏛️',
    'interfaces': '🔌',
    'types': '🏷️',
    'type-aliases': '🔗',
    'variables': '💾',
    'enums': '📋',
    'modules': '📦'
  };
  
  return sectionMap[section] || '📄';
}

function getSectionDescription(section: string): string {
  const sectionMap: Record<string, string> = {
    'functions': 'Exported functions and utilities',
    'classes': 'Class definitions and constructors',
    'interfaces': 'Interface definitions',
    'types': 'Type definitions',
    'type-aliases': 'Type aliases and unions',
    'variables': 'Exported variables and constants',
    'enums': 'Enumeration definitions',
    'modules': 'Module exports and namespaces'
  };
  
  return sectionMap[section] || 'Documentation section';
}

export async function generateStaticParams() {
  const docsPath = path.join(process.cwd(), 'public/docs');
  const params: Array<{ version: string; package: string }> = [];
  
  if (fs.existsSync(docsPath)) {
    const versions = fs.readdirSync(docsPath, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && (entry.name.startsWith('v') || entry.name === 'latest'))
      .map(entry => entry.name);
    
    for (const version of versions) {
      const packagesPath = path.join(docsPath, version, 'packages');
      if (fs.existsSync(packagesPath)) {
        const packages = fs.readdirSync(packagesPath, { withFileTypes: true })
          .filter(entry => entry.isDirectory())
          .map(entry => entry.name);
        
        for (const pkg of packages) {
          params.push({ version, package: pkg });
        }
      }
    }
  }
  
  return params;
}
