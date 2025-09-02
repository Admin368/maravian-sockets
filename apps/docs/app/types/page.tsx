import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import Link from 'next/link';

// Get the types package documentation
async function getTypesDocumentation() {
  const docsPath = path.join(process.cwd(), '../../docs/generated/latest/packages/types/src');
  
  try {
    // Read the main README for types
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
    console.error('Error reading types documentation:', error);
    return {
      content: '<p>Types documentation not available. Run <code>pnpm docs:generate</code> to generate documentation.</p>',
      hasContent: false
    };
  }
}

// Get additional sections (functions, type-aliases, variables)
async function getTypesSections() {
  const docsPath = path.join(process.cwd(), '../../docs/generated/latest/packages/types/src');
  const sections = ['functions', 'type-aliases', 'variables'];
  
  const sectionData = [];
  
  for (const section of sections) {
    try {
      const sectionPath = path.join(docsPath, section);
      if (fs.existsSync(sectionPath)) {
        const files = fs.readdirSync(sectionPath);
        const mdFiles = files.filter(file => file.endsWith('.md'));
        
        sectionData.push({
          name: section,
          displayName: section.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          files: mdFiles.map(file => ({
            name: file.replace('.md', ''),
            path: `/types/${section}/${file.replace('.md', '')}`
          }))
        });
      }
    } catch (error) {
      console.error(`Error reading ${section} documentation:`, error);
    }
  }
  
  return sectionData;
}

export default async function TypesPage() {
  const { content: documentationHtml, hasContent } = await getTypesDocumentation();
  const sections = await getTypesSections();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <nav className="mb-6">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              ← Back to Documentation
            </Link>
          </nav>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🔧 Types Package
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Core TypeScript definitions and schema validation using Zod
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                @maravian/maravian-sockets-types
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                v0.5.0
              </span>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  API Reference
                </h3>
                <nav className="space-y-3">
                  {sections.map((section) => (
                    <div key={section.name}>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                        {section.displayName}
                      </h4>
                      <ul className="space-y-1 mb-4">
                        {section.files.map((file) => (
                          <li key={file.name}>
                            <Link
                              href={file.path}
                              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 block py-1"
                            >
                              {file.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* Main Documentation */}
            <div className="lg:col-span-3">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Documentation not available
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Run <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">pnpm docs:generate</code> to generate documentation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
