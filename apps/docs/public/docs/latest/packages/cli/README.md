# @maravian/maravian-sockets-cli

Command-line interface for managing Maravian Sockets schemas and code generation.

## Overview

The CLI tool enables developers to define, push, and generate type-safe code for their socket applications. It handles schema management, code generation, and server interaction from the command line.

## Key Features

- **Schema Definition**: Create and manage socket schemas with TypeScript
- **Code Generation**: Generate TypeScript types and helper functions
- **Schema Push**: Deploy schemas to your server
- **Version Management**: Track and manage schema versions
- **Type Safety**: Full TypeScript support throughout

## Installation

```bash
# Install globally
npm install -g @maravian/maravian-sockets-cli

# Or use with npx
npx @maravian/maravian-sockets-cli --help

# Or use locally in project
pnpm add @maravian/maravian-sockets-cli
```

## Commands

### `init`

Create a starter schema configuration file.

```bash
maravian-sockets init [options]

Options:
  -o, --out <file>   Output file (default: "socketmax.config.ts")
```

Example:
```bash
maravian-sockets init --out my-schema.config.ts
```

This creates a basic schema file:

```typescript
import { z } from 'zod';
import { defineSchema } from '@maravian/maravian-sockets-types';

export default defineSchema({
  appId: 'my-app',
  version: new Date().toISOString(),
  topics: [
    {
      topic: 'chat.messages',
      description: 'Chat topic',
      messages: [
        { 
          name: 'send', 
          direction: 'publish', 
          payload: z.object({ text: z.string() }) 
        },
        { 
          name: 'received', 
          direction: 'subscribe', 
          payload: z.object({ 
            text: z.string(), 
            from: z.string() 
          }) 
        }
      ]
    }
  ]
});
```

### `push`

Push your schema to the server.

```bash
maravian-sockets push --server <url> --app-id <id> --app-key <key> --config <file>

Required:
  --server <url>     Server URL
  --app-id <id>      Application ID
  --app-key <key>    Application key
  --config <file>    Path to schema config file
```

Example:
```bash
maravian-sockets push \
  --server http://localhost:8080 \
  --app-id my-app \
  --app-key your-app-key \
  --config ./socketmax.config.ts
```

### `generate`

Generate TypeScript types and helpers from the latest server schema.

```bash
maravian-sockets generate --server <url> --app-id <id> [options]

Required:
  --server <url>     Server URL
  --app-id <id>      Application ID

Options:
  --dts-out <file>   Output declaration file (default: "maravian-sockets.generated.d.ts")
  --ts-out <file>    Optional typed helper .ts file
```

Example:
```bash
maravian-sockets generate \
  --server http://localhost:8080 \
  --app-id my-app \
  --dts-out ./types/generated.d.ts \
  --ts-out ./types/helpers.ts
```

This generates:

**generated.d.ts**:
```typescript
declare namespace SocketMaxGenerated {
  interface Topics {
    "chat.messages": {
      publish: { "send": { text: string } };
      subscribe: { "received": { text: string; from: string } };
    }
  }
}
```

**helpers.ts**:
```typescript
export type TopicName = keyof Topics;
export type PublishType<T extends TopicName> = keyof Topics[T]['publish'];
// ... more helper types and functions
```

### `schema:pull`

Pull the latest schema from the server.

```bash
maravian-sockets schema:pull --server <url> --app-id <id>
```

### `log`

List all schema versions for an application.

```bash
maravian-sockets log --server <url> --app-id <id>
```

## Workflow

### 1. Initialize Schema

```bash
maravian-sockets init --out chat-schema.config.ts
```

### 2. Define Your Schema

Edit the generated config file to define your topics and messages:

```typescript
export default defineSchema({
  appId: 'chat-app',
  version: '1.0.0',
  topics: [
    {
      topic: 'chat.room',
      description: 'Chat room messages',
      messages: [
        {
          name: 'join',
          direction: 'publish',
          payload: z.object({
            username: z.string(),
            room: z.string()
          })
        },
        {
          name: 'message',
          direction: 'both',
          payload: z.object({
            text: z.string(),
            timestamp: z.number()
          })
        }
      ]
    }
  ]
});
```

### 3. Push to Server

```bash
maravian-sockets push \
  --server http://localhost:8080 \
  --app-id chat-app \
  --app-key your-key \
  --config chat-schema.config.ts
```

### 4. Generate Types

```bash
maravian-sockets generate \
  --server http://localhost:8080 \
  --app-id chat-app \
  --dts-out ./src/types/socket.d.ts \
  --ts-out ./src/types/socket-helpers.ts
```

### 5. Use in Your App

```typescript
import { typedPublish, typedOnTopic } from './types/socket-helpers';

// Type-safe publishing
typedPublish(client, 'chat.room', 'join', {
  username: 'john',
  room: 'general'
});

// Type-safe subscriptions
typedOnTopic(client, 'chat.room', (message) => {
  // message is fully typed
  console.log(message.payload.text);
});
```

## Configuration File Format

The schema configuration uses Zod for validation:

```typescript
import { z } from 'zod';
import { defineSchema } from '@maravian/maravian-sockets-types';

export default defineSchema({
  appId: string,           // Unique application identifier
  version: string,         // Schema version (semver recommended)
  topics: [
    {
      topic: string,       // Topic name (e.g., 'chat.messages')
      description?: string, // Optional description
      system?: boolean,    // System topic flag
      messages: [
        {
          name: string,           // Message type name
          direction: 'publish' | 'subscribe' | 'both',
          payload?: ZodSchema     // Zod schema for validation
        }
      ]
    }
  ]
});
```

## Error Handling

The CLI provides clear error messages for common issues:

- **Config file not found**: Check the path to your config file
- **Server connection failed**: Verify server URL and network connectivity
- **Invalid schema**: Review Zod validation errors in your schema
- **Authentication failed**: Check your app-id and app-key

## API Reference

For complete API documentation, see the [generated TypeDoc documentation](../../docs/generated/latest/packages/cli).

## Version

Current version: 0.5.0

## License

See the main project license for details.
