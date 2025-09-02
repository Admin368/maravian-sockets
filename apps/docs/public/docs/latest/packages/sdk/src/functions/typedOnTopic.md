[**Maravian Sockets Documentation v0.5.0 v0.5.0**](../../../../README.md)

***

[Maravian Sockets Documentation v0.5.0](../../../../modules.md) / [packages/sdk/src](../README.md) / typedOnTopic

# Function: typedOnTopic()

> **typedOnTopic**\<`TPayload`\>(`client`, `topic`, `listener`): () => `void`

Defined in: [packages/sdk/src/index.tsx:252](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L252)

Type-safe onTopic function that provides IntelliSense for topic and message types
Usage: typedOnTopic(socket, "chat.messages", (msg) => { ... })

## Type Parameters

### TPayload

`TPayload` = `any`

## Parameters

### client

[`MSocketClient`](../type-aliases/MSocketClient.md)

### topic

`string`

### listener

(`msg`) => `void`

## Returns

> (): `void`

### Returns

`void`
