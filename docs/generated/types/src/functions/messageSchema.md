[**Maravian Sockets Documentation v0.5.0**](../../../README.md)

***

[Maravian Sockets Documentation](../../../modules.md) / [types/src](../README.md) / messageSchema

# Function: messageSchema()

> **messageSchema**\<`T`\>(`payload`): `ZodObject`\<\{ `type`: `ZodString`; `payload`: `T`; \}, `"strip"`, `ZodTypeAny`, \{ \[k in "type" \| "payload"\]: addQuestionMarks\<baseObjectOutputType\<\{ type: ZodString; payload: T \}\>, any\>\[k\] \}, \{ \[k in "type" \| "payload"\]: baseObjectInputType\<\{ type: ZodString; payload: T \}\>\[k\] \}\>

Defined in: [packages/types/src/index.ts:7](https://github.com/yourusername/maravian-sockets/blob/main/packages/types/src/index.ts#L7)

## Type Parameters

### T

`T` *extends* `ZodTypeAny`

## Parameters

### payload

`T`

## Returns

`ZodObject`\<\{ `type`: `ZodString`; `payload`: `T`; \}, `"strip"`, `ZodTypeAny`, \{ \[k in "type" \| "payload"\]: addQuestionMarks\<baseObjectOutputType\<\{ type: ZodString; payload: T \}\>, any\>\[k\] \}, \{ \[k in "type" \| "payload"\]: baseObjectInputType\<\{ type: ZodString; payload: T \}\>\[k\] \}\>
