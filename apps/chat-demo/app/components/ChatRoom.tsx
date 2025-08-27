"use client";

/**
 * ChatRoom Component - Demonstrating Maravian Sockets v0.4.0 Type-Safe Features
 * 
 * This component showcases the new type-safe functionality:
 * - typedPublish(): Provides IntelliSense and compile-time validation for message payloads
 * - typedOnTopic(): Provides typed message payloads in subscription handlers
 * - Generated schema types ensure data consistency between client and server
 * 
 * Benefits:
 * ✅ Auto-completion for topic names and message structures
 * ✅ Compile-time type checking prevents runtime errors
 * ✅ IntelliSense shows available fields and their types
 * ✅ Schema evolution automatically updates types
 */

import { useState, useEffect, useRef } from "react";
import {
  useMaravianSockets,
  typedPublish,   // 🆕 v0.4.0 Type-safe publish
  typedOnTopic,   // 🆕 v0.4.0 Type-safe subscribe
} from "@maravian/maravian-sockets-sdk";

// Include generated types for this project's schema
/// <reference path="../msocket/generated.d.ts" />

const DEBUG = process.env.NEXT_PUBLIC_DEBUG_SOCKETS === "true";

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

interface ChatRoomProps {
  username: string;
  onDisconnect: () => void;
  serverUrl: string;
  appId: string;
}

export function ChatRoom({
  username,
  onDisconnect,
  serverUrl,
  appId,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useMaravianSockets();

  // Debug socket state changes
  useEffect(() => {
    if (DEBUG) {
      console.log("[ChatRoom] Socket connection state:", socket.connected);
      console.log("[ChatRoom] Socket object:", socket);
    }
  }, [socket.connected]);

  // Send join message when socket connects using type-safe function
  useEffect(() => {
    if (!socket.connected || !DEBUG) return;

    console.log('[ChatRoom] Socket connected, sending join message');
    // Using type-safe publish - provides IntelliSense and validation
    typedPublish(socket, 'system.presence', 'user.join', { username })
      .then(result => {
        console.log('[ChatRoom] Join message sent:', result);
      })
      .catch(error => {
        console.error('[ChatRoom] Failed to send join message:', error);
      });
  }, [socket.connected, username]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket.connected) {
      if (DEBUG) {
        console.log(
          "[ChatRoom] Socket not connected, skipping message listeners"
        );
      }
      return;
    }

    if (DEBUG) {
      console.log("[ChatRoom] Setting up message listeners");
    }

    // Listen for chat messages using type-safe function
    const unsubscribe = typedOnTopic(socket, "chat.messages", (msg) => {
      if (DEBUG) {
        console.log("[ChatRoom] Received chat message:", msg);
      }
      if (msg.type === "send") {
        // msg.payload is now typed as { username: string; text: string }
        setMessages((prev) => [
          ...prev,
          {
            id: `${msg.payload.username}-${msg.ts || Date.now()}`,
            username: msg.payload.username,
            text: msg.payload.text,
            timestamp: msg.ts || Date.now(),
          },
        ]);
      }
    });

    // Listen for user join/leave events using type-safe function
    const unsubscribePresence = typedOnTopic(socket, "system.presence", (msg) => {
      if (DEBUG) {
        console.log("[ChatRoom] Received presence message:", msg);
      }
      if (msg.type === "user.join") {
        // msg.payload is now typed as { username: string }
        setMessages((prev) => [
          ...prev,
          {
            id: `join-${msg.ts || Date.now()}`,
            username: "System",
            text: `${msg.payload?.username || "Someone"} joined the chat`,
            timestamp: msg.ts || Date.now(),
          },
        ]);
      } else if (msg.type === "user.leave") {
        // msg.payload is now typed as { username: string }
        setMessages((prev) => [
          ...prev,
          {
            id: `leave-${msg.ts || Date.now()}`,
            username: "System",
            text: `${msg.payload?.username || "Someone"} left the chat`,
            timestamp: msg.ts || Date.now(),
          },
        ]);
      }
    });

    return () => {
      if (DEBUG) {
        console.log("[ChatRoom] Cleaning up message listeners");
      }
      unsubscribe();
      unsubscribePresence();
    };
  }, [socket.connected]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket.connected || isLoading) {
      if (DEBUG) {
        console.log("[ChatRoom] Send message blocked:", {
          hasMessage: !!newMessage.trim(),
          connected: socket.connected,
          loading: isLoading,
        });
      }
      return;
    }

    setIsLoading(true);
    try {
      if (DEBUG) {
        console.log("[ChatRoom] Sending message:", {
          username,
          text: newMessage.trim(),
        });
      }

      // Using type-safe publish - provides compile-time type checking
      const result = await typedPublish(socket, "chat.messages", "send", {
        username, // ✅ Type-checked against schema
        text: newMessage.trim(), // ✅ Type-checked against schema
        // extra: "field" // ❌ Would cause TypeScript error (when proper typing is enabled)
      });

      if (DEBUG) {
        console.log("[ChatRoom] Message send result:", result);
      }

      if (result.ok) {
        setNewMessage("");
      } else {
        console.error("Failed to send message:", result.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-800 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Chat Room</h2>
          <p className="text-blue-100">
            Connected as <span className="font-medium">{username}</span> |
            Status:{" "}
            {socket.connected ? (
              <span className="text-green-200">Connected</span>
            ) : (
              <span className="text-red-200">Disconnected</span>
            )}
          </p>
        </div>
        <button
          onClick={onDisconnect}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.username === username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.username === "System"
                    ? "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-center italic"
                    : message.username === username
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
              >
                {message.username !== "System" &&
                  message.username !== username && (
                    <div className="text-xs font-medium mb-1">
                      {message.username}
                    </div>
                  )}
                <div className="text-sm">{message.text}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.username === username ||
                    message.username === "System"
                      ? "text-blue-100"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t dark:border-gray-700 p-4">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={!socket.connected || isLoading}
          />
          <button
            type="submit"
            disabled={!socket.connected || isLoading || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </form>
      </div>

      {/* Connection Info */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 text-xs text-gray-600 dark:text-gray-300">
        Server: {serverUrl} | App ID: {appId}
      </div>
    </div>
  );
}
