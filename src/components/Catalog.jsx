import { useState } from 'react'
import { OCC, OEMO, fmt, sizeText, variants } from '../constants.js'
import { Pic } from './ui.jsx'
import OrderModal from './OrderModal.jsx'

const has = (c, x) => (c.occ || '').split(',').includes(x)
const field = 'rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm'

export default function Catalog({ cakes, me, say }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [occ, setOcc] = useState('')
  const [sel, setSel] = useState(null)
  const visible = cakes.filter((c) => !c.hidden)
  const list = visible.filter(
    (c) => c.name.toLowerCase().includes(q.toLowerCase()) && (!cat || c.cat === cat) && (!occ || has(c, occ)),
  )
  const chip = (active) => 'shrink-0 rounded-xl px-4 py-2 text-sm font-semibold ' + (active ? 'bg-rose-600 text-white' : 'bg-white shadow')

  return (
    <div>
      <h2 className="mb-2 font-semibold">Bayram yoki tadbirni tanlang</h2>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setOcc('')} className={chip(!occ)}>🍰 Hammasi ({visible.length})</button>
        {OCC.map((x) => (
          <button key={x} onClick={() => setOcc(x)} className={chip(occ === x)}>
            {OEMO[x]} {x} ({visible.filter((c) => has(c, x)).length})
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input className={field + ' min-w-[160px] flex-1'} placeholder="🔍 Nom bo'yicha qidirish" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={field} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Barcha turlar</option>
          <option value="Tort">Tortlar</option>
          <option value="Trend">Trenddagi shirinliklar</option>
          <option value="Milliy">Milliy shirinliklar</option>
        </select>
      </div>
      {occ && <h2 className="mb-3 text-xl font-bold text-rose-700">{OEMO[occ]} {occ} uchun shirinliklar</h2>}
      {!list.length ? (
        <p className="rounded-xl bg-white p-8 text-center text-stone-500">Hech narsa topilmadi</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <button key={c.id} onClick={() => setSel(c)} className="overflow-hidden rounded-2xl bg-white text-left shadow transition hover:shadow-lg">
              <Pic c={c} cls="h-40 w-full" txt="text-6xl" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs">
                    {c.cat === 'Milliy' ? '🇺🇿 Milliy' : c.cat === 'Trend' ? '🔥 Trend' : 'Tort'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-500">{sizeText(c)}</p>
                <p className="mt-2 font-bold text-rose-700">dan {fmt(variants(c)[0].price)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {sel && <OrderModal cake={sel} me={me} say={say} occ0={occ} close={() => setSel(null)} />}
    </div>
  )
}
