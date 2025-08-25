import React, { useEffect, useState } from 'react'

export function AdminUsers({ token }: { token?: string }) {
  const [users, setUsers] = useState<any[]>([])
  const [err, setErr] = useState<string | null>(null)

  const load = async () => {
    if (!token) return
    try {
      setErr(null)
      const res = await fetch('/api/users', { headers: { authorization: `Bearer ${token}` }})
      if (!res.ok) throw new Error(await res.text())
      setUsers(await res.json())
    } catch (e: any) { setErr(e.message) }
  }

  useEffect(() => { load() }, [token])

  const ban = async (userId: string, banned: boolean) => {
    if (!token) return
    await fetch('/api/users/ban', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ userId, banned }) })
    await load()
  }
  const roles = async (userId: string, add: string[] = [], remove: string[] = []) => {
    if (!token) return
    await fetch('/api/users/roles', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ userId, add, remove }) })
    await load()
  }

  return (
    <div className="card p-4 md:col-span-3">
      <div className="font-semibold mb-2">Admin: Users</div>
      {err && <div className="text-red-400 text-xs mb-2">{err}</div>}
      <div className="grid gap-2">
        {users.map(u => (
          <div key={u.id} className="border border-white/10 rounded p-2 text-xs flex items-center justify-between">
            <div>
              <div>{u.email || u.id}</div>
              <div className="opacity-70">roles: {(u.roles||[]).join(', ') || '-'}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded" onClick={()=>roles(u.id, ['admin'], [])}>Add admin</button>
              <button className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded" onClick={()=>roles(u.id, [], ['admin'])}>Remove admin</button>
              {u.banned ? (
                <button className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded" onClick={()=>ban(u.id, false)}>Unban</button>
              ) : (
                <button className="px-2 py-1 bg-red-500/20 border border-red-500/40 rounded" onClick={()=>ban(u.id, true)}>Ban</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

