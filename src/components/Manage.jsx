import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { CATS, FL, OCC, OEMO, fmt } from '../constants.js'
import { Button, Field, Pic, selectCls } from './ui.jsx'

const EMPTY = { name: '', emoji: '🎂', cat: 'Tort', occ: OCC[2], perKg: 100000, deco: 20000, minDays: 1, pcs: 8, flavors: FL.Tort, desc: '', img: '' }

// Har qanday rasmni JPEG ga aylantirib, 1200px gacha kichraytiradi
async function toDataUrl(file) {
  let bmp
  try { bmp = await createImageBitmap(file) } catch { throw new Error('Bu rasm formatini brauzer ochmadi (masalan HEIC). JPG yoki PNG qiling.') }
  const k = Math.min(1, 1200 / Math.max(bmp.width, bmp.height))
  const cv = document.createElement('canvas')
  cv.width = Math.round(bmp.width * k)
  cv.height = Math.round(bmp.height * k)
  const ctx = cv.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, cv.width, cv.height)
  ctx.drawImage(bmp, 0, 0, cv.width, cv.height)
  return cv.toDataURL('image/jpeg', 0.85)
}

export default function Manage({ cakes, say, reload }) {
  const [f, setF] = useState(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [limit, setLimit] = useState('')
  useEffect(() => { api.get('/api/settings').then((s) => setLimit(s.limit)).catch(() => {}) }, [])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const toggleOcc = (x) => {
    const a = (f.occ || '').split(',').filter(Boolean)
    setF({ ...f, occ: (a.includes(x) ? a.filter((y) => y !== x) : [...a, x]).join(',') })
  }

  async function pick(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const r = await api.post('/api/upload', { dataUrl: await toDataUrl(file) })
      setF((x) => ({ ...x, img: r.url }))
      say('Rasm yuklandi ✅')
    } catch (x) { say(x.message, true) }
    setUploading(false)
  }
  async function save() {
    if (busy) return
    setBusy(true)
    try {
      await (f.id ? api.put('/api/cakes/' + f.id, f) : api.post('/api/cakes', f))
      say('Saqlandi ✅')
      setF(null)
      reload()
    } catch (x) { say(x.message, true) }
    setBusy(false)
  }
  const toggle = (c) => api.post(`/api/cakes/${c.id}/toggle`, {}).then(reload).catch((x) => say(x.message, true))
  const saveLimit = () => api.put('/api/settings', { limit }).then(() => say('Limit saqlandi')).catch((x) => say(x.message, true))
  const inp = (label, k, p = {}) => <Field label={label} value={f[k]} onChange={set(k)} {...p} />

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-white p-3">
        <div className="w-40"><Field label="Kunlik buyurtma limiti" type="number" min={1} value={limit} onChange={(e) => setLimit(e.target.value)} /></div>
        <Button onClick={saveLimit}>Saqlash</Button>
        <Button className="ml-auto bg-emerald-600 text-white" onClick={() => setF({ ...EMPTY })}>+ Yangi mahsulot</Button>
      </div>

      {f && (
        <div className="mb-4 rounded-2xl bg-white p-4 shadow">
          <h3 className="mb-2 font-semibold">{f.id ? 'Tahrirlash' : 'Yangi mahsulot'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {inp('Nomi', 'name')}
            {inp("Emoji (rasm bo'lmasa)", 'emoji')}
            <label className="block text-sm">Tur
              <select className={selectCls} value={f.cat} onChange={set('cat')}>{CATS.map((x) => <option key={x}>{x}</option>)}</select>
            </label>
            {inp('1 kg dagi dona soni', 'pcs', { type: 'number', min: 1 })}
            {inp("1 kg narxi (so'm)", 'perKg', { type: 'number' })}
            {inp("Bezak narxi (so'm, 0 = bezaksiz)", 'deco', { type: 'number' })}
            {inp('Eng erta olish (necha kun)', 'minDays', { type: 'number', min: 0 })}
            {inp("Ta'mlar (vergul bilan)", 'flavors')}
            <div className="sm:col-span-2">
              <div className="mb-1 text-sm text-stone-600">Bayramlar</div>
              <div className="flex flex-wrap gap-2">
                {OCC.map((x) => (
                  <label key={x} className="flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-sm">
                    <input type="checkbox" checked={(f.occ || '').split(',').includes(x)} onChange={() => toggleOcc(x)} />
                    {OEMO[x]} {x}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">{inp('Tarkib / tavsif', 'desc')}</div>
            <div className="flex items-center gap-3 sm:col-span-2">
              {f.img && <img src={f.img} alt="" className="h-16 w-16 rounded-lg object-cover" />}
              <label className="block text-sm">
                <span className="text-stone-600">Rasm yuklash</span>
                <input type="file" accept="image/*,.avif,.heic,.jfif,.bmp,.tif" onChange={pick} disabled={uploading} className="mt-1 block text-sm" />
              </label>
              {uploading && <span className="text-sm">Yuklanmoqda…</span>}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={save} disabled={busy || uploading}>{busy ? 'Saqlanmoqda…' : 'Saqlash'}</Button>
            <Button className="bg-stone-200 text-stone-700" onClick={() => setF(null)}>Bekor</Button>
          </div>
        </div>
      )}

      {!cakes.length ? (
        <p className="rounded-xl bg-white p-8 text-center text-stone-500">Mahsulotlar yo'q</p>
      ) : (
        <div className="space-y-2">
          {cakes.map((c) => (
            <div key={c.id} className={'flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 shadow' + (c.hidden ? ' opacity-60' : '')}>
              <Pic c={c} cls="h-12 w-12 rounded-lg" txt="text-2xl" />
              <div className="flex-1">
                <div className="font-semibold">{c.name}{c.hidden ? ' (yashirin)' : ''}</div>
                <div className="text-xs text-stone-500">{c.cat} · {fmt(c.perKg)}/kg · bezak {fmt(c.deco)} · {c.minDays} kun</div>
              </div>
              <Button className="bg-stone-200 text-stone-700" onClick={() => setF({ ...c })}>Tahrirlash</Button>
              <Button className="bg-amber-100 text-amber-800" onClick={() => toggle(c)}>{c.hidden ? "Ko'rsatish" : 'Yashirish'}</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
