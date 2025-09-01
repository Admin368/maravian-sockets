import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            🚀 Maravian Sockets
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Type-safe WebSocket communication library with React hooks, Express server integration, and comprehensive developer tooling
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-medium">
              v0.5.0
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
              TypeScript
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
              React
            </span>
            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-medium">
              Socket.IO
            </span>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex justify-center gap-4">
            <Link
              href="/api"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              📚 API Documentation
            </Link>
            <Link
              href="/sdk"
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              ⚛️ SDK Guide
            </Link>
          </div>
        </header>
        
        {/* Feature Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Complete WebSocket Solution
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-2xl">🏗️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Types Package
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Core TypeScript definitions and schema validation using Zod
              </p>
              <Link
                href="/api"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
              >
                View Types API →
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 dark:text-green-400 text-2xl">🖥️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Server Package
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Express + Socket.IO server with SQLite backend and JWT authentication
              </p>
              <Link
                href="/api"
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium text-sm"
              >
                View Server API →
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-purple-600 dark:text-purple-400 text-2xl">⚛️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                SDK Package
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                React hooks and provider for type-safe WebSocket communication
              </p>
              <Link
                href="/sdk"
                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-sm"
              >
                View SDK Guide →
              </Link>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⌨️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                CLI Package
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Command-line tools for development and server management
              </p>
              <Link
                href="/api"
                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium text-sm"
              >
                View CLI API →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Quick Start Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              🚀 Quick Start
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Installation
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    # Install the SDK for React apps<br/>
                    npm install @maravian/maravian-sockets-sdk<br/><br/>
                    # Install the server for backends<br/>
                    npm install @maravian/maravian-sockets-server
                  </code>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Basic Usage
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
{`import { MSocketProvider } from '@maravian/sockets-sdk';

<MSocketProvider options={{ serverUrl: 'ws://localhost:8080' }}>
  <App />
</MSocketProvider>`}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Link
                href="/sdk"
                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
              >
                View full setup guide →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Documentation Links */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            📖 Documentation
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/api" className="group">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow group-hover:ring-2 group-hover:ring-purple-500 group-hover:ring-offset-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    📚 API Reference
                  </h3>
                  <span className="text-purple-600 dark:text-purple-400">→</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete TypeScript API documentation with version support, generated from source code
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
                    Auto-generated
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                    Versioned
                  </span>
                </div>
              </div>
            </Link>
            
            <Link href="/sdk" className="group">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow group-hover:ring-2 group-hover:ring-purple-500 group-hover:ring-offset-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    ⚛️ SDK Guide
                  </h3>
                  <span className="text-purple-600 dark:text-purple-400">→</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Learn how to integrate Maravian Sockets into your React applications with hooks and providers
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                    Examples
                  </span>
                  <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded text-xs font-medium">
                    React
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p>Built with Next.js • Auto-generated API docs • Version controlled</p>
        </footer>
      </div>
    </div>
  );
}
