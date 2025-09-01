'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface DocsVersion {
  version: string;
  path: string;
  label: string;
  isLatest: boolean;
  isStable: boolean;
  releaseDate: string | null;
}

interface DocsVersionMetadata {
  current: string;
  latest: string;
  versions: DocsVersion[];
  count: number;
  generatedAt: string;
}

export default function VersionSelector() {
  const [versions, setVersions] = useState<DocsVersionMetadata | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');

  useEffect(() => {
    // Try to load versions from the generated data first
    const loadVersions = async () => {
      try {
        // Try to import the generated versions
        const { DOCS_VERSIONS } = await import('../lib/versions');
        setVersions(DOCS_VERSIONS);
        setCurrentVersion(DOCS_VERSIONS.current);
      } catch {
        // Fallback to API call if the file doesn't exist yet
        try {
          const response = await fetch('/docs/generated/versions.json');
          if (response.ok) {
            const data = await response.json();
            setVersions(data);
            setCurrentVersion(data.current);
          }
        } catch {
          console.warn('Could not load version data');
          // Set default fallback
          setVersions({
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
          });
          setCurrentVersion('0.5.0');
        }
      }
    };

    loadVersions();
  }, []);

  if (!versions || versions.versions.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Loading versions...
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex w-full justify-between items-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
          aria-expanded="true"
          aria-haspopup="true"
        >
          <span className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">API</span>
            v{currentVersion}
            {versions.versions.find(v => v.version === currentVersion)?.isLatest && (
              <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-2 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200">
                Latest
              </span>
            )}
          </span>
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border dark:border-gray-600">
          <div className="p-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b dark:border-gray-600">
              Available Versions
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {versions.versions.map((version) => (
                <Link
                  key={version.version}
                  href={version.path}
                  className={`
                    group flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors
                    ${version.version === currentVersion 
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100' 
                      : 'text-gray-900 dark:text-gray-100'
                    }
                  `}
                  onClick={() => {
                    setCurrentVersion(version.version);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{version.label}</span>
                    {version.releaseDate && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(version.releaseDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {version.isLatest && (
                      <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-2 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200">
                        Latest
                      </span>
                    )}
                    {version.isStable && !version.isLatest && (
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                        Stable
                      </span>
                    )}
                    {!version.isStable && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-200">
                        Pre-release
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-600 mt-1">
              {versions.count} version{versions.count !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
