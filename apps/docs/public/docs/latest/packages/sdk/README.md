# @maravian/maravian-sockets-sdk

React hooks and components for seamless integration with Maravian Sockets server.

## Overview

The SDK provides React developers with type-safe hooks and components to interact with Maravian Sockets servers. It handles connection management, authentication, and real-time messaging with full TypeScript support.

## Key Features

- **React Hooks**: Easy-to-use hooks for socket operations
- **Type Safety**: Full TypeScript support with generated types
- **Auto-reconnection**: Automatic connection recovery
- **Room Management**: Join/leave rooms with ease
- **Authentication**: Built-in JWT token handling
- **Context Provider**: React Context for global socket state

## Installation

```bash
npm install @maravian/maravian-sockets-sdk
# or
pnpm add @maravian/maravian-sockets-sdk
```

## Quick Start

### 1. Setup the Provider

```tsx
import { MSocketProvider } from '@maravian/maravian-sockets-sdk';

function App() {
  return (
    <MSocketProvider
      serverUrl="http://localhost:8080"
      appId="your-app-id"
      appKey="your-app-key" // Optional for development
      autoConnect={true}
    >
      <YourApp />
    </MSocketProvider>
  );
}
```

### 2. Use the Hook

```tsx
import { useMSocket } from '@maravian/maravian-sockets-sdk';

function ChatComponent() {
  const { client, connected } = useMSocket();

  // Listen for messages
  useEffect(() => {
    if (!client) return;
    
    const unsubscribe = client.onTopic('chat.messages', (message) => {
      console.log('Received:', message);
    });
    
    return unsubscribe;
  }, [client]);

  // Send a message
  const sendMessage = async () => {
    if (!client) return;
    
    await client.publish('chat.messages', 'send', {
      text: 'Hello, World!',
      timestamp: Date.now()
    });
  };

  return (
    <div>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={sendMessage} disabled={!connected}>
        Send Message
      </button>
    </div>
  );
}
```

## Hooks

### `useMSocket()`

The main hook that provides access to the socket client and connection state.

```tsx
const {
  client,           // MSocketClient instance
  connected,        // boolean connection status
  connect,          // function to connect
  disconnect        // function to disconnect
} = useMSocket();
```

### `useMSocketWithAuth()`

Extended hook with authentication support.

```tsx
const {
  client,
  connected,
  authenticated,
  login,
  logout
} = useMSocketWithAuth();
```

## Client API

### Connection Management

```tsx
// Connect with optional token
client.connect(token);

// Disconnect
client.disconnect();

// Check connection status
console.log(client.connected);
```

### Room Management

```tsx
// Join a room
client.joinRoom('room-123');

// Leave a room
client.leaveRoom('room-123');
```

### Messaging

```tsx
// Publish a message
await client.publish('topic-name', 'message-type', payload, 'optional-room');

// Subscribe to topic
const unsubscribe = client.onTopic('topic-name', (message) => {
  console.log('Received:', message.payload);
});

// Clean up subscription
unsubscribe();
```

### Authentication

```tsx
// Login with JWT token
client.login(jwtToken);

// Logout
client.logout();
```

### Admin Operations

```tsx
// Ban a user (admin only)
await client.admin.ban('user-id');

// Unban a user (admin only)
await client.admin.unban('user-id');
```

## TypeScript Support

When used with the CLI-generated types, you get full type safety:

```tsx
import type { 
  TopicName, 
  PublishPayload, 
  SubscribePayload 
} from './generated-types';

// Type-safe publishing
const payload: PublishPayload<'chat.messages', 'send'> = {
  text: 'Hello',
  timestamp: Date.now()
};

await client.publish('chat.messages', 'send', payload);
```

## Error Handling

```tsx
const { client } = useMSocket({
  onError: (error) => {
    console.error('Socket error:', error);
  },
  onDisconnect: () => {
    console.log('Disconnected from server');
  }
});
```

## Examples

See the [chat demo app](../../apps/chat-demo) for a complete implementation example.

## API Reference

For complete API documentation, see the [generated TypeDoc documentation](../../docs/generated/latest/packages/sdk).

## Version

Current version: 0.5.0

## License

See the main project license for details.
