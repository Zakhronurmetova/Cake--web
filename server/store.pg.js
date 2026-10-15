// Postgres (Neon / Supabase / Vercel Postgres) — doimiy saqlash. DATABASE_URL kerak.
import pg from 'pg'

const pool = globalThis.__pgPool || (globalThis.__pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
}))
const q = (sql, p) => pool.query(sql, p)
const one = async (sql, p) => (await q(sql, p)).rows[0]?.data ?? null
const KV = {
  get: (coll, id) => one('select data from kv where coll=$1 and id=$2', [coll, id]),
  put: (coll, id, data) => q('insert into kv(coll,id,data) values($1,$2,$3) on conflict(coll,id) do update set data=$3', [coll, id, JSON.stringify(data)]),
}
let ready

export default {
  init() {
    ready ||= (async () => {
      await q('create table if not exists kv(coll text not null, id text not null, data jsonb not null, primary key(coll,id))')
      await q('create table if not exists days(d text primary key, n int not null default 0)')
      await q("create index if not exists kv_orders_customer on kv((data->>'customerId')) where coll='orders'")
    })()
    return ready
  },
  getUser: (id) => KV.get('users', id),
  async createUser(u) {
    const r = await q('insert into kv(coll,id,data) values($1,$2,$3) on conflict do nothing', ['users', u.id, JSON.stringify(u)])
    return r.rowCount === 1
  },
  getSession: (t) => KV.get('sessions', t),
  putSession: (t, s) => KV.put('sessions', t, s),
  delSession: (t) => q("delete from kv where coll='sessions' and id=$1", [t]),
  async listCakes() { return (await q("select data from kv where coll='cakes'")).rows.map((r) => r.data) },
  getCake: (id) => KV.get('cakes', id),
  putCake: (c) => KV.put('cakes', c.id, c),
  async countCakes() { return +(await q("select count(*) from kv where coll='cakes'")).rows[0].count },
  async listOrders(customerId) {
    const r = customerId
      ? await q("select data from kv where coll='orders' and data->>'customerId'=$1", [customerId])
      : await q("select data from kv where coll='orders'")
    return r.rows.map((x) => x.data)
  },
  getOrder: (id) => KV.get('orders', id),
  async insertOrder(o) {
    const r = await q('insert into kv(coll,id,data) values($1,$2,$3) on conflict do nothing', ['orders', o.id, JSON.stringify(o)])
    return r.rowCount === 1
  },
  // Atomik o'zgartirish: qator tranzaksiyada qulflanadi (FOR UPDATE)
  async mutateOrder(id, fn) {
    const c = await pool.connect()
    try {
      await c.query('begin')
      const cur = (await c.query("select data from kv where coll='orders' and id=$1 for update", [id])).rows[0]?.data
      if (!cur) { await c.query('rollback'); return null }
      const r = fn(cur)
      await c.query("update kv set data=$2 where coll='orders' and id=$1", [id, JSON.stringify(r.order)])
      await c.query('commit')
      return r
    } catch (e) {
      await c.query('rollback').catch(() => {})
      throw e
    } finally { c.release() }
  },
  async getSettings() { return (await KV.get('settings', 'main')) || { limit: 4 } },
  putSettings: (s) => KV.put('settings', 'main', s),
  putImage: (id, img) => KV.put('images', id, img),
  getImage: (id) => KV.get('images', id),
  // Bir qadamda atomik: limitdan oshmasa joyni band qiladi
  async reserve(date, limit) {
    const r = await q('insert into days(d,n) values($1,1) on conflict(d) do update set n=days.n+1 where days.n<$2 returning n', [date, limit])
    return r.rowCount === 1
  },
  release: (date) => q('update days set n=greatest(n-1,0) where d=$1', [date]),
}
