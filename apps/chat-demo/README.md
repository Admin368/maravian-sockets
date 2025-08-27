# Maravian Sockets Chat Demo

A live chat application built with Next.js that demonstrates the power of Maravian Sockets for real-time communication.

## Features

- 🚀 Real-time messaging using Maravian Sockets
- 👥 User presence tracking (join/leave notifications)
- 🎨 Modern UI with Tailwind CSS
- 🌙 Dark mode support
- 📱 Responsive design
- ✨ Type-safe socket connections

## Quick Start

### 1. Start the Maravian Sockets Server

From the repository root:

```bash
pnpm dev
```

This starts the server on http://localhost:8080

### 2. Set up a Chat App

1. Visit the dashboard at http://localhost:8080
2. Login with default credentials:
   - Email: `admin@example.com`
   - Password: `changeme`
3. Create a new app with ID: `chat-demo`
4. Save the generated app key

### 3. Create Chat Schema

Use the CLI to create and push a chat schema:

```bash
# Create schema config
npx @maravian/maravian-sockets-cli init --out chat-schema.config.ts

# Edit the config to define chat messages:
```

**chat-schema.config.ts:**

```typescript
import { z } from "zod";
import { defineSchema } from "@maravian/maravian-sockets-types";

export default defineSchema({
  appId: "chat-demo",
  version: new Date().toISOString(),
  topics: [
    {
      topic: "chat.messages",
      description: "Chat messages topic",
      messages: [
        {
          name: "message",
          direction: "publish",
          payload: z.object({
            username: z.string(),
            text: z.string(),
          }),
        },
      ],
    },
  ],
});
```

```bash
# Push schema to server
npx @maravian/maravian-sockets-cli push --server http://localhost:8080 --app-id chat-demo --app-key YOUR_APP_KEY --config ./chat-schema.config.ts
```

### 4. Run the Chat Demo

```bash
# From repository root
pnpm dev:chat-demo

# Or from chat-demo directory
cd apps/chat-demo
pnpm dev
```

Visit http://localhost:3000 and start chatting!

## How It Works

### Architecture

1. **Next.js Frontend**: Provides the chat UI and handles user interactions
2. **Maravian Sockets SDK**: React hook for type-safe socket connections
3. **Socket Server**: Handles real-time message delivery and user presence
4. **Schema Validation**: Ensures message payloads match defined types

### Key Components

- **ConnectionForm**: Handles server/app connection setup
- **ChatRoom**: Main chat interface with real-time messaging
- **MSocketProvider**: React context provider for socket connection

### Message Flow

1. User types a message and clicks "Send"
2. `socket.publish()` sends the message to the server
3. Server validates the message against the schema
4. Server broadcasts the message to all connected clients
5. All clients receive the message via `socket.onTopic()`
6. UI updates in real-time

## Development

### Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint

### Environment Variables

Create a `.env` file:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:8080
NEXT_PUBLIC_APP_ID=chat-demo
```

## Customization

### Adding Features

1. **Rooms**: Extend the schema to support multiple chat rooms
2. **Media**: Add support for image/file sharing
3. **Authentication**: Integrate with the server's JWT auth system
4. **Persistence**: Store chat history using the server's message API

### Schema Extensions

Modify your schema to add new message types:

```typescript
{
  topic: 'chat.messages',
  messages: [
    { name: 'message', direction: 'publish', payload: z.object({...}) },
    { name: 'typing', direction: 'publish', payload: z.object({ username: z.string() }) },
    { name: 'media', direction: 'publish', payload: z.object({ username: z.string(), url: z.string() }) }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Connection Failed**: Ensure the Maravian Sockets server is running
2. **Schema Errors**: Check that your schema matches the server configuration
3. **App Not Found**: Verify the app ID exists in the dashboard

### Debug Mode

Check the browser console for detailed error messages and connection status.

## Next Steps

- Explore the [Maravian Sockets Documentation](../../WARP.md)
- Check out the [Server Dashboard](http://localhost:8080)
- Build your own real-time application!
