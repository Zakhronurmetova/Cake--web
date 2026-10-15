import { useState } from 'react'
import { api } from '../api.js'
import { COLORS, FLOW, fmt } from '../constants.js'
import { Badge, Button } from './ui.jsx'

const field = 'rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm'
const DONE = ['Rad etildi', 'Bekor qilindi', 'Topshirildi']

export default function Orders({ orders, say, baker, reload }) {
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState('')
  const list = orders.filter((o) => (!status || o.status === status) && (!date || o.date === date))
  const active = orders.filter((o) => !DONE.includes(o.status)).length
  // Kunlik yuklama: har bir sana uchun faol buyurtmalar soni
  const load = {}
  orders.filter((o) => !['Rad etildi', 'Bekor qilindi'].includes(o.status)).forEach((o) => { load[o.date] = (load[o.date] || 0) + 1 })

  async function move(o, to, reason) {
    if (busy) return
    setBusy(o.id)
    try {
      await api.post(`/api/orders/${o.id}/status`, { to, reason })
      say('Holat: ' + to)
      reload()
    } catch (x) {
      say(x.message, true)
    }
    setBusy('')
  }

  function actions(o) {
    const next = FLOW[FLOW.indexOf(o.status) + 1]
    if (baker) {
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          {o.status === 'Yangi' && (
            <Button disabled={!!busy} className="bg-red-100 text-red-700" onClick={() => {
              const r = (prompt('Rad etish sababi:') || '').trim()
              r ? move(o, 'Rad etildi', r) : say('Sabab kiritish shart', true)
            }}>Rad etish</Button>
          )}
          {next && <Button disabled={!!busy} onClick={() => move(o, next)}>{busy === o.id ? '…' : '→ ' + next}</Button>}
        </div>
      )
    }
    return o.status === 'Yangi' && (
      <div className="mt-3">
        <Button disabled={!!busy} className="bg-stone-200 text-stone-700" onClick={() => confirm('Buyurtmani bekor qilasizmi?') && move(o, 'Bekor qilindi')}>
          Bekor qilish
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-rose-600 px-3 py-1 text-sm font-semibold text-white">Faol: {active}</span>
        <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Barcha holatlar</option>
          {Object.keys(COLORS).map((x) => <option key={x}>{x}</option>)}
        </select>
        <input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
        {date && <button className="text-sm underline" onClick={() => setDate('')}>Tozalash</button>}
      </div>
      {baker && (
        <p className="mb-3 text-sm text-stone-600">
          Kunlik yuklama: {Object.keys(load).sort().map((d) => `${d} → ${load[d]}`).join(' · ') || "buyurtmalar yo'q"}
        </p>
      )}
      {!list.length ? (
        <p className="rounded-xl bg-white p-8 text-center text-stone-500">Buyurtmalar yo'q</p>
      ) : (
        <div className="space-y-3">
          {list.map((o) => (
            <div key={o.id} className="rounded-2xl bg-white p-4 shadow">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">{o.emoji} {o.cakeName}</h3>
                <Badge status={o.status} />
              </div>
              <p className="mt-1 text-sm text-stone-600">
                № {o.id.slice(-6).toUpperCase()} · {o.occasion} · {o.flavor} · {o.kg} kg (≈{o.pcs} dona) · {o.deco}
                {o.text ? ` · Yozuv: «${o.text}»` : ''}
              </p>
              <p className="text-sm text-stone-600">Olish: {o.date} {o.time}{baker ? ` · ${o.customerName} · ${o.phone}` : ''}</p>
              <p className="mt-1 font-bold text-rose-700">{fmt(o.total)}</p>
              {o.reason && <p className="mt-1 text-sm text-red-700">Sabab: {o.reason}</p>}
              {actions(o)}
              <details className="mt-2 text-xs text-stone-500">
                <summary className="cursor-pointer">Tarix</summary>
                {o.history.map((h, i) => <div key={i}>{new Date(h.t).toLocaleString('ru-RU')} — {h.s} ({h.by})</div>)}
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
