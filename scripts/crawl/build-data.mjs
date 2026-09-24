// Step 2 — normalize → dedupe → enrich → write JSON for the frontend.
// Input:  .cache/rows.json, .cache/posts/*.json, .cache/districts.json, .cache/metro-wd.json
// Output: ../../web/src/data/{homes,neighborhoods,metro,report}.json + ../../web/public/data/homes-index.json
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'

const C = new URL('./.cache/', import.meta.url)
const OUT_SRC = new URL('../../web/src/data/', import.meta.url)
const OUT_PUB = new URL('../../web/public/data/', import.meta.url)
mkdirSync(OUT_SRC, { recursive: true }); mkdirSync(OUT_PUB, { recursive: true })

const CRAWLED_AT = '2026-09-23' // ۱ مهر ۱۴۰۵
const RAHN_RATE = 0.03 // ۳٪ ماهانه: هر ۱ میلیون ودیعه ≈ ۳۰ هزار تومان اجاره

// ---------- text helpers ----------
const FA = '۰۱۲۳۴۵۶۷۸۹', AR = '٠١٢٣٤٥٦٧٨٩'
const toEn = (s = '') => String(s).replace(/[۰-۹]/g, (d) => FA.indexOf(d)).replace(/[٠-٩]/g, (d) => AR.indexOf(d))
const clean = (s = '') => toEn(s).replace(/[‎‏‪-‮]/g, '').trim()
const num = (s) => { const n = Number(clean(s).replace(/[^\d.]/g, '')); return Number.isFinite(n) && clean(s).match(/\d/) ? n : undefined }
const money = (s) => {
  const t = clean(s)
  if (!t || /توافقی|مجانی/.test(t)) return undefined
  if (/رایگان/.test(t)) return 0
  return num(t)
}
const WORD_NUM = { صفر: 0, یک: 1, دو: 2, سه: 3, چهار: 4, پنج: 5 }
// signature / contact lines («مشاور شما: …», «تماس با آقای …», social handles) are dropped entirely
const CONTACT_LINE = /(مشاور\s*(شما|فروش|املاک\s*:)|کارشناس\s*(شما|فروش)|تماس|واتس|تلگرام|ایتا|روبیکا|اینستا|پیج|آقای|خانم|جهت\s*هماهنگی|جهت\s*بازدید|شماره|تلفن|همراه\s*:|کد\s*(ملک|فایل)|مدیریت\s*:|مشاور\s*:)/
const stripContacts = (s = '') => clean(s)
  .split('\n').filter((line) => !CONTACT_LINE.test(line)).join('\n')
  .replace(/(\+?98|0)?9\d{2}[\s-]?\d{3}[\s-]?\d{4}/g, '•••')     // mobiles
  .replace(/0?21[\s-]?\d{8}/g, '•••')                             // Tehran landlines
  .replace(/\b\d{8}\b/g, '•••')
  .replace(/@[A-Za-z0-9_]{3,}/g, '')                              // telegram/instagram handles
  .replace(/https?:\/\/\S+/g, '')
  .replace(/\n{3,}/g, '\n\n').trim()

const JMONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
function jalaliToGregorian(jy, jm, jd) { // standard algorithm
  jy += 1595; let days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186)
  let gy = 400 * Math.floor(days / 146097); days %= 146097
  if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++ }
  gy += 4 * Math.floor(days / 1461); days %= 1461
  if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365 }
  let gd = days + 1; const sal = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gm = 0; for (gm = 0; gm < 13 && gd > sal[gm]; gm++) gd -= sal[gm]
  return new Date(Date.UTC(gy, gm - 1, gd))
}
const postedFromSeo = (title = '') => {
  const m = clean(title).match(/(\d{1,2})\s+(\S+)\s+(\d{4})\s*$/)
  if (!m) return undefined
  const mi = JMONTHS.indexOf(m[2]); if (mi < 0) return undefined
  return jalaliToGregorian(+m[3], mi + 1, +m[1]).toISOString().slice(0, 10)
}
const haversine = (a, b) => { const R = 6371e3, r = Math.PI / 180; const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)) }
const median = (xs) => { const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b); if (!s.length) return undefined; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }

// ---------- inputs ----------
const rows = JSON.parse(readFileSync(new URL('rows.json', C), 'utf8'))
const districts = JSON.parse(readFileSync(new URL('districts.json', C), 'utf8')).districts
const dById = new Map(districts.map((d) => [d.id, d]))
const metroRaw = JSON.parse(readFileSync(new URL('metro-wd.json', C), 'utf8')).results.bindings
const metro = metroRaw.map((b) => {
  const [lng, lat] = b.coord.value.replace(/Point\(|\)/g, '').split(' ').map(Number)
  const lines = [...new Set((b.lines?.value || '').split('|').map((l) => +(l.match(/Line (\d+)/)?.[1])).filter(Boolean))]
  const name = (b.fa?.value || b.en?.value || '').replace(/^ایستگاه (متروی|مترو)\s*/, '').replace(/\s*\(تهران\)$/, '').trim()
  return { name, nameEn: b.en?.value?.replace(/ Metro Station.*$/, ''), lat, lng, lines }
}).filter((s) => s.lat > 35.5 && s.lat < 35.9 && s.lng > 51.0 && s.lng < 51.7 && s.name)
const rowByToken = new Map(); for (const r of rows) if (!rowByToken.has(r.token)) rowByToken.set(r.token, r)

// ---------- normalize each listing ----------
const REGION = { 75: 'شمال‌غرب', 82: 'شمال‌غرب', 61: 'شمال', 67: 'شمال‌شرق', 90: 'مرکز', 91: 'مرکز', 315: 'شمال', 399: 'شرق', 108: 'شرق', 205: 'غرب', 146: 'غرب', 151: 'غرب', 167: 'غرب', 88: 'مرکز', 86: 'شمال', 292: 'شرق', 252: 'جنوب', 172: 'غرب', 139: 'غرب', 72: 'شمال' }
const report = { crawledAt: CRAWLED_AT, rawListings: 0, parsed: 0, skipped: {}, negotiable: 0, stockPhotos: 0, noPhotos: 0, bumped: 0, agency: 0 }
const skip = (why) => { report.skipped[why] = (report.skipped[why] || 0) + 1 }

const listings = []
for (const f of readdirSync(new URL('posts/', C))) {
  report.rawListings++
  const token = f.replace('.json', '')
  const row = rowByToken.get(token)
  if (!row) { skip('no-row'); continue }
  let j; try { j = JSON.parse(readFileSync(new URL(`posts/${f}`, C), 'utf8')) } catch { skip('bad-json'); continue }
  const sec = (n) => j.sections?.find((s) => s.section_name === n)?.widgets || []
  const kv = {}, info = {}, feats = {}, extras = {}
  for (const w of sec('LIST_DATA')) {
    if (w.widget_type === 'GROUP_INFO_ROW') for (const it of w.data.items) info[it.title] = it.value
    if (w.widget_type === 'UNEXPANDABLE_ROW') kv[w.data.title] = w.data.value
    if (w.widget_type === 'GROUP_FEATURE_ROW') for (const it of w.data.items) { const t = clean(it.title); const has = !/ندارد/.test(t); feats[t.replace(/\s*ندارد/, '')] = has }
    if (w.widget_type === 'SELECTOR_ROW' && /ویژگی/.test(w.data.title || '')) {
      for (const m of w.data.action?.payload?.modal_page?.widget_list || []) {
        if (m.widget_type === 'UNEXPANDABLE_ROW') extras[clean(m.data.title)] = clean(m.data.value)
        if (m.widget_type === 'FEATURE_ROW') extras[clean(m.data.title)] = true
      }
    }
  }
  const deal = row.deal
  const area = num(info['متراژ'])
  if (!area || area < 20 || area > 1500) { skip('area'); continue }
  const rawRooms = clean(info['اتاق'] || '')
  const rooms = /بدون/.test(rawRooms) ? 0 : num(rawRooms) ?? WORD_NUM[rawRooms]
  const yearRaw = clean(info['ساخت'] || '')
  const yearBuilt = /قبل/.test(yearRaw) ? 1369 : num(yearRaw)
  const floorRaw = clean(kv['طبقه'] || '')
  const floor = /همکف/.test(floorRaw) ? (/زیر/.test(floorRaw) ? -1 : 0) : num(floorRaw.split('از')[0])
  const totalFloors = num(floorRaw.split('از')[1])

  let deposit, rent, price, pricePerM2, convertible
  if (deal === 'rent') {
    deposit = money(kv['ودیعه'] ?? kv['ودیعه (رهن)']); rent = money(kv['اجارهٔ ماهانه'] ?? kv['اجاره ماهانه'])
    convertible = kv['ودیعه و اجاره'] ? !/غیر/.test(kv['ودیعه و اجاره']) : undefined
    if (deposit === undefined && rent === undefined) { // fallback: list-row text
      deposit = money((row.top || '').split(':')[1]); rent = money((row.middle || '').split(':')[1] ?? (/رهن کامل/.test(row.middle || '') ? 'رایگان' : ''))
    }
  } else {
    price = money(kv['قیمت کل']); pricePerM2 = money(kv['قیمت هر متر'])
    if (price === undefined) price = money((row.top || row.middle || '').split(':')[1])
    if (price && !pricePerM2) pricePerM2 = Math.round(price / area)
  }
  const negotiable = deal === 'rent' ? deposit === undefined && rent === undefined : price === undefined
  const equivRent = deal === 'rent' && !negotiable ? Math.round((rent || 0) + (deposit || 0) * RAHN_RATE) : undefined

  const carousel = sec('IMAGE')[0]?.data?.items || []
  const images = carousel.map((it) => it.image?.url).filter(Boolean).slice(0, 12)
  const thumbs = carousel.map((it) => it.image?.thumbnail_url).filter(Boolean).slice(0, 12)
  const point = sec('MAP')[0]?.data?.location
  const p = point?.exact_data?.point || point?.fuzzy_data?.point || point?.approximate_data?.point
  const d = dById.get(row.districtId)
  const geo = p ? { lat: +p.latitude, lng: +p.longitude, approx: !point?.exact_data } : d ? { lat: d.centroid.latitude, lng: d.centroid.longitude, approx: true } : undefined
  const title = clean(sec('TITLE')[0]?.data?.title || row.title || '')
  // roommate / dorm ads rent a bed, not an apartment: they would skew medians and top the "cheapest" sort
  if (/هم[\s‌]?خ[وا]نه|خوابگاه|اقامتگاه|اشتراکی/.test(title)) { skip('shared'); continue }
  const description = stripContacts(sec('DESCRIPTION').find((w) => w.widget_type === 'DESCRIPTION_ROW')?.data?.text || '').slice(0, 900)
  const stockPhotos = /خیر/.test(kv['تصویر‌ها برای همین ملک است؟'] || kv['تصویرها برای همین ملک است؟'] || '')
  const postedAt = postedFromSeo(j.seo?.title) || CRAWLED_AT
  const text = `${title} ${description}`
  const renovated = /بازسازی|بازسازی شده|تمام بازسازی/.test(text) || /بازسازی/.test(extras['وضعیت واحد'] || '')
  const balcony = /بالکن|تراس/.test(text) || extras['بالکن'] === true

  listings.push({
    id: token, source: 'divar', url: `https://divar.ir/v/${token}`, deal, districtId: row.districtId,
    neighborhood: d?.name || j.seo?.web_info?.district_persian, title, description,
    images, thumbs: thumbs.length ? thumbs : [row.image].filter(Boolean),
    area, rooms, yearBuilt, floor, totalFloors,
    features: { elevator: feats['آسانسور'], parking: feats['پارکینگ'], storage: feats['انباری'], balcony: balcony || undefined, renovated: renovated || undefined },
    direction: extras['جهت ساختمان'], deposit, rent, convertible, equivRent, price, pricePerM2, negotiable,
    geo, postedAt, stockPhotos, bumped: !!row.bumped, isAgency: !!row.isAgency,
  })
  report.parsed++
  if (negotiable) report.negotiable++
  if (stockPhotos) report.stockPhotos++
  if (!images.length) report.noPhotos++
  if (row.bumped) report.bumped++
  if (row.isAgency) report.agency++
}

// ---------- dedupe (union-find over listings of the same deal+district) ----------
const parent = listings.map((_, i) => i)
const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])))
const unite = (a, b) => { parent[find(a)] = find(b) }
const tokens = (s) => new Set(clean(s).replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w.length > 2))
const jaccard = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n || 1) }
const imgKey = (u = '') => u.split('/').pop()?.replace(/\.\w+$/, '')
const tok = listings.map((l) => tokens(`${l.title} ${l.description}`))
const reasons = new Map()
for (let a = 0; a < listings.length; a++) {
  for (let b = a + 1; b < listings.length; b++) {
    const x = listings[a], y = listings[b]
    if (x.deal !== y.deal || x.districtId !== y.districtId) continue
    if (Math.abs(x.area - y.area) > 2 || x.rooms !== y.rooms) continue
    if (x.floor !== undefined && y.floor !== undefined && x.floor !== y.floor) continue
    const sameImage = x.images.some((u) => y.images.map(imgKey).includes(imgKey(u)))
    const textSim = jaccard(tok[a], tok[b])
    const px = x.deal === 'rent' ? x.equivRent : x.price, py = y.deal === 'rent' ? y.equivRent : y.price
    const priceClose = px && py ? Math.abs(px - py) / Math.max(px, py) < 0.12 : false
    const nearby = x.geo && y.geo && !x.geo.approx && !y.geo.approx ? haversine(x.geo, y.geo) < 250 : true
    if (sameImage || (textSim > 0.55 && nearby) || (priceClose && nearby && x.yearBuilt === y.yearBuilt && x.yearBuilt)) {
      unite(a, b); reasons.set(`${a}-${b}`, sameImage ? 'image' : textSim > 0.55 ? 'text' : 'specs')
    }
  }
}
const clusters = new Map()
listings.forEach((l, i) => { const r = find(i); if (!clusters.has(r)) clusters.set(r, []); clusters.get(r).push(l) })

// ---------- build homes ----------
let homes = [...clusters.values()].map((ls) => {
  const priced = ls.filter((l) => !l.negotiable)
  const key = (l) => (l.deal === 'rent' ? l.equivRent : l.price)
  const best = (priced.length ? priced : ls).slice().sort((a, b) => (key(a) ?? Infinity) - (key(b) ?? Infinity))[0]
  const richest = ls.slice().sort((a, b) => b.images.length - a.images.length || b.description.length - a.description.length)[0]
  const pick = (f) => ls.map((l) => l[f]).find((v) => v !== undefined)
  const features = {}; for (const k of ['elevator', 'parking', 'storage', 'balcony', 'renovated']) { const vs = ls.map((l) => l.features[k]).filter((v) => v !== undefined); if (vs.length) features[k] = vs.some(Boolean) }
  const newest = ls.map((l) => l.postedAt).sort().at(-1)
  return {
    id: best.id, deal: best.deal, districtId: best.districtId, neighborhood: best.neighborhood, region: REGION[best.districtId] || '',
    title: richest.title, description: richest.description, images: richest.images, thumbs: richest.thumbs,
    area: best.area, rooms: best.rooms, yearBuilt: pick('yearBuilt'), floor: pick('floor'), totalFloors: pick('totalFloors'),
    direction: pick('direction'), features, geo: ls.find((l) => l.geo && !l.geo.approx)?.geo || best.geo,
    deposit: best.deposit, rent: best.rent, convertible: pick('convertible'), equivRent: best.equivRent, price: best.price,
    pricePerM2: best.pricePerM2, negotiable: best.negotiable, postedAt: newest,
    listings: ls.map((l) => ({ id: l.id, url: l.url, source: l.source, title: l.title, deposit: l.deposit, rent: l.rent, equivRent: l.equivRent, price: l.price, negotiable: l.negotiable, postedAt: l.postedAt, isAgency: l.isAgency, bumped: l.bumped, stockPhotos: l.stockPhotos, thumb: l.thumbs[0] })).sort((a, b) => (a.equivRent ?? a.price ?? Infinity) - (b.equivRent ?? b.price ?? Infinity)),
    trust: { hasPhotos: richest.images.length > 0, stockPhotos: ls.every((l) => l.stockPhotos), negotiable: best.negotiable, anyAgency: ls.some((l) => l.isAgency), owner: ls.some((l) => !l.isAgency) },
  }
})

// ---------- enrich: metro, medians, deal score, summaries ----------
for (const h of homes) {
  if (h.geo) {
    let bestS, bestD = Infinity
    for (const s of metro) { const dd = haversine(h.geo, s); if (dd < bestD) { bestD = dd; bestS = s } }
    if (bestS) h.nearestMetro = { station: bestS.name, lines: bestS.lines, meters: Math.round(bestD / 10) * 10 }
  }
  h.equivRentPerM2 = h.equivRent ? Math.round(h.equivRent / h.area) : undefined
  h.age = h.yearBuilt ? Math.max(0, 1405 - h.yearBuilt) : undefined
}
const byDistrict = new Map()
for (const h of homes) { const k = `${h.deal}:${h.districtId}`; if (!byDistrict.has(k)) byDistrict.set(k, []); byDistrict.get(k).push(h) }
const medianOf = (deal, id) => { const hs = byDistrict.get(`${deal}:${id}`) || []; return median(hs.map((h) => (deal === 'rent' ? h.equivRentPerM2 : h.pricePerM2))) }
for (const h of homes) {
  const m = medianOf(h.deal, h.districtId), v = h.deal === 'rent' ? h.equivRentPerM2 : h.pricePerM2
  h.areaMedianPerM2 = m ? Math.round(m) : undefined
  h.vsAreaMedian = m && v ? +((v - m) / m).toFixed(3) : undefined
  const flags = []
  if (h.trust.negotiable) flags.push('negotiable')
  if (h.trust.stockPhotos) flags.push('stockPhotos')
  if (!h.trust.hasPhotos) flags.push('noPhotos')
  if (h.vsAreaMedian !== undefined && h.vsAreaMedian < -0.35) flags.push('tooGood')
  h.trust.flags = flags
  // rule-based summary (generated at ingest time; no API key in the client)
  const roomTxt = h.rooms === 0 ? 'بدون اتاق' : `${['', 'یک', 'دو', 'سه', 'چهار', 'پنج'][h.rooms] || h.rooms.toLocaleString('fa-IR')}‌خوابه`
  const pros = [], cons = []
  if (h.vsAreaMedian !== undefined && h.vsAreaMedian <= -0.08) pros.push(`${Math.round(-h.vsAreaMedian * 100).toLocaleString('fa-IR')}٪ زیر میانه‌ی قیمت هر متر در ${h.neighborhood}`)
  if (h.vsAreaMedian !== undefined && h.vsAreaMedian >= 0.15) cons.push(`${Math.round(h.vsAreaMedian * 100).toLocaleString('fa-IR')}٪ بالاتر از میانه‌ی ${h.neighborhood}`)
  if (h.nearestMetro && h.nearestMetro.meters <= 900) pros.push(`${h.nearestMetro.meters.toLocaleString('fa-IR')} متر تا مترو ${h.nearestMetro.station}`)
  if (h.nearestMetro && h.nearestMetro.meters > 2000) cons.push('دور از مترو')
  if (h.age !== undefined && h.age <= 5) pros.push('نوساز')
  if (h.age !== undefined && h.age >= 25) cons.push(`ساختمان ${h.age.toLocaleString('fa-IR')} ساله`)
  if (h.features.parking) pros.push('پارکینگ'); else if (h.features.parking === false) cons.push('بدون پارکینگ')
  if (h.features.elevator) pros.push('آسانسور'); else if (h.features.elevator === false && (h.floor ?? 0) >= 3) cons.push('طبقه‌ی بالا بدون آسانسور')
  if (h.features.renovated) pros.push('بازسازی‌شده')
  if (h.listings.length > 1) pros.push(`${h.listings.length.toLocaleString('fa-IR')} آگهی از همین خانه؛ قیمت‌ها را مقایسه کن`)
  if (h.trust.stockPhotos) cons.push('آگهی‌دهنده گفته عکس‌ها مال همین ملک نیست')
  if (h.trust.negotiable) cons.push('قیمت توافقی')
  h.ai = {
    summary: `${roomTxt} ${h.area.toLocaleString('fa-IR')} متری در ${h.neighborhood}${h.yearBuilt ? `، ساخت ${h.yearBuilt.toLocaleString('fa-IR', { useGrouping: false })}` : ''}${h.floor !== undefined ? `، طبقه‌ی ${h.floor === 0 ? 'همکف' : h.floor.toLocaleString('fa-IR')}${h.totalFloors ? ` از ${h.totalFloors.toLocaleString('fa-IR')}` : ''}` : ''}.`,
    pros: pros.slice(0, 5), cons: cons.slice(0, 4),
  }
}
homes = homes.sort((a, b) => a.id.localeCompare(b.id))

// ---------- neighborhoods ----------
const neighborhoods = [...new Set(homes.map((h) => h.districtId))].map((id) => {
  const d = dById.get(id), rentH = byDistrict.get(`rent:${id}`) || [], buyH = byDistrict.get(`buy:${id}`) || []
  const cover = [...rentH, ...buyH].filter((h) => h.images.length >= 3 && !h.trust.stockPhotos).sort((a, b) => b.images.length - a.images.length)[0]
  return {
    id, slug: d.slug, name: d.name, region: REGION[id] || '', center: { lat: d.centroid.latitude, lng: d.centroid.longitude },
    rentCount: rentH.length, buyCount: buyH.length,
    medianEquivRent: rentH.length ? Math.round(median(rentH.map((h) => h.equivRent))) : undefined,
    medianEquivRentPerM2: medianOf('rent', id) ? Math.round(medianOf('rent', id)) : undefined,
    medianPricePerM2: medianOf('buy', id) ? Math.round(medianOf('buy', id)) : undefined,
    medianArea: Math.round(median([...rentH, ...buyH].map((h) => h.area))),
    coverImage: cover?.images[0], coverHomeId: cover?.id,
  }
}).sort((a, b) => (b.rentCount + b.buyCount) - (a.rentCount + a.buyCount))

// ---------- report ----------
const multi = homes.filter((h) => h.listings.length > 1)
Object.assign(report, {
  homes: homes.length, rentHomes: homes.filter((h) => h.deal === 'rent').length, buyHomes: homes.filter((h) => h.deal === 'buy').length,
  mergedHomes: multi.length, mergedListings: multi.reduce((s, h) => s + h.listings.length, 0),
  duplicateShare: +(1 - homes.length / report.parsed).toFixed(3), neighborhoods: neighborhoods.length, metroStations: metro.length,
  rahnRate: RAHN_RATE,
})

// ---------- write ----------
const write = (url, data) => writeFileSync(url, JSON.stringify(data))
write(new URL('homes.json', OUT_SRC), homes)
write(new URL('neighborhoods.json', OUT_SRC), neighborhoods)
write(new URL('metro.json', OUT_SRC), metro)
write(new URL('report.json', OUT_SRC), report)
// lite index for client-side search (no descriptions / full galleries)
const index = homes.map(({ description, images, listings: ls, thumbs, ai, trust, direction, ...h }) => ({ ...h, cover: images[0] || thumbs[0], thumbs: thumbs.slice(0, 4), imageCount: images.length, sources: ls.length, flags: trust.flags, pros: ai.pros.slice(0, 3), owner: trust.owner }))
write(new URL('homes-index.json', OUT_PUB), index)
console.log(JSON.stringify(report, null, 1))
