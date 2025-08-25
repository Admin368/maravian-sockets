import React, { useEffect, useMemo, useState } from 'react'
import { Live } from './Live'

const serverUrl = (import.meta as any).env?.VITE_SERVER_URL || window.location.origin

function useApi() {
  const base = serverUrl
  return {
    login: async (email: string, password: string) => {
      const res = await fetch(base + '/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) })
      if (!res.ok) throw new Error(await res.text())
      return res.json() as Promise<{ accessToken: string, user: any }>
    },
    apps: async (token: string) => {
      const res = await fetch(base + '/api/apps', { headers: { authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    createApp: async (token: string, appId: string, name?: string) => {
      const res = await fetch(base + '/api/apps', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ appId, name }) })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    topics: async (appId: string) => {
      const res = await fetch(base + `/api/topics?appId=${encodeURIComponent(appId)}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    rooms: async (appId: string) => {
      const res = await fetch(base + `/api/rooms?appId=${encodeURIComponent(appId)}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    schemaVersions: async (appId: string) => {
      const res = await fetch(base + `/api/schema/versions?appId=${encodeURIComponent(appId)}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    latestSchema: async (appId: string) => {
      const res = await fetch(base + `/api/schema/latest?appId=${encodeURIComponent(appId)}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    connected: async () => {
      const res = await fetch(base + '/api/users/connected')
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    }
  }
}

function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : initial
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)) }, [key, state])
  return [state, setState] as const
}

export function App() {
  const api = useApi()
  const [auth, setAuth] = useLocalStorage<any>('socketmax_auth', null)
  const [appSel, setAppSel] = useLocalStorage<string>('socketmax_app', '')
  const [apps, setApps] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [schema, setSchema] = useState<any | null>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [lastAppKey, setLastAppKey] = useState<string | null>(null)
  const [connected, setConnected] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      if (auth?.accessToken) {
        try { setApps(await api.apps(auth.accessToken)) } catch {}
      }
    })()
  }, [auth])

  useEffect(() => {
    (async () => {
      if (appSel) {
        try {
          setTopics(await api.topics(appSel))
          setRooms(await api.rooms(appSel))
          setSchema(await api.latestSchema(appSel))
          setVersions(await api.schemaVersions(appSel))
          setConnected(await api.connected())
        } catch {}
      }
    })()
  }, [appSel])

  return (
    <div className="min-h-screen techy p-6">
      <div className="max-w-7xl mx-auto grid gap-4">
        <Header auth={auth} onLogout={() => setAuth(null)} />
        {!auth && <Login onLogin={setAuth} />}
        {auth && (
          <>
            <AppsBar apps={apps} selected={appSel} onSelect={setAppSel} onCreate={async (id) => {
              const res = await api.createApp(auth.accessToken, id, id)
              setApps(await api.apps(auth.accessToken))
              setAppSel(res.appId)
              setLastAppKey(res.appKey)
            }} />
            {lastAppKey && (
              <Panel title="New App Credentials">
                <div className="text-sm">Save this App Key now. You won't be able to retrieve it later.</div>
                <pre className="text-xs mt-2">{JSON.stringify({ appId: appSel, appKey: lastAppKey }, null, 2)}</pre>
              </Panel>
            )}
            {appSel && (
              <div className="grid md:grid-cols-3 gap-4">
                <Panel title="Topics">
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(topics, null, 2)}</pre>
                </Panel>
                <Panel title="Rooms">
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(rooms, null, 2)}</pre>
                </Panel>
                <Panel title="Schema (latest)">
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(schema, null, 2)}</pre>
                </Panel>
                <Panel title="Connected Users">
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(connected, null, 2)}</pre>
                </Panel>
                <Panel title="Live Messages" className="md:col-span-2">
                  <Live serverUrl={serverUrl} appId={appSel} token={auth?.accessToken} topics={(schema?.topics)||[]} />
                </Panel>
                <Panel title="Schema Versions" className="md:col-span-3">
                  <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(versions, null, 2)}</pre>
                </Panel>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Header({ auth, onLogout }: { auth: any, onLogout: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-2xl font-semibold tracking-wide"><span className="text-[var(--accent)]">●</span> Socket Max</div>
      <div>
        {auth ? (
          <button className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded" onClick={onLogout}>Logout</button>
        ) : (
          <span className="text-sm opacity-75">Login to manage apps</span>
        )}
      </div>
    </div>
  )
}

function Login({ onLogin }: { onLogin: (auth: any) => void }) {
  const api = useApi()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('changeme')
  const [err, setErr] = useState<string | null>(null)
  return (
    <div className="card p-4">
      <div className="font-semibold mb-2">Login</div>
      <div className="flex gap-2">
        <input className="bg-transparent border border-white/10 rounded px-2 py-1 flex-1" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="bg-transparent border border-white/10 rounded px-2 py-1 flex-1" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="px-3 py-1 bg-[var(--accent)]/20 border border-[var(--accent)]/40 rounded" onClick={async()=>{
          try { setErr(null); onLogin(await api.login(email, password)) } catch(e:any){ setErr(e.message) }
        }}>Login</button>
      </div>
      {err && <div className="text-red-400 text-sm mt-2">{err}</div>}
    </div>
  )
}

function AppsBar({ apps, selected, onSelect, onCreate }: { apps: any[], selected: string, onSelect: (id: string)=>void, onCreate: (id: string)=>void }) {
  const [newId, setNewId] = useState('')
  return (
    <div className="card p-4 flex items-center gap-3">
      <select className="bg-transparent border border-white/10 rounded px-2 py-1" value={selected} onChange={e=>onSelect(e.target.value)}>
        <option value="">Select app</option>
        {apps.map(a=> <option key={a.app_id} value={a.app_id}>{a.app_id}</option>)}
      </select>
      <div className="opacity-60">or</div>
      <input className="bg-transparent border border-white/10 rounded px-2 py-1" placeholder="new app id" value={newId} onChange={e=>setNewId(e.target.value)} />
      <button className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded" onClick={()=>newId && onCreate(newId)}>Create app</button>
    </div>
  )
}

function Panel({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={`card p-4 ${className||''}`}>
      <div className="font-semibold mb-3">{title}</div>
      {children}
    </div>
  )
}

