import Link from 'next/link';

export default function SdkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <nav className="mb-6">
            <Link 
              href="/" 
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
            >
              ← Back to Documentation
            </Link>
          </nav>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ⚛️ SDK Package
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              React hooks and provider for type-safe WebSocket communication
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                @maravian/maravian-sockets-sdk
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                v0.5.0
              </span>
              <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium">
                React
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                TypeScript
              </span>
            </div>
          </div>
        </header>
        
        {/* Key Features */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-purple-600 dark:text-purple-400 text-2xl mb-3">🪝</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                React Hooks
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Modern React hooks for managing WebSocket connections and state
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-purple-600 dark:text-purple-400 text-2xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Type Safety
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Full TypeScript support with schema-based message validation
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="text-purple-600 dark:text-purple-400 text-2xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Real-time UI
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Seamless real-time updates in your React components
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Documentation */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center py-12">
              <div className="text-purple-400 dark:text-purple-500 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                React SDK Documentation
              </h3>
              
              <div className="max-w-2xl mx-auto text-left">
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Quick Start
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      npm install @maravian/maravian-sockets-sdk
                    </code>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Basic Usage
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
{`import { MSocketProvider, useMaravianSockets } from '@maravian/maravian-sockets-sdk';

function App() {
  return (
    <MSocketProvider options={{ serverUrl: 'http://localhost:8080' }}>
      <ChatComponent />
    </MSocketProvider>
  );
}

function ChatComponent() {
  const { socket, publish, onTopic } = useMaravianSockets();
  
  // Subscribe to messages
  onTopic('chat.message', (message) => {
    console.log('Received message:', message);
  });
  
  // Send a message
  const sendMessage = () => {
    publish({
      appId: 'your-app-id',
      topic: 'chat.message',
      type: 'text',
      payload: { text: 'Hello world!' }
    });
  };
  
  return <div>...</div>;
}`}
                    </pre>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                    📝 Note about API Documentation
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Detailed API documentation is being generated from the TypeScript source code. 
                    The SDK includes JSX components which require special handling for documentation generation.
                  </p>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Key Features
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• <strong>MSocketProvider:</strong> Context provider for managing WebSocket connections</li>
                  <li>• <strong>useMaravianSockets:</strong> Primary hook for accessing socket functionality</li>
                  <li>• <strong>Type-safe messaging:</strong> Schema validation for all messages</li>
                  <li>• <strong>Room management:</strong> Join and leave rooms dynamically</li>
                  <li>• <strong>Authentication:</strong> JWT token support for secure connections</li>
                  <li>• <strong>Admin functions:</strong> User management and moderation tools</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
