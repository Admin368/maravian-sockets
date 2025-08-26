const { z, defineSchema } = require('@maravian/maravian-sockets-types');

module.exports = defineSchema({
  appId: 'chat2',
  version: new Date().toISOString(),
  topics: [
    {
      topic: 'chat.messages',
      description: 'Chat messages topic',
      messages: [
        { 
          name: 'send', 
          direction: 'both', 
          payload: z.object({ 
            username: z.string(), 
            text: z.string() 
          }) 
        }
      ]
    },
    {
      topic: 'system.presence',
      description: 'System presence events',
      messages: [
        {
          name: 'user.join',
          direction: 'both',
          payload: z.object({
            username: z.string()
          })
        },
        {
          name: 'user.leave', 
          direction: 'both',
          payload: z.object({
            username: z.string()
          })
        }
      ]
    }
  ]
});
