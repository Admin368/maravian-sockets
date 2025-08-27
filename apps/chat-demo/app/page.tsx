"use client";

import { useState } from "react";
import { MSocketProvider } from "@maravian/maravian-sockets-sdk";
import { ChatRoom } from "./components/ChatRoom";
import { ConnectionForm } from "./components/ConnectionForm";

const DEBUG = process.env.NEXT_PUBLIC_DEBUG_SOCKETS === "true";

export default function Home() {
  const [serverUrl, setServerUrl] = useState("http://localhost:8080");
  const [appId, setAppId] = useState("");
  const [username, setUsername] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = (url: string, id: string, user: string) => {
    if (DEBUG) {
      console.log("[Home] Connecting with:", { url, id, user });
    }
    setServerUrl(url);
    setAppId(id);
    setUsername(user);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAppId("");
    setUsername("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Maravian Sockets Chat Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Live chat demo using type-safe socket connections
          </p>
        </header>

        {!isConnected ? (
          <ConnectionForm onConnect={handleConnect} />
        ) : (
          <MSocketProvider
            options={{
              serverUrl,
              appId,
              appKey: process.env.NEXT_PUBLIC_MSOCKET_APP_KEY,
              autoConnect: true,
            }}
          >
            <ChatRoom
              username={username}
              onDisconnect={handleDisconnect}
              serverUrl={serverUrl}
              appId={appId}
            />
          </MSocketProvider>
        )}
      </div>
    </div>
  );
}
