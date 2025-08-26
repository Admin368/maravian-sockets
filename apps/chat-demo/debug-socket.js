/* eslint-disable @typescript-eslint/no-require-imports */
// Debug script to test socket connection directly
const { io } = require("socket.io-client");

const serverUrl = "http://localhost:8080";
const appId = "chat3";
const token = "3gfdm_UytfTPTsux9Uettk7eDCEkV9OK";

console.log("Attempting to connect to:", { serverUrl, appId });

// Test with appKey as query parameter instead of auth token
const socket = io(serverUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  timeout: 3000,
  query: {
    appId,
    appKey: token, // Try using appKey instead of auth token
  },
  forceNew: true,
});

socket.on("connect", () => {
  console.log("✅ Socket connected successfully!");
  console.log("Socket ID:", socket.id);

  // Test publishing a message
  socket.emit(
    "publish",
    {
      appId,
      topic: "chat.messages",
      type: "message",
      payload: { username: "test", text: "Hello from debug script!" },
    },
    (ack) => {
      console.log("Message publish result:", ack);
    }
  );
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error);
});

socket.on("error", (error) => {
  console.error("❌ Socket error:", error);
});

socket.on("chat.messages", (msg) => {
  console.log("📨 Received message:", msg);
});

// Connect
console.log("Connecting...");
socket.connect();

// Cleanup after 5 seconds
setTimeout(() => {
  console.log("Closing connection...");
  socket.close();
  process.exit(0);
}, 5000);
