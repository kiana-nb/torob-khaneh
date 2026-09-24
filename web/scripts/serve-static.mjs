// Minimal static server for the exported site (./out). Usage: node scripts/serve-static.mjs [port]
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../out/', import.meta.url))
const PORT = Number(process.argv[2] || 4311)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff' }

createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])
  let file = normalize(join(ROOT, url))
  if (!file.startsWith(normalize(ROOT))) { res.writeHead(403).end(); return }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) {
    if (existsSync(file + '.html')) file += '.html'
    else { res.writeHead(404, { 'Content-Type': TYPES['.html'] }); createReadStream(join(ROOT, '404.html')).pipe(res); return }
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' })
  createReadStream(file).pipe(res)
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`))
