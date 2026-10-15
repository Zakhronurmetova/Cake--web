// Mahalliy rivojlanish uchun fayl asosidagi saqlash (DATABASE_URL bo'lmaganda).
// Vercel'da ISHLATILMAYDI — u yerda store.pg.js (Postgres) ishlaydi.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE = process.env.DATA_FILE || path.join(path.dirname(fileURLToPath(import.meta.url)), 'data.json')
let d = fs.existsSync(FILE)
  ? JSON.parse(fs.readFileSync(FILE, 'utf8'))
  : { users: {}, sessions: {}, cakes: {}, orders: {}, images: {}, days: {}, settings: { limit: 4 } }
const save = () => { fs.writeFileSync(FILE + '.tmp', JSON.stringify(d)); fs.renameSync(FILE + '.tmp', FILE) }
const copy = (x) => (x === undefined ? null : JSON.parse(JSON.stringify(x)))

export default {
  async init() {},
  async getUser(id) { return copy(d.users[id]) },
  async createUser(u) { if (d.users[u.id]) return false; d.users[u.id] = u; save(); return true },
  async getSession(t) { return copy(d.sessions[t]) },
  async putSession(t, s) { d.sessions[t] = s; save() },
  async delSession(t) { delete d.sessions[t]; save() },
  async listCakes() { return Object.values(d.cakes).map(copy) },
  async getCake(id) { return copy(d.cakes[id]) },
  async putCake(c) { d.cakes[c.id] = c; save() },
  async countCakes() { return Object.keys(d.cakes).length },
  async listOrders(customerId) {
    return Object.values(d.orders).filter((o) => !customerId || o.customerId === customerId).map(copy)
  },
  async getOrder(id) { return copy(d.orders[id]) },
  async insertOrder(o) { if (d.orders[o.id]) return false; d.orders[o.id] = o; save(); return true },
  // Atomik o'qish-o'zgartirish-yozish: fn(order) -> { order, release }
  async mutateOrder(id, fn) {
    const o = d.orders[id]
    if (!o) return null
    const r = fn(copy(o))
    d.orders[id] = r.order
    save()
    return r
  },
  async getSettings() { return d.settings },
  async putSettings(s) { d.settings = s; save() },
  async putImage(id, img) { d.images[id] = img; save() },
  async getImage(id) { return copy(d.images[id]) },
  async reserve(date, limit) { const n = d.days[date] || 0; if (n >= limit) return false; d.days[date] = n + 1; save(); return true },
  async release(date) { d.days[date] = Math.max(0, (d.days[date] || 0) - 1); save() },
}
