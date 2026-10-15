import { useState } from 'react'
import { api } from '../api.js'
import usePoll from '../usePoll.js'
import { Button } from './ui.jsx'
import Catalog from './Catalog.jsx'
import Orders from './Orders.jsx'
import Manage from './Manage.jsx'

// Kirgandan keyingi asosiy sahifa: rolga qarab turli bo'limlar
export default function Main({ me, logout, say }) {
  const baker = me.role === 'baker'
  const [tab, setTab] = useState(baker ? 'orders' : 'catalog')
  const [tick, setTick] = useState(0) // amaldan keyin ma'lumotni darhol yangilash uchun
  const reload = () => setTick((t) => t + 1)
  const [cakes, e1] = usePoll(() => api.get('/api/cakes'), [me.id, tick])
  const [orders, e2] = usePoll(() => api.get('/api/orders'), [me.id, tick])
  const error = e1 || e2
  const tabs = baker ? [['orders', 'Buyurtmalar'], ['manage', 'Mahsulotlar']] : [['catalog', 'Katalog'], ['orders', 'Buyurtmalarim']]

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white/90 shadow backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <span className="text-xl font-bold text-rose-700">🎂 Shirin Dunyo</span>
          <nav className="flex gap-1">
            {tabs.map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={'rounded-lg px-3 py-1.5 text-sm font-semibold ' + (tab === k ? 'bg-rose-600 text-white' : 'bg-stone-100')}>{l}</button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-stone-600">{me.name} · {baker ? 'Qandolatchi' : 'Mijoz'}</span>
            <Button className="bg-stone-200 text-stone-700" onClick={logout}>Chiqish</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        {error && !cakes ? (
          <p className="rounded-xl bg-red-50 p-6 text-center text-red-700">Ma'lumotlarni yuklab bo'lmadi: {error}</p>
        ) : !cakes || !orders ? (
          <p className="p-10 text-center text-stone-500">Yuklanmoqda…</p>
        ) : tab === 'catalog' ? (
          <Catalog cakes={cakes} me={me} say={say} />
        ) : tab === 'orders' ? (
          <Orders orders={orders} say={say} baker={baker} reload={reload} />
        ) : (
          <Manage cakes={cakes} say={say} reload={reload} />
        )}
      </main>
    </div>
  )
}
