import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';

// Get the generated documentation content
async function getDocumentation() {
  const docsPath = path.join(process.cwd(), '../../docs/generated');
  
  try {
    // Read the main modules file
    const modulesPath = path.join(docsPath, 'modules.md');
    const modulesContent = fs.readFileSync(modulesPath, 'utf8');
    
    // Process markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(modulesContent);
      
    return processedContent.toString();
  } catch (error) {
    console.error('Error reading documentation:', error);
    return '<p>Documentation not available. Run <code>pnpm docs:generate</code> to generate documentation.</p>';
  }
}

export default async function Home() {
  const documentationHtml = await getDocumentation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Maravian Sockets Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Type-safe WebSocket communication library with React hooks and Express server integration
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              v0.5.0
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              TypeScript
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              React
            </span>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none"
                 dangerouslySetInnerHTML={{ __html: documentationHtml }} 
            />
          </div>
          
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                🔧 Types Package
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Core TypeScript definitions and schema validation using Zod
              </p>
              <a href="/types" className="text-blue-600 hover:text-blue-800 font-medium">
                View Types API →
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                ⚛️ SDK Package
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                React hooks and provider for type-safe WebSocket communication
              </p>
              <a href="/sdk" className="text-blue-600 hover:text-blue-800 font-medium">
                View SDK API →
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                🖥️ Server Package
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Express + Socket.IO server with SQLite backend and JWT authentication
              </p>
              <a href="/server" className="text-blue-600 hover:text-blue-800 font-medium">
                View Server API →
              </a>
            </div>
          </div>
        </main>
        
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p>Generated with TypeDoc • Built with Next.js</p>
        </footer>
      </div>
    </div>
  );
}
