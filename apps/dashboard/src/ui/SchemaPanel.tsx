import React, { useEffect, useState } from 'react'

export function SchemaPanel({ serverUrl, appId, schema, onPushed }: { serverUrl: string, appId: string, schema: any, onPushed: ()=>void }) {
  const [text, setText] = useState('')
  const [appKey, setAppKey] = useState('')
  const [version, setVersion] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    setText(JSON.stringify(schema || { topics: [] }, null, 2))
    setVersion(new Date().toISOString())
  }, [schema])

  const push = async () => {
    setErr(null); setOk(null)
    try {
      const payload = JSON.parse(text)
      const res = await fetch(serverUrl + '/api/schema/push', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ appId, appKey, version, schema: payload })
      })
      if (!res.ok) throw new Error(await res.text())
      setOk('Pushed schema version ' + version)
      onPushed()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-2 text-xs">
        <input className="bg-transparent border border-white/10 rounded px-2 py-1" placeholder="app key" value={appKey} onChange={e=>setAppKey(e.target.value)} />
        <input className="bg-transparent border border-white/10 rounded px-2 py-1" placeholder="version (e.g. ISO date)" value={version} onChange={e=>setVersion(e.target.value)} />
        <button className="px-2 py-1 bg-[var(--accent)]/20 border border-[var(--accent)]/40 rounded" onClick={push}>Push</button>
      </div>
      <textarea className="w-full h-48 bg-transparent border border-white/10 rounded p-2 text-xs font-mono" value={text} onChange={e=>setText(e.target.value)} />
      {err && <div className="text-red-400 text-xs mt-1">{err}</div>}
      {ok && <div className="text-emerald-400 text-xs mt-1">{ok}</div>}
    </div>
  )
}

