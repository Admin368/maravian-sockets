import Link from 'next/link';
import VersionSelector from '../../components/VersionSelector';

interface ApiVersion {
  version: string;
  path: string;
  label: string;
  isLatest: boolean;
  isStable: boolean;
  releaseDate: string | null;
}

interface ApiVersionMetadata {
  current: string;
  latest: string;
  versions: ApiVersion[];
  count: number;
  generatedAt: string;
}

async function getVersions(): Promise<ApiVersionMetadata | null> {
  try {
    // Try to load the generated versions data
    const { DOCS_VERSIONS } = await import('../../lib/versions');
    return DOCS_VERSIONS;
  } catch {
    // Return fallback data if versions file doesn't exist
    return {
      current: '0.5.0',
      latest: '0.5.0',
      versions: [
        {
          version: '0.5.0',
          path: '/api/v0.5.0',
          label: 'v0.5.0',
          isLatest: true,
          isStable: true,
          releaseDate: null
        }
      ],
      count: 1,
      generatedAt: new Date().toISOString()
    };
  }
}

export default async function ApiDocsPage() {
  const versions = await getVersions();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <nav className="mb-6 flex items-center justify-between">
            <Link 
              href="/" 
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
            >
              ← Back to Documentation
            </Link>
            
            <VersionSelector />
          </nav>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              📚 API Documentation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Complete TypeScript API reference for all Maravian Sockets packages
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                TypeDoc Generated
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {versions?.count || 1} Version{versions?.count !== 1 ? 's' : ''}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Auto-updated
              </span>
            </div>
          </div>
        </header>

        {/* Version Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {versions?.versions.slice(0, 6).map((version) => (
              <div 
                key={version.version} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {version.label}
                    </h3>
                    {version.releaseDate && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(version.releaseDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {version.isLatest && (
                      <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-2 py-1 text-xs font-medium text-purple-800 dark:text-purple-200">
                        Latest
                      </span>
                    )}
                    {version.isStable && (
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-200">
                        Stable
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Complete API documentation for all packages including types, server, CLI, and SDK components.
                </p>
                
                <Link
                  href={version.path}
                  className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  View {version.label} Docs
                </Link>
              </div>
            ))}
          </div>

          {/* Package Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Package Documentation
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 dark:text-blue-400 text-2xl">🏗️</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Types</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Core TypeScript definitions and interfaces
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 dark:text-green-400 text-2xl">🖥️</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Server</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  WebSocket server implementation and APIs
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 dark:text-purple-400 text-2xl">⚛️</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">SDK</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  React hooks and components for client apps
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⌨️</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">CLI</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Command-line tools and utilities
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Start
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Latest API Docs
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Jump directly to the latest API documentation with complete TypeScript definitions.
                </p>
                <Link
                  href={`/api/v${versions?.latest || '0.5.0'}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  View Latest API Docs →
                </Link>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  SDK Documentation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Learn how to integrate Maravian Sockets into your React applications.
                </p>
                <Link
                  href="/sdk"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  View SDK Guide →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
