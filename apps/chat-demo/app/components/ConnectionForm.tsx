"use client";

import { useState } from "react";

interface ConnectionFormProps {
  onConnect: (serverUrl: string, appId: string, username: string) => void;
}

export function ConnectionForm({ onConnect }: ConnectionFormProps) {
  const [serverUrl, setServerUrl] = useState(
    process.env.NEXT_PUBLIC_MSOCKET_SERVER_URL || "http://localhost:8080"
  );
  const [appId, setAppId] = useState(
    process.env.NEXT_PUBLIC_MSOCKET_APP_ID || "chat4"
  );
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverUrl && appId && username) {
      onConnect(serverUrl, appId, username);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Connect to Chat
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="serverUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Server URL
            </label>
            <input
              type="url"
              id="serverUrl"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="http://localhost:8080"
              required
            />
          </div>

          <div>
            <label
              htmlFor="appId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              App ID
            </label>
            <input
              type="text"
              id="appId"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="chat4"
              required
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your username"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Connect
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Quick Setup:
          </h3>
          <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>
              1. Start the Maravian Sockets server:{" "}
              <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">
                pnpm dev
              </code>
            </li>
            <li>
              2. Create an app in the dashboard at{" "}
              <a
                href="http://localhost:8080"
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                localhost:8080
              </a>
            </li>
            <li>3. Use the app ID here to connect</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
