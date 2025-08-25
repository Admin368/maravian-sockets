import { z } from "zod";

// Re-export z for convenience so users don't need to install zod separately
export { z };

// Core primitives for the schema DSL
export const messageSchema = <T extends z.ZodTypeAny>(payload: T) =>
  z.object({
    type: z.string().min(1),
    payload,
  });

export type MessageShape<T extends z.ZodTypeAny> = z.infer<ReturnType<typeof messageSchema<T>>>;

export type TopicMessageDef = {
  name: string; // message type key within topic
  direction: "publish" | "subscribe" | "both"; // what the client can do
  payload: z.ZodTypeAny;
};

export type TopicDef = {
  topic: string;
  description?: string;
  messages: TopicMessageDef[];
  system?: boolean; // true for built-ins like user.join/leave
};

export type AppSchema = {
  appId: string;
  version: string; // semantic or timestamp-based
  topics: TopicDef[];
};

export type ResolvedMessage = {
  topic: string;
  type: string;
  payload: unknown;
  ts: number;
  userId?: string;
  room?: string;
};

export type SocketUser = {
  id: string;
  email?: string;
  displayName?: string;
  roles: string[]; // ["admin", ...]
  banned?: boolean;
};

export type Room = {
  id: string;
  name: string;
  topic: string; // which topic this room belongs to (optional usage)
  createdAt: number;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type ServerInfo = {
  version: string;
  uptime: number;
};

// Helper to define an application schema with strong typing
export function defineSchema<T extends AppSchema>(schema: T) {
  return schema;
}

// Built-in system message helpers
export const SystemTopic = {
  Connection: "system.connection",
  Presence: "system.presence",
} as const;

export const presenceJoin = messageSchema(
  z.object({
    user: z.object({ id: z.string(), displayName: z.string().optional() }),
    users: z.array(z.object({ id: z.string(), displayName: z.string().optional() })),
  })
);

export const presenceLeave = messageSchema(
  z.object({
    userId: z.string(),
    users: z.array(z.object({ id: z.string(), displayName: z.string().optional() })),
  })
);

export const connectionStatus = messageSchema(
  z.object({
    status: z.enum(["connected", "disconnected", "reconnecting"]),
  })
);

export type PresenceJoin = z.infer<typeof presenceJoin>;
export type PresenceLeave = z.infer<typeof presenceLeave>;
export type ConnectionStatus = z.infer<typeof connectionStatus>;

