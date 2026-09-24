// Step 1 — crawl a small, polite sample of public Divar listings (robots.txt-allowed API paths).
// - One request every ~2s, transparent User-Agent, resumable cache in .cache/posts/<token>.json
// - Stores listing data only: no phone numbers, no advertiser names (contact block is never requested).
// Usage: node crawl.mjs
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'

const CACHE = new URL('./.cache/', import.meta.url)
const POSTS = new URL('./posts/', CACHE)
mkdirSync(POSTS, { recursive: true })

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36 torob-khaneh-demo (non-commercial)'
const DELAY = 2000
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Divar district ids (from api.divar.ir/v8/places/cities/1/districts)
const RENT = [75, 82, 61, 67, 90, 91, 315, 399, 108, 205, 146, 151, 167, 88, 86, 292, 252, 172, 139, 72]
const BUY = [75, 82, 90, 399, 205, 146, 167, 88, 72, 252]
const CATEGORY = { rent: 'apartment-rent', buy: 'apartment-sell' }

async function search(category, districtId) {
  const body = {
    city_ids: ['1'],
    search_data: { form_data: { data: { category: { str: { value: category } }, districts: { repeated_string: { value: [String(districtId)] } } } } },
  }
  const res = await fetch('https://api.divar.ir/v8/postlist/w/search', { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': UA }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`search ${category}/${districtId}: ${res.status}`)
  const j = await res.json()
  return (j.list_widgets || []).filter((w) => w.widget_type === 'POST_ROW').map((w) => w.data)
}

async function post(token) {
  const file = new URL(`${token}.json`, POSTS)
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'))
  const res = await fetch(`https://api.divar.ir/v8/posts-v2/web/${token}`, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`post ${token}: ${res.status}`)
  const j = await res.json()
  delete j.contact // never keep contact metadata
  writeFileSync(file, JSON.stringify(j))
  await sleep(DELAY)
  return j
}

const rowsFile = new URL('rows.json', CACHE)
let rows = existsSync(rowsFile) ? JSON.parse(readFileSync(rowsFile, 'utf8')) : []
const done = new Set(rows.map((r) => `${r.deal}:${r.districtId}`))

for (const [deal, ids] of [['rent', RENT], ['buy', BUY]]) {
  for (const id of ids) {
    if (done.has(`${deal}:${id}`)) continue
    try {
      const list = await search(CATEGORY[deal], id)
      for (const d of list) {
        rows.push({
          deal, districtId: id, token: d.action?.payload?.token || d.token,
          title: d.title, image: d.image_url, imageCount: d.image_count,
          top: d.top_description_text, middle: d.middle_description_text,
          bumped: d.red_text || null, isAgency: /املاک|مشاور|گروه/.test(d.bottom_description_text || ''),
        })
      }
      console.log(`[search] ${deal} ${id} → ${list.length}`)
      writeFileSync(rowsFile, JSON.stringify(rows))
    } catch (e) { console.log('[search:error]', e.message) }
    await sleep(DELAY)
  }
}

const tokens = [...new Set(rows.map((r) => r.token))]
console.log(`[detail] ${tokens.length} unique tokens`)
let i = 0
for (const t of tokens) {
  i++
  try { await post(t) } catch (e) { console.log('[detail:error]', t, e.message); await sleep(DELAY * 2) }
  if (i % 25 === 0) console.log(`[detail] ${i}/${tokens.length}`)
}
console.log('[done]')
