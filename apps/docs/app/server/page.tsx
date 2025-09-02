import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import Link from 'next/link';

// Get the server package documentation
async function getServerDocumentation() {
  const docsPath = path.join(process.cwd(), '../../docs/generated/latest/packages/server/src');
  
  try {
    // Read the main README for server
    const readmePath = path.join(docsPath, 'README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Process markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(readmeContent);
      
    return {
      content: processedContent.toString(),
      hasContent: true
    };
  } catch (error) {
    console.error('Error reading server documentation:', error);
    return {
      content: '<p>Server documentation not available. Run <code>pnpm docs:generate</code> to generate documentation.</p>',
      hasContent: false
    };
  }
}

export default async function ServerPage() {
  const { content: documentationHtml, hasContent } = await getServerDocumentation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <nav className="mb-6">
            <Link 
              href="/" 
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium"
            >
              ← Back to Documentation
            </Link>
          </nav>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🖥️ Server Package
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Express + Socket.IO server with SQLite backend and JWT authentication
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                @maravian/maravian-sockets-server
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                v0.5.0
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Express
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Socket.IO
              </span>
            </div>
          </div>
        </header>
        
        {/* Key Features */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-green-600 dark:text-green-400 text-2xl mb-3">🔐</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                JWT Authentication
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Secure authentication with JSON Web Tokens and role-based access control
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-green-600 dark:text-green-400 text-2xl mb-3">🗄️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                SQLite Database
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Embedded database with better-sqlite3 for data persistence
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-green-600 dark:text-green-400 text-2xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Events
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                WebSocket communication with Socket.IO for instant messaging
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Documentation */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            {hasContent ? (
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: documentationHtml }} 
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12l4-4m-4 4l4 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Server documentation not available
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Run <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">pnpm docs:generate</code> to generate documentation.
                </p>
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Quick Start
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Start the development server with <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded">pnpm dev:server</code>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
