import { useState } from 'react'
import { COLORS } from '../constants.js'

export const selectCls = 'mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2'

export function Field({ label, className = '', ...props }) {
  return (
    <label className={'block text-sm ' + className}>
      <span className="text-stone-600">{label}</span>
      <input className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2" {...props} />
    </label>
  )
}

export function Button({ className = 'bg-rose-600 text-white hover:bg-rose-700', ...props }) {
  return <button className={'rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ' + className} {...props} />
}

export const Badge = ({ status }) => (
  <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (COLORS[status] || '')}>{status}</span>
)

// Mahsulot rasmi; rasm bo'lmasa yoki yuklanmasa emoji ko'rsatiladi
export function Pic({ c, cls, txt }) {
  const [bad, setBad] = useState(false)
  if (c.img && !bad) return <img src={c.img} alt={c.name} loading="lazy" onError={() => setBad(true)} className={cls + ' object-cover'} />
  return <div className={cls + ' flex items-center justify-center bg-gradient-to-br from-rose-100 to-amber-100 ' + txt}>{c.emoji}</div>
}
