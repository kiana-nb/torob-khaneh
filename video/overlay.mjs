// Subtitles + chapter pills, rendered by Chrome (site font, correct RTL shaping) into transparent
// PNG "states", then stitched into one alpha video that compose.mjs lays over the picture.
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { launch } from './lib/capture.mjs'
import { shots } from './scenes.mjs'
import { BUILD, CHAPTERS, ROOT, VOICE, timeline } from './timeline.mjs'

const SCRIPT = path.join(ROOT, '..', 'docs', '03b-elevenlabs-script.txt')
const OUT = path.join(BUILD, 'overlay')

/* ───────── subtitle text ───────── */

const display = (s) =>
  s
    .replace(/\[[^\]]+\]\s*/g, '')
    .replace(/[ٌ-ْ]/g, '') // vowel marks were only for the voice; tanwin (مثلاً، فوراً) is normal spelling and stays
    .replace(/کلود کد/g, 'Claude Code')
    .replace(/ای‌پی‌آی/g, 'API')
    .replace(/\s+/g, ' ')
    .trim()

/** Sentences; very long ones are split once at the comma nearest the middle. */
function sentences(text) {
  // a terminator right before a closing guillemet («… کجا؟») belongs to a quote, not the sentence
  const out = []
  let cur = ''
  for (let i = 0; i < text.length; i++) {
    cur += text[i]
    if ('.!؟?؛'.includes(text[i]) && text[i + 1] !== '»') { out.push(cur); cur = '' }
  }
  if (cur.trim()) out.push(cur)
  return out
}

function cues(text) {
  const out = []
  for (const raw of sentences(text)) {
    const s = raw.trim()
    if (!s) continue
    if (s.length <= 62) { out.push(s); continue }
    const commas = [...s.matchAll(/[،,:]/g)].map((m) => m.index)
    const mid = s.length / 2
    const cut = commas.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))[0]
    if (cut === undefined) { out.push(s); continue }
    out.push(s.slice(0, cut + 1).trim(), s.slice(cut + 1).trim())
  }
  return out
}

function silences(file) {
  // silencedetect reports on stderr
  const txt = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-38dB:d=0.18', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
  const starts = [...txt.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1])
  const ends = [...txt.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1])
  return starts.map((s, i) => ({ s, e: ends[i] ?? s })).filter((x) => x.s > 0.3)
}

/** Proportional timing by characters, each boundary snapped to the nearest real pause. */
function timeCues(list, voiceFile, dur) {
  const sil = silences(voiceFile)
  const speechStart = 0.1
  const total = list.reduce((a, c) => a + c.length, 0)
  const MIN = 1.0 // no subtitle shorter than this, and every later cue keeps room for itself
  const bounds = [speechStart]
  let acc = 0
  for (let i = 0; i < list.length - 1; i++) {
    acc += list[i].length
    const guess = speechStart + (acc / total) * (dur - speechStart)
    const lo = bounds.at(-1) + MIN
    const hi = dur - MIN * (list.length - 1 - i)
    const near = sil.map((x) => ({ ...x, m: (x.s + x.e) / 2 })).filter((x) => Math.abs(x.m - guess) < 1.6 && x.m >= lo && x.m <= hi).sort((a, b) => Math.abs(a.m - guess) - Math.abs(b.m - guess))[0]
    bounds.push(near ? near.m : Math.min(hi, Math.max(lo, guess)))
  }
  bounds.push(dur)
  return list.map((t, i) => ({ text: t, a: bounds[i], b: bounds[i + 1] }))
}

/* ───────── states → PNG → alpha video ───────── */

const PAGE = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">
<link rel="stylesheet" href="../../cards/card.css">
<style>
 html,body{background:transparent!important}
 .sub{position:absolute;left:50%;bottom:54px;transform:translateX(-50%);max-width:1180px;text-align:center}
 .sub span{display:inline;padding:8px 18px;line-height:2;border-radius:12px;background:rgb(12 12 16 / .78);color:#fff;font-size:27px;font-weight:600;box-decoration-break:clone;-webkit-box-decoration-break:clone;box-shadow:0 10px 30px -10px rgb(0 0 0 / .5)}
 .chap{position:absolute;bottom:122px;left:48px;display:flex;align-items:center;gap:12px;padding:10px 18px 10px 14px;border-radius:999px;background:rgb(12 12 16 / .82);color:#fff;font-size:19px;font-weight:700;box-shadow:0 12px 30px -12px rgb(0 0 0 / .6)}
 .chap i{font-style:normal;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#e11d48;font-size:15px;font-weight:800}
</style></head><body></body></html>`

const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])

export async function buildOverlay() {
  const { sections, total } = timeline(shots)
  const script = fs.readFileSync(SCRIPT, 'utf8').trim().split(/\r?\n\s*\r?\n/)

  // absolute-time events
  const subs = []
  const chaps = []
  for (const sec of sections) {
    const list = cues(display(script[sec.s - 1]))
    for (const c of timeCues(list, path.join(VOICE, `s${sec.s}.mp3`), sec.voice)) subs.push({ text: c.text, a: sec.voiceStart + c.a, b: sec.voiceStart + c.b - 0.04 })
    chaps.push({ s: sec.s, a: sec.start + 0.15, b: sec.start + 3.6 })
  }
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, 'subs.json'), JSON.stringify(subs, null, 1))

  // chapter pill fade: opacity steps at 1/30 s
  const pillAlpha = (t) => {
    for (const c of chaps) {
      if (t < c.a || t > c.b) continue
      const k = Math.min(1, (t - c.a) / 0.3, (c.b - t) / 0.3)
      return { s: c.s, o: Math.round(k * 5) / 5 }
    }
    return null
  }
  const subAt = (t) => subs.find((x) => t >= x.a && t < x.b)?.text ?? ''

  // sample the timeline every frame, collapse runs of identical states
  const states = []
  for (let f = 0; f <= Math.ceil(total * 30); f++) {
    const t = f / 30
    const p = pillAlpha(t)
    const key = JSON.stringify([subAt(t), p])
    if (states.at(-1)?.key === key) states.at(-1).n++
    else states.push({ key, sub: subAt(t), pill: p, n: 1 })
  }

  const browser = await launch()
  const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 })
  const page = await ctx.newPage()
  // a real file (not setContent) so the page may load the local stylesheet + Vazirmatn
  const html = path.join(OUT, 'page.html')
  fs.writeFileSync(html, PAGE)
  await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' })
  await page.evaluate(async () => { document.body.innerHTML = '<span style="font-weight:600">ترب</span>'; await document.fonts.ready; await document.fonts.load('600 27px "Vazirmatn Variable"') })
  const font = await page.evaluate(() => document.fonts.check('600 27px "Vazirmatn Variable"'))
  if (!font) throw new Error('Vazirmatn did not load for the overlay')
  const cache = new Map()
  const lines = []
  for (const st of states) {
    let file = cache.get(st.key)
    if (!file) {
      file = path.join(OUT, `st-${String(cache.size).padStart(4, '0')}.png`)
      await page.evaluate(({ sub, pill, label }) => {
        document.body.innerHTML = ''
        if (sub) { const d = document.createElement('div'); d.className = 'sub'; const s = document.createElement('span'); s.textContent = sub; d.appendChild(s); document.body.appendChild(d) }
        if (pill && pill.o > 0) { const d = document.createElement('div'); d.className = 'chap'; d.style.opacity = pill.o; d.innerHTML = `<i>${label.n}</i>${label.t}`; document.body.appendChild(d) }
      }, { sub: st.sub, pill: st.pill, label: st.pill ? { n: fa(st.pill.s), t: CHAPTERS[st.pill.s] } : null })
      await page.screenshot({ path: file, omitBackground: true })
      cache.set(st.key, file)
    }
    lines.push(`file '${path.basename(file)}'`, `duration ${(st.n / 30).toFixed(5)}`)
  }
  lines.push(lines.at(-2))
  await browser.close()
  fs.writeFileSync(path.join(OUT, 'list.txt'), lines.join('\n'))
  const video = path.join(BUILD, 'overlay.mov')
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'list.txt'), '-vf', 'fps=30,scale=1920:1080,format=argb', '-t', total.toFixed(3), '-c:v', 'qtrle', video])
  return { video, states: states.length, images: cache.size, subs }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await buildOverlay()
  console.log('overlay', r.video, 'states', r.states, 'images', r.images)
  for (const s of r.subs) console.log(s.a.toFixed(2).padStart(7), s.b.toFixed(2).padStart(7), ' ', s.text)
}
