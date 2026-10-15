import { useState } from 'react'
import { api, setToken } from '../api.js'
import { Button, Field, selectCls } from './ui.jsx'

export default function Auth({ onLogin }) {
  const [reg, setReg] = useState(false)
  const [f, setF] = useState({ login: '', name: '', password: '', role: 'buyer', code: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setErr('')
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(f.login.trim())) return setErr('Login: 3–20 ta lotin harf, raqam yoki _')
    if (f.password.length < 6) return setErr("Parol kamida 6 belgi bo'lsin")
    if (reg && f.name.trim().length < 2) return setErr('Ismni kiriting')
    if (reg && f.role === 'baker' && !f.code.trim()) return setErr('Qandolatchi kodini kiriting')
    setBusy(true)
    try {
      const r = await api.post(reg ? '/api/register' : '/api/login', f)
      setToken(r.token)
      onLogin(r.user)
    } catch (x) {
      setErr(x.message)
    }
    setBusy(false)
  }

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-6 shadow">
      <div className="text-center text-5xl">🎂</div>
      <h1 className="mt-2 text-center text-2xl font-bold">Shirin Dunyo</h1>
      <p className="mb-4 text-center text-sm text-stone-500">Tort va milliy shirinliklarga buyurtma</p>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Login" value={f.login} onChange={set('login')} autoComplete="username" />
        {reg && <Field label="Ism" value={f.name} onChange={set('name')} />}
        <Field label="Parol" type="password" value={f.password} onChange={set('password')} autoComplete={reg ? 'new-password' : 'current-password'} />
        {reg && (
          <label className="block text-sm">Rol
            <select className={selectCls} value={f.role} onChange={set('role')}>
              <option value="buyer">Tort buyurtmachisi</option>
              <option value="baker">Qandolatchi</option>
            </select>
          </label>
        )}
        {reg && f.role === 'baker' && <Field label="Qandolatchi kodi" type="password" value={f.code} onChange={set('code')} />}
        {err && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
        <Button type="submit" disabled={busy} className="w-full bg-rose-600 text-white">
          {busy ? 'Kuting…' : reg ? "Ro'yxatdan o'tish" : 'Kirish'}
        </Button>
      </form>
      <button className="mt-3 w-full text-sm text-rose-700 underline" onClick={() => { setReg(!reg); setErr('') }}>
        {reg ? 'Akkauntim bor' : "Ro'yxatdan o'tish"}
      </button>
    </div>
  )
}
