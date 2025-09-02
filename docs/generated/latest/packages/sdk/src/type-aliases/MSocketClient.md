[**Maravian Sockets Documentation v0.5.0 v0.5.0**](../../../../README.md)

***

[Maravian Sockets Documentation v0.5.0](../../../../modules.md) / [packages/sdk/src](../README.md) / MSocketClient

# Type Alias: MSocketClient

> **MSocketClient** = `object`

Defined in: [packages/sdk/src/index.tsx:26](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L26)

## Properties

### socket

> **socket**: `Socket` \| `null`

Defined in: [packages/sdk/src/index.tsx:27](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L27)

***

### connected

> **connected**: `boolean`

Defined in: [packages/sdk/src/index.tsx:28](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L28)

***

### connect()

> **connect**: (`token?`) => `void`

Defined in: [packages/sdk/src/index.tsx:29](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L29)

#### Parameters

##### token?

`string`

#### Returns

`void`

***

### disconnect()

> **disconnect**: () => `void`

Defined in: [packages/sdk/src/index.tsx:30](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L30)

#### Returns

`void`

***

### onTopic()

> **onTopic**: \<`TPayload`\>(`topic`, `listener`) => () => `void`

Defined in: [packages/sdk/src/index.tsx:31](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L31)

#### Type Parameters

##### TPayload

`TPayload` = `any`

#### Parameters

##### topic

`string`

##### listener

(`msg`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### publish()

> **publish**: \<`TPayload`\>(`topic`, `type`, `payload`, `room?`) => `Promise`\<\{ `ok`: `boolean`; `error?`: `string`; \}\>

Defined in: [packages/sdk/src/index.tsx:35](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L35)

#### Type Parameters

##### TPayload

`TPayload` = `any`

#### Parameters

##### topic

`string`

##### type

`string`

##### payload

`TPayload`

##### room?

`string`

#### Returns

`Promise`\<\{ `ok`: `boolean`; `error?`: `string`; \}\>

***

### joinRoom()

> **joinRoom**: (`room`) => `void`

Defined in: [packages/sdk/src/index.tsx:41](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L41)

#### Parameters

##### room

`string`

#### Returns

`void`

***

### leaveRoom()

> **leaveRoom**: (`room`) => `void`

Defined in: [packages/sdk/src/index.tsx:42](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L42)

#### Parameters

##### room

`string`

#### Returns

`void`

***

### login()

> **login**: (`token`) => `void`

Defined in: [packages/sdk/src/index.tsx:43](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L43)

#### Parameters

##### token

`string`

#### Returns

`void`

***

### logout()

> **logout**: () => `void`

Defined in: [packages/sdk/src/index.tsx:44](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L44)

#### Returns

`void`

***

### admin

> **admin**: `object`

Defined in: [packages/sdk/src/index.tsx:45](https://github.com/yourusername/maravian-sockets/blob/main/packages/sdk/src/index.tsx#L45)

#### ban()

> **ban**: (`userId`) => `Promise`\<\{ `ok`: `boolean`; `error?`: `string`; \}\>

##### Parameters

###### userId

`string`

##### Returns

`Promise`\<\{ `ok`: `boolean`; `error?`: `string`; \}\>

#### unban()

> **unban**: (`userId`) => `Promise`\<\{ `ok`: `boolean`; `error?`: `string`; \}\>

##### Parameters

###### userId

`string`

##### Returns

`Promise`\<\{ `ok`: `boolean`; `error?`: `string`; \}\>
