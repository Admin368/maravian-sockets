import { z } from "zod";
import { defineSchema } from "@maravian/sockets-schema";

export default defineSchema({
  appId: "chat",
  version: new Date().toISOString(),
  topics: [
    {
      topic: "chat.messages",
      description: "Chat messages topic for real-time messaging",
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
