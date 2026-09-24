// Probe candidate Divar neighborhood slugs; keep those whose results match the neighborhood.
import { writeFileSync } from 'node:fs'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36 torob-khaneh-demo'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const candidates = [
  'saadat-abad', 'punak', 'shahrak-e-gharb', 'tajrish', 'niavaran', 'zafaraniyeh', 'velenjak', 'pasdaran',
  'ekhtiarieh', 'elahieh', 'jannat-abad-e-shomali', 'jannat-abad-e-jonubi', 'sattarkhan', 'shahran', 'marzdaran',
  'tehransar', 'yousef-abad', 'amir-abad', 'vanak', 'narmak', 'tehran-pars-e-gharbi', 'hakimiyeh', 'majidieh',
  'pirouzi', 'nazi-abad', 'ponak', 'gisha', 'kuy-e-nasr', 'shahrak-e-gharb-e-jonubi', 'chitgar', 'ekbatan',
  'sadeghiyeh', 'jomhouri', 'enghelab', 'mirdamad', 'zaferanieh', 'yusef-abad', 'amirabad', 'tehranpars',
]

const out = []
for (const slug of candidates) {
  try {
    const res = await fetch(`https://divar.ir/s/tehran/rent-apartment/${slug}`, { headers: { 'User-Agent': UA, 'Accept-Language': 'fa-IR,fa' }, redirect: 'manual' })
    if (res.status !== 200) { out.push({ slug, status: res.status }); console.log(slug, res.status); await sleep(3000); continue }
    const html = await res.text()
    const m = html.match(/window.__PRELOADED_STATE__\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/)
    const s = JSON.parse(m[1])
    const rows = s.nb.listWidgets.filter((w) => w.data?.widgetType === 'POST_ROW').map((w) => w.data.dto.data)
    const counts = {}
    for (const r of rows) { const d = r.action?.payload?.web_info?.district_persian; counts[d] = (counts[d] || 0) + 1 }
    const [top, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ['-', 0]
    const title = (html.match(/<title>([^<]*)/) || [])[1]
    out.push({ slug, status: 200, rows: rows.length, top, share: rows.length ? +(n / rows.length).toFixed(2) : 0, title })
    console.log(slug, rows.length, top, n, '|', title)
  } catch (e) { out.push({ slug, error: e.message }); console.log(slug, 'ERR', e.message) }
  await sleep(3000)
}
writeFileSync(new URL('./.cache/slugs.json', import.meta.url), JSON.stringify(out, null, 1))
