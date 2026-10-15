// Backend bilan ishlash. Token faqat sessiya uchun localStorage'da saqlanadi.
const KEY = 'tort_token'
export const getToken = () => { try { return localStorage.getItem(KEY) } catch { return null } }
export const setToken = (t) => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY) } catch { /* ignore */ } }

async function req(method, url, body) {
  const t = getToken()
  let r
  try {
    r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) },
      body: method === 'GET' ? undefined : JSON.stringify(body || {}),
    })
  } catch {
    throw new Error('Tarmoq xatosi. Internetni tekshirib, qayta urinib ko\'ring.')
  }
  const j = await r.json().catch(() => ({}))
  if (!r.ok) {
    const e = new Error(j.error || 'Xatolik yuz berdi')
    e.status = r.status
    throw e
  }
  return j
}
export const api = {
  get: (u) => req('GET', u),
  post: (u, b) => req('POST', u, b),
  put: (u, b) => req('PUT', u, b),
}
