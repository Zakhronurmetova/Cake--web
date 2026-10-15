// Mahalliy ishga tushirish: API + (build qilingan bo'lsa) frontend. Vercel'da bu fayl ishlatilmaydi.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
// .env faylini o'qish (bo'lsa)
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split('\n')) {
    const m = /^\s*([A-Z_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch { /* .env yo'q */ }

const { default: handle } = await import('./app.js')
const DIST = path.join(root, 'dist')
const PORT = process.env.PORT || 3001
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' }

export const server = http.createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname
  if (p.startsWith('/api/')) return handle(req, res)
  let f = path.join(DIST, path.normalize(p))
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html')
  if (!fs.existsSync(f)) { res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Backend ishlayapti. Frontend uchun "npm run dev" yoki "npm start" ishlating.') }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' })
  fs.createReadStream(f).pipe(res)
})

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`Backend: http://localhost:${PORT}  (${process.env.DATABASE_URL ? 'Postgres' : 'mahalliy fayl'})`)
    if (!process.env.DATABASE_URL) console.log('Qandolatchi kodi (mahalliy): ' + (process.env.BAKER_CODE || 'qandolat2026'))
  })
}
