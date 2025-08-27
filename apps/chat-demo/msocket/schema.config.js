/* eslint-disable @typescript-eslint/no-require-imports */
const { z, defineSchema } = require("@maravian/maravian-sockets-types");

module.exports = defineSchema({
  appId: process.env.NEXT_PUBLIC_MSOCKET_APP_ID,
  version: new Date().toISOString(),
  topics: [
    {
      topic: "chat.messages",
      description: "Chat messages",
      messages: [
        {
          name: "send",
          direction: "both",
          payload: z.object({ username: z.string(), text: z.string() }),
        },
      ],
    },
    {
      topic: "system.presence",
      description: "Presence",
      messages: [
        {
          name: "user.join",
          direction: "both",
          payload: z.object({ username: z.string() }),
        },
        {
          name: "user.leave",
          direction: "both",
          payload: z.object({ username: z.string() }),
        },
      ],
    },
  ],
});
