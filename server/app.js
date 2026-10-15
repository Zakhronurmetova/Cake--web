// Shirin Dunyo — API (Vercel funksiyasi ham, mahalliy server ham shu faylni ishlatadi).
// Barcha tekshiruvlar SERVERDA bajariladi: narx, ruxsat, holatlar, kunlik limit.
import crypto from 'node:crypto'
import store from './store.js'
import { SEED, FL, OCC } from './seed.js'

const DECO = ['Bezaksiz', 'Mevali bezak', 'Gulli krem', 'Shokoladli bezak']
const KG = [0.5, 1, 1.5, 2, 3, 5]
const FLOW = ['Yangi', 'Qabul qilindi', 'Tayyorlanmoqda', 'Tayyor', 'Topshirildi']
const CATS = ['Tort', 'Milliy', 'Trend']
const SESSION_MS = 30 * 24 * 3600 * 1000
// Qandolatchi sifatida ro'yxatdan o'tish uchun maxfiy kod (Vercel'da BAKER_CODE o'zgaruvchisi)
const BAKER_CODE = process.env.BAKER_CODE || (process.env.DATABASE_URL ? '' : 'qandolat2026')

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}
const bad = (m, s = 400) => { throw new HttpError(s, m) }
const str = (v, min, max, label) => {
  const s = typeof v === 'string' ? v.trim() : ''
  if (s.length < min || s.length > max) bad(`${label} noto'g'ri (${min}–${max} belgi)`)
  return s
}
// Sanalar Toshkent vaqti (UTC+5) bo'yicha hisoblanadi
const addDays = (n) => new Date(Date.now() + 5 * 3600e3 + n * 86400e3).toISOString().slice(0, 10)

// ---------- Parol ----------
const hashPw = (pw, salt = crypto.randomBytes(16).toString('hex')) => ({ salt, hash: crypto.scryptSync(pw, salt, 32).toString('hex') })
const checkPw = (pw, u) => crypto.timingSafeEqual(Buffer.from(hashPw(pw, u.salt).hash, 'hex'), Buffer.from(u.hash, 'hex'))
const fails = new Map() // oddiy brute-force himoyasi (har bir instansiyada)
const tooMany = (k) => (fails.get(k) || []).filter((t) => Date.now() - t < 15 * 60e3).length >= 8
const noteFail = (k) => fails.set(k, [...(fails.get(k) || []).filter((t) => Date.now() - t < 15 * 60e3), Date.now()])

// ---------- Boshlang'ich ma'lumot ----------
let seeded
async function ensureReady() {
  seeded ||= (async () => {
    await store.init()
    if (!(await store.countCakes())) {
      for (const r of SEED) {
        await store.putCake({ id: r[0], emoji: r[1], name: r[2], cat: r[3], occ: r[4], perKg: r[5], deco: r[6], minDays: r[7], pcs: r[8], desc: r[9], flavors: FL[r[3]], hidden: false, img: '' })
      }
    }
  })().catch((e) => { seeded = null; throw e })
  return seeded
}

function cakeFields(b) {
  const cat = CATS.includes(b.cat) ? b.cat : bad("Tur noto'g'ri")
  const occ = String(b.occ || '').split(',').filter((x) => OCC.includes(x))
  if (!occ.length) bad('Kamida bitta bayramni tanlang')
  const num = (v, min, label) => (Number.isFinite(+v) && +v >= min ? Math.round(+v) : bad(`${label} noto'g'ri`))
  return {
    emoji: str(b.emoji || '🎂', 1, 8, 'Emoji'),
    name: str(b.name, 2, 60, 'Nom'),
    cat, occ: occ.join(','),
    perKg: num(b.perKg, 1, '1 kg narxi'),
    deco: num(b.deco, 0, 'Bezak narxi'),
    minDays: num(b.minDays, 0, 'Tayyorlash muddati'),
    pcs: num(b.pcs, 1, 'Dona soni'),
    flavors: str(b.flavors, 2, 200, "Ta'mlar"),
    desc: str(b.desc, 3, 300, 'Tavsif'),
    img: typeof b.img === 'string' && /^\/api\/img\/[a-f0-9]{16}$/.test(b.img) ? b.img : '',
  }
}

const routes = []
const route = (method, pattern, handler, open = false) =>
  routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler, open })
const pub = (u) => ({ id: u.id, name: u.name, role: u.role })
const baker = (u) => { if (u.role !== 'baker') bad('Bu amal faqat qandolatchi uchun', 403) }

async function startSession(u) {
  const token = crypto.randomBytes(32).toString('hex')
  await store.putSession(token, { userId: u.id, t: Date.now() })
  return { token, user: pub(u) }
}

route('POST', '/api/register', async ({ body }) => {
  const id = String(body.login || '').trim().toLowerCase()
  if (!/^[a-z0-9_]{3,20}$/.test(id)) bad('Login: 3–20 ta lotin harf, raqam yoki _')
  const name = str(body.name, 2, 40, 'Ism')
  if (typeof body.password !== 'string' || body.password.length < 6) bad("Parol kamida 6 belgi bo'lsin")
  if (!['buyer', 'baker'].includes(body.role)) bad("Rol noto'g'ri")
  if (body.role === 'baker') {
    if (!BAKER_CODE) bad("Qandolatchi sifatida ro'yxatdan o'tish o'chirilgan", 403)
    if (body.code !== BAKER_CODE) bad("Qandolatchi kodi noto'g'ri", 403)
  }
  const u = { id, name, role: body.role, ...hashPw(body.password) }
  if (!(await store.createUser(u))) bad('Bu login band', 409)
  return startSession(u)
}, true)

route('POST', '/api/login', async ({ body }) => {
  const id = String(body.login || '').trim().toLowerCase()
  if (tooMany(id)) bad("Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring.", 429)
  const u = await store.getUser(id)
  if (!u || typeof body.password !== 'string' || !checkPw(body.password, u)) { noteFail(id); bad("Login yoki parol noto'g'ri", 401) }
  return startSession(u)
}, true)

route('POST', '/api/logout', async ({ token }) => { await store.delSession(token); return { ok: true } })
route('GET', '/api/me', ({ user }) => ({ user: pub(user) }))

// --- Katalog (bitta do'kon: barcha qandolatchilar umumiy katalogni boshqaradi) ---
route('GET', '/api/cakes', async ({ user }) => {
  const all = await store.listCakes()
  return user.role === 'baker' ? all : all.filter((c) => !c.hidden)
})
route('POST', '/api/cakes', async ({ user, body }) => {
  baker(user)
  const c = { id: 'c' + crypto.randomBytes(5).toString('hex'), hidden: false, ...cakeFields(body) }
  await store.putCake(c)
  return c
})
route('PUT', '/api/cakes/:id', async ({ user, body, params }) => {
  baker(user)
  const old = (await store.getCake(params.id)) || bad('Topilmadi', 404)
  const c = { ...old, ...cakeFields(body) }
  await store.putCake(c)
  return c
})
route('POST', '/api/cakes/:id/toggle', async ({ user, params }) => {
  baker(user)
  const c = (await store.getCake(params.id)) || bad('Topilmadi', 404)
  c.hidden = !c.hidden
  await store.putCake(c)
  return c
})

// --- Rasmlar bazada saqlanadi (Vercel'da fayl tizimi yo'q) ---
route('POST', '/api/upload', async ({ user, body }) => {
  baker(user)
  const m = /^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/.exec(body.dataUrl || '')
  if (!m) bad('Faqat PNG, JPEG, WEBP yoki GIF rasm')
  if (m[2].length > 3.5 * 1024 * 1024) bad("Rasm 2.5 MB dan katta bo'lmasin")
  const id = crypto.randomBytes(8).toString('hex')
  await store.putImage(id, { mime: 'image/' + m[1], b64: m[2] })
  return { url: '/api/img/' + id }
})
route('GET', '/api/img/:id', async ({ params }) => {
  const img = /^[a-f0-9]{16}$/.test(params.id) && (await store.getImage(params.id))
  if (!img) bad('Topilmadi', 404)
  return { __raw: { mime: img.mime, buf: Buffer.from(img.b64, 'base64') } }
}, true)

route('GET', '/api/settings', async () => store.getSettings())
route('PUT', '/api/settings', async ({ user, body }) => {
  baker(user)
  const n = Math.floor(+body.limit)
  if (!(n >= 1 && n <= 50)) bad("Limit 1–50 oralig'ida bo'lsin")
  const s = { limit: n }
  await store.putSettings(s)
  return s
})

// --- Buyurtmalar ---
route('GET', '/api/orders', async ({ user }) => {
  const list = await store.listOrders(user.role === 'baker' ? null : user.id)
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

route('POST', '/api/orders', async ({ user, body: b }) => {
  if (user.role !== 'buyer') bad('Buyurtmani faqat mijoz beradi', 403)
  const id = String(b.id || '')
  if (!/^[a-z0-9]{6,40}$/.test(id)) bad("Buyurtma identifikatori noto'g'ri")
  const old = await store.getOrder(id)
  if (old) return old.customerId === user.id ? old : bad('Bu ID band', 409) // takroriy yuborish

  const c = await store.getCake(b.cakeId)
  if (!c || c.hidden) bad("Bu shirinlik hozir sotuvda yo'q", 404)
  const flavor = c.flavors.split(',').map((s) => s.trim()).includes(b.flavor) ? b.flavor : bad("Ta'm noto'g'ri")
  const kg = KG.includes(+b.kg) ? +b.kg : bad("Vazn noto'g'ri")
  const deco = Number.isInteger(b.deco) && b.deco >= 0 && b.deco < DECO.length ? b.deco : bad("Bezak noto'g'ri")
  if (deco > 0 && c.deco <= 0) bad("Bu mahsulotga bezak qo'shib bo'lmaydi")
  const occasion = OCC.includes(b.occasion) ? b.occasion : bad("Bayram noto'g'ri")
  const name = str(b.name, 2, 40, 'Ism')
  const phone = String(b.phone || '').replace(/\s/g, '')
  if (!/^\+998\d{9}$/.test(phone)) bad("Telefon +998901234567 ko'rinishida bo'lsin")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '')) bad("Sana noto'g'ri")
  if (b.date < addDays(c.minDays)) bad(`Eng erta sana: ${addDays(c.minDays)} (tayyorlash ${c.minDays} kun)`)
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(b.time || '')) bad("Vaqt noto'g'ri")

  const total = Math.round(kg * c.perKg + (deco ? c.deco : 0)) // narx serverda hisoblanadi
  const { limit } = await store.getSettings()
  if (!(await store.reserve(b.date, limit))) bad(`${b.date} sanasi band (kunlik limit ${limit}). Boshqa sana tanlang.`, 409)

  const now = new Date().toISOString()
  const o = {
    id, customerId: user.id, customerName: name, phone, cakeId: c.id, cakeName: c.name, emoji: c.emoji, img: c.img,
    flavor, kg, pcs: Math.max(1, Math.round(kg * (c.pcs || 8))), occasion, deco: DECO[deco], decoPrice: deco ? c.deco : 0,
    perKg: c.perKg, text: String(b.text || '').trim().slice(0, 60), date: b.date, time: b.time, total,
    status: 'Yangi', reason: '', createdAt: now, history: [{ s: 'Yangi', t: now, by: user.id }],
  }
  try {
    if (!(await store.insertOrder(o))) { await store.release(b.date); return (await store.getOrder(id)) || bad('Xatolik', 409) }
  } catch (e) { await store.release(b.date); throw e }
  return o
})

route('POST', '/api/orders/:id/status', async ({ user, body, params }) => {
  const to = body.to
  const r = await store.mutateOrder(params.id, (o) => {
    const isBaker = user.role === 'baker'
    if (!isBaker && o.customerId !== user.id) bad("Bu buyurtmaga ruxsat yo'q", 403)
    let reason = ''
    if (to === 'Bekor qilindi') {
      if (isBaker) bad('Bekor qilishni faqat mijoz qiladi', 403)
      if (o.status !== 'Yangi') bad('Faqat "Yangi" buyurtmani bekor qilish mumkin', 409)
    } else if (to === 'Rad etildi') {
      if (!isBaker) bad('Rad etishni faqat qandolatchi qiladi', 403)
      if (o.status !== 'Yangi') bad('Faqat "Yangi" buyurtmani rad etish mumkin', 409)
      reason = str(body.reason, 2, 200, 'Sabab')
    } else {
      if (!isBaker) bad("Holatni faqat qandolatchi o'zgartiradi", 403)
      if (FLOW[FLOW.indexOf(o.status) + 1] !== to) bad("Holatni tashlab o'tib bo'lmaydi", 409)
    }
    o.status = to
    if (reason) o.reason = reason
    o.history.push({ s: to, t: new Date().toISOString(), by: user.id })
    return { order: o, release: to === 'Bekor qilindi' || to === 'Rad etildi' }
  })
  if (!r) bad('Buyurtma topilmadi', 404)
  if (r.release) await store.release(r.order.date) // band joy bo'shaydi
  return r.order
})

// ---------- So'rovni qayta ishlash ----------
async function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return {}
  if (req.body !== undefined) { // Vercel body'ni oldindan o'qib bo'ladi
    return typeof req.body === 'string' ? (req.body ? JSON.parse(req.body) : {}) : req.body || {}
  }
  const chunks = []
  let size = 0
  for await (const c of req) {
    size += c.length
    if (size > 6 * 1024 * 1024) bad("So'rov juda katta", 413)
    chunks.push(c)
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
}

export default async function handle(req, res) {
  const send = (status, data, headers = {}) => { res.writeHead(status, { 'Content-Type': 'application/json', ...headers }); res.end(JSON.stringify(data)) }
  try {
    await ensureReady()
    const path = new URL(req.url, 'http://x').pathname
    const r = routes.find((x) => x.method === req.method && x.re.test(path))
    if (!r) return send(404, { error: 'Topilmadi' })
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    let user = null
    if (token) {
      const s = await store.getSession(token)
      if (s && Date.now() - s.t < SESSION_MS) user = await store.getUser(s.userId)
    }
    if (!r.open && !user) return send(401, { error: 'Avval tizimga kiring' })
    let body
    try { body = await readBody(req) } catch (e) { if (e instanceof HttpError) throw e; bad("JSON noto'g'ri") }
    const out = await r.handler({ user, token, body, params: r.re.exec(path).groups || {} })
    if (out && out.__raw) {
      res.writeHead(200, { 'Content-Type': out.__raw.mime, 'Cache-Control': 'public, max-age=31536000, immutable' })
      return res.end(out.__raw.buf)
    }
    send(200, out)
  } catch (e) {
    if (e instanceof HttpError) return send(e.status, { error: e.message })
    console.error(e)
    send(500, { error: 'Server xatosi. Birozdan keyin qayta urinib ko\'ring.' })
  }
}
