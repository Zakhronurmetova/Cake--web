import { useEffect, useState } from 'react'
import { api, getToken, setToken } from './api.js'
import Auth from './components/Auth.jsx'
import Main from './components/Main.jsx'

export default function App() {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(!!getToken())
  const [toast, setToast] = useState(null)

  // Sahifa yangilanganda sessiyani tiklash
  useEffect(() => {
    if (!getToken()) return
    api.get('/api/me').then((r) => setMe(r.user)).catch(() => setToken(null)).finally(() => setLoading(false))
  }, [])

  const say = (m, bad) => {
    setToast({ m, bad })
    setTimeout(() => setToast(null), 3500)
  }
  const logout = () => { api.post('/api/logout', {}).catch(() => {}); setToken(null); setMe(null) }

  if (loading) return <p className="p-16 text-center text-stone-500">Yuklanmoqda…</p>
  return (
    <>
      {me ? <Main me={me} logout={logout} say={say} key={me.id} /> : <Auth onLogin={setMe} />}
      {toast && (
        <div className={'fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-lg ' + (toast.bad ? 'bg-red-600' : 'bg-stone-800')}>
          {toast.m}
        </div>
      )}
    </>
  )
}
