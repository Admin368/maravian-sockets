import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';

interface ApiVersionPageProps {
  params: {
    version: string;
  };
}

async function getVersionData(version: string) {
  const versionPath = path.join(process.cwd(), 'public/docs', version);
  
  if (!fs.existsSync(versionPath)) {
    return null;
  }
  
  const packagesPath = path.join(versionPath, 'packages');
  const packages: string[] = [];
  
  if (fs.existsSync(packagesPath)) {
    const dirs = fs.readdirSync(packagesPath, { withFileTypes: true });
    packages.push(...dirs.filter(dir => dir.isDirectory()).map(dir => dir.name));
  }
  
  return {
    version,
    packages,
    path: versionPath
  };
}

export default async function ApiVersionPage({ params }: ApiVersionPageProps) {
  const versionData = await getVersionData(params.version);
  
  if (!versionData) {
    notFound();
  }
  
  const { version, packages } = versionData;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <nav className="mb-6 flex items-center justify-between">
            <Link 
              href="/api" 
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
            >
              ← Back to API Documentation
            </Link>
          </nav>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              📚 API Documentation {version}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Complete TypeScript API reference for all Maravian Sockets packages
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {version}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {packages.length} Packages
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                TypeDoc Generated
              </span>
            </div>
          </div>
        </header>

        {/* Package Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            {packages.map((pkg) => {
              const packageInfo = getPackageInfo(pkg);
              return (
                <div 
                  key={pkg} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${packageInfo.bgColor} rounded-lg flex items-center justify-center`}>
                        <span className={`${packageInfo.textColor} text-2xl`}>
                          {packageInfo.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {packageInfo.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @maravian/maravian-sockets-{pkg}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {packageInfo.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/api/${version}/packages/${pkg}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                    >
                      View API Docs
                    </Link>
                    <a
                      href={`/docs/${version}/packages/${pkg}/README.md`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                    >
                      README
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct links to generated docs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Generated Documentation
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Full API Reference
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  Complete TypeDoc-generated API documentation with all modules, classes, functions, and types.
                </p>
                <a
                  href={`/docs/${version}/modules.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Browse All Modules
                </a>
              </div>
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
    bgColor: string;
    textColor: string;
  }> = {
    types: {
      title: 'Types',
      description: 'Core TypeScript definitions, interfaces, and schema utilities for type-safe socket communication.',
      icon: '🏗️',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    server: {
      title: 'Server',
      description: 'Production-ready WebSocket server with authentication, room management, and real-time messaging.',
      icon: '🖥️',
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400'
    },
    sdk: {
      title: 'SDK',
      description: 'React hooks and components for seamless client-side integration with Maravian Sockets.',
      icon: '⚛️',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    cli: {
      title: 'CLI',
      description: 'Command-line tools for schema management, code generation, and development workflow.',
      icon: '⌨️',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    }
  };
  
  return packageMap[pkg] || {
    title: pkg.charAt(0).toUpperCase() + pkg.slice(1),
    description: `Documentation for the ${pkg} package.`,
    icon: '📦',
    bgColor: 'bg-gray-100 dark:bg-gray-900',
    textColor: 'text-gray-600 dark:text-gray-400'
  };
}

export async function generateStaticParams() {
  // Generate params for known versions
  const docsPath = path.join(process.cwd(), 'public/docs');
  const versions: string[] = [];
  
  if (fs.existsSync(docsPath)) {
    const entries = fs.readdirSync(docsPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && (entry.name.startsWith('v') || entry.name === 'latest')) {
        versions.push(entry.name);
      }
    }
  }
  
  return versions.map(version => ({
    version
  }));
}
