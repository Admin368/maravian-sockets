[**Maravian Sockets Documentation v0.5.0 v0.5.0**](../../../../README.md)

***

[Maravian Sockets Documentation v0.5.0](../../../../modules.md) / [packages/sdk/src](../README.md) / typedPublish

# Function: typedPublish()

> **typedPublish**(`client`, `topic`, `type`, `payload`, `room?`): `Promise`\<\{ `ok`: `boolean`; `error?`: `string`; \}\>

Defined in: [packages/sdk/src/index.tsx:238](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L238)

Type-safe publish function that provides IntelliSense for topic and message types
Usage: typedPublish(socket, "chat.messages", "send", { username: "John", text: "Hello" })

## Parameters

### client

[`MSocketClient`](../type-aliases/MSocketClient.md)

### topic

`string`

### type

`string`

### payload

`any`

### room?

`string`

## Returns

`Promise`\<\{ `ok`: `boolean`; `error?`: `string`; \}\>
