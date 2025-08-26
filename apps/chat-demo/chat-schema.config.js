const { z, defineSchema } = require('@maravian/maravian-sockets-types');

module.exports = defineSchema({
  appId: 'my-app',
  version: new Date().toISOString(),
  topics: [
    {
      topic: 'chat.messages',
      description: 'Chat topic',
      messages: [
        { name: 'send', direction: 'publish', payload: z.object({ text: z.string() }) },
        { name: 'received', direction: 'subscribe', payload: z.object({ text: z.string(), from: z.string() }) }
      ]
    }
  ]
});
