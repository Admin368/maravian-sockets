# @maravian/maravian-sockets-types

Core TypeScript type definitions for the Maravian Sockets framework.

## Overview

This package provides the fundamental types, interfaces, and utilities used across the Maravian Sockets ecosystem. It includes schema definitions for topics, messages, and configuration validation.

## Key Features

- **Schema Definition**: Define socket topics and message structures with type safety
- **Validation**: Runtime schema validation using Zod
- **Type Safety**: Complete TypeScript support for all socket operations
- **Extensible**: Flexible schema system that grows with your application

## Core Types

### `AppSchema`
The main configuration interface for defining your socket application structure.

### `TopicDef`
Defines a topic with its associated messages and metadata.

### `MessageShape`
Type definition for individual message structures within topics.

### `SocketUser`
User authentication and session information.

## Usage

```typescript
import { defineSchema, messageSchema } from '@maravian/maravian-sockets-types';
import { z } from 'zod';

export default defineSchema({
  appId: 'my-app',
  version: '1.0.0',
  topics: [
    {
      topic: 'chat.messages',
      description: 'Real-time chat messages',
      messages: [
        messageSchema('send', 'publish', z.object({
          text: z.string(),
          channel: z.string()
        })),
        messageSchema('received', 'subscribe', z.object({
          text: z.string(),
          from: z.string(),
          timestamp: z.number()
        }))
      ]
    }
  ]
});
```

## API Reference

For complete API documentation, see the [generated TypeDoc documentation](../../docs/generated/latest/packages/types).

## Version

Current version: 0.5.0

## License

See the main project license for details.
