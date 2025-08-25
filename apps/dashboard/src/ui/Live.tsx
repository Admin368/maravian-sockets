import React, { useEffect, useMemo, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function Live({ serverUrl, appId, token, topics }: { serverUrl: string, appId: string, token?: string, topics: any[] }) {
  const [filter, setFilter] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const s = io(serverUrl, { transports: ['websocket'], query: { appId }, auth: { token }})
    socketRef.current = s
    const push = (topic: string) => (msg: any) => {
      setMessages(m => [{ topic, ...msg, ts: msg.ts || Date.now() }, ...m].slice(0, 200))
    }
    s.on('system.presence', push('system.presence'))
    s.on('system.connection', push('system.connection'))
    for (const t of topics) {
      s.on(t.topic, push(t.topic))
    }
    return () => { s.close() }
  }, [serverUrl, appId, token, topics.map(t=>t.topic).join(',')])

  const filtered = useMemo(() => {
    if (!filter) return messages
    const f = filter.toLowerCase()
    return messages.filter(m => (m.topic||'').toLowerCase().includes(f) || (m.type||'').toLowerCase().includes(f))
  }, [messages, filter])

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input className="bg-transparent border border-white/10 rounded px-2 py-1 w-full" placeholder="filter by topic or type" value={filter} onChange={e=>setFilter(e.target.value)} />
      </div>
      <div className="grid gap-2 max-h-80 overflow-auto">
        {filtered.map((m, i) => (
          <div key={i} className="border border-white/10 rounded p-2 text-xs">
            <div className="opacity-70">{new Date(m.ts).toLocaleTimeString()} • <span className="text-[var(--accent)]">{m.topic}</span> • {m.type}</div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(m.payload, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}
