import { useRef, useState } from 'react'
import { api } from '../api.js'
import { DECO, OCC, OEMO, addDays, fmt, variants } from '../constants.js'
import { Button, Field, Pic, selectCls } from './ui.jsx'

// 1-qadam: hajm variantlari (Uzum Market kabi). 2-qadam: buyurtma formasi.
export default function OrderModal({ cake, me, close, say, occ0 }) {
  const flavors = cake.flavors.split(',').map((s) => s.trim()).filter(Boolean)
  const cakeOcc = (cake.occ || '').split(',').filter(Boolean)
  const [step, setStep] = useState('variants')
  const [o, setO] = useState({
    flavor: flavors[0] || '', kg: 1, deco: 0, text: '', name: me.name, phone: '+998',
    date: addDays(cake.minDays), time: '12:00', occasion: occ0 || cakeOcc[0] || OCC[2],
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  // Bir xil buyurtma ikki marta yaratilmasligi uchun bitta kalit
  const orderId = useRef('o' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).current
  const set = (k) => (e) => setO({ ...o, [k]: k === 'deco' ? Number(e.target.value) : e.target.value })
  const total = Math.round(o.kg * cake.perKg + (o.deco ? cake.deco : 0))
  const cv = variants(cake).find((v) => v.kg === o.kg)

  async function send() {
    if (busy) return
    setErr('')
    if (o.name.trim().length < 2) return setErr('Ismni kiriting')
    if (!/^\+998\d{9}$/.test(o.phone.replace(/\s/g, ''))) return setErr("Telefon: +998901234567 ko'rinishida")
    if (o.date < addDays(cake.minDays)) return setErr(`Eng erta sana: ${addDays(cake.minDays)} (tayyorlash ${cake.minDays} kun)`)
    if (!o.time) return setErr('Olish vaqtini kiriting')
    setBusy(true)
    try {
      await api.post('/api/orders', { ...o, id: orderId, cakeId: cake.id })
      say('Buyurtma yuborildi! ✅')
      close()
    } catch (x) {
      setErr(x.message)
    }
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold">{cake.name}</h2>
          <button onClick={close} className="text-2xl leading-none" aria-label="Yopish">×</button>
        </div>

        {step === 'variants' ? (
          <div>
            <Pic c={cake} cls="mt-3 h-44 w-full rounded-xl" txt="text-7xl" />
            <p className="mt-3 text-sm text-stone-600">{cake.desc}</p>
            <p className="mt-1 text-xs text-stone-500">Bayramlar: {cakeOcc.join(', ')} · Tayyorlash: {cake.minDays} kun</p>
            <h3 className="mt-4 font-semibold">Hajmini tanlang</h3>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {variants(cake).map((v) => (
                <button key={v.kg} onClick={() => { setO({ ...o, kg: v.kg }); setStep('form') }}
                  className="rounded-xl border-2 border-stone-200 p-3 text-left hover:border-rose-500 hover:bg-rose-50">
                  <div className="text-lg font-bold">{v.kg} kg</div>
                  <div className="text-sm text-stone-600">≈ {v.pcs} dona{cake.cat === 'Tort' ? ` · Ø${v.dia} sm` : ''}</div>
                  <div className="mt-1 font-bold text-rose-700">{fmt(v.price)}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-rose-50 p-3">
              <Pic c={cake} cls="h-14 w-14 rounded-lg" txt="text-3xl" />
              <div className="flex-1 text-sm">
                <div className="font-semibold">{o.kg} kg · ≈ {cv.pcs} dona{cake.cat === 'Tort' ? ` · Ø${cv.dia} sm` : ''}</div>
                <div className="text-rose-700">{fmt(Math.round(o.kg * cake.perKg))}</div>
              </div>
              <button className="text-sm text-rose-700 underline" onClick={() => setStep('variants')}>← Hajm</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm">Ta'm
                <select className={selectCls} value={o.flavor} onChange={set('flavor')}>{flavors.map((x) => <option key={x}>{x}</option>)}</select>
              </label>
              <label className="block text-sm">Bayram / tadbir
                <select className={selectCls} value={o.occasion} onChange={set('occasion')}>{OCC.map((x) => <option key={x} value={x}>{OEMO[x]} {x}</option>)}</select>
              </label>
              {cake.deco > 0 && (
                <label className="col-span-2 block text-sm">Bezak
                  <select className={selectCls} value={o.deco} onChange={set('deco')}>
                    {DECO.map((x, i) => <option key={x} value={i}>{x}{i ? ` (+${fmt(cake.deco)})` : ''}</option>)}
                  </select>
                </label>
              )}
            </div>
            <div className="mt-3">
              <Field label="Yozuv (ixtiyoriy)" value={o.text} maxLength={60} onChange={set('text')} placeholder="Masalan: Navro'z muborak!" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Ism" value={o.name} onChange={set('name')} />
              <Field label="Telefon" value={o.phone} onChange={set('phone')} />
              <Field label="Olish sanasi" type="date" min={addDays(cake.minDays)} value={o.date} onChange={set('date')} />
              <Field label="Olish vaqti" type="time" value={o.time} onChange={set('time')} />
            </div>
            <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm">
              <div>{o.kg} kg × {fmt(cake.perKg)}{o.deco ? ` + bezak ${fmt(cake.deco)}` : ''}</div>
              <div className="text-xl font-bold text-rose-700">Jami: {fmt(total)}</div>
            </div>
            {err && <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">{err}</p>}
            <Button onClick={send} disabled={busy} className="mt-4 w-full bg-rose-600 text-white">
              {busy ? 'Yuborilmoqda…' : 'Buyurtma berish'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
