[**Maravian Sockets Documentation v0.5.0**](../../../README.md)

***

[Maravian Sockets Documentation](../../../modules.md) / [types/src](../README.md) / presenceJoin

# Variable: presenceJoin

> `const` **presenceJoin**: `ZodObject`\<\{ `type`: `ZodString`; `payload`: `ZodObject`\<\{ `user`: `ZodObject`\<\{ `id`: `ZodString`; `displayName`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `id`: `string`; `displayName?`: `string`; \}, \{ `id`: `string`; `displayName?`: `string`; \}\>; `users`: `ZodArray`\<`ZodObject`\<\{ `id`: `ZodString`; `displayName`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `id`: `string`; `displayName?`: `string`; \}, \{ `id`: `string`; `displayName?`: `string`; \}\>, `"many"`\>; \}, `"strip"`, `ZodTypeAny`, \{ `user`: \{ `id`: `string`; `displayName?`: `string`; \}; `users`: `object`[]; \}, \{ `user`: \{ `id`: `string`; `displayName?`: `string`; \}; `users`: `object`[]; \}\>; \}, `"strip"`, `ZodTypeAny`, \{ `type`: `string`; `payload`: \{ `user`: \{ `id`: `string`; `displayName?`: `string`; \}; `users`: `object`[]; \}; \}, \{ `type`: `string`; `payload`: \{ `user`: \{ `id`: `string`; `displayName?`: `string`; \}; `users`: `object`[]; \}; \}\>

Defined in: [packages/types/src/index.ts:79](https://github.com/yourusername/maravian-sockets/blob/main/packages/types/src/index.ts#L79)
