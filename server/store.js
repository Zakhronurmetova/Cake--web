// DATABASE_URL bor bo'lsa Postgres, bo'lmasa mahalliy fayl
const store = process.env.DATABASE_URL ? (await import('./store.pg.js')).default : (await import('./store.memory.js')).default
export default store
