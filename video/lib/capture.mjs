// Scripted screen capture: headless Chrome + CDP screencast → constant-frame-rate MP4.
// A visible cursor, click ripples and a smooth "camera" zoom are injected into the page,
// so the recording reads like a real screen recording without any human mistakes.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'

export const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
export const SITE = 'http://localhost:4311'
export const FPS = 30
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const CURSOR_SCRIPT = `
(() => {
  if (window.__cursorInstalled) return; window.__cursorInstalled = true;
  const install = () => {
    const c = document.createElement('div');
    c.id = '__cursor';
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2.5 20 11.2l-7 1.6-3.6 6.7z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: 2147483647, pointerEvents: 'none', transform: 'translate(-100px,-100px)', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.35))', transition: 'opacity .2s' });
    document.documentElement.appendChild(c);
    const st = document.createElement('style');
    st.textContent = '@keyframes __ripple{from{transform:translate(-50%,-50%) scale(.2);opacity:.55}to{transform:translate(-50%,-50%) scale(1);opacity:0}} .__ripple{position:fixed;width:46px;height:46px;border-radius:50%;background:rgba(225,29,72,.45);pointer-events:none;z-index:2147483646;animation:__ripple .5s ease-out forwards} html{scrollbar-width:none} ::-webkit-scrollbar{display:none}';
    document.documentElement.appendChild(st);
    addEventListener('mousemove', (e) => { c.style.transform = 'translate(' + (e.clientX - 3) + 'px,' + (e.clientY - 2) + 'px)' }, true);
    addEventListener('mousedown', (e) => { const r = document.createElement('div'); r.className = '__ripple'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.documentElement.appendChild(r); setTimeout(() => r.remove(), 600) }, true);
  };
  if (document.documentElement) install(); else addEventListener('DOMContentLoaded', install);
})();`

export async function launch() {
  return chromium.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none'] })
}

/** A page sized so the capture is exactly 1920×1080 (or the phone equivalent). */
export async function newPage(browser, { mobile = false, dark = false } = {}) {
  const ctx = await browser.newContext(
    mobile
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: dark ? 'dark' : 'light', locale: 'fa-IR' }
      : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, colorScheme: dark ? 'dark' : 'light', locale: 'fa-IR' },
  )
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: SITE })
  await ctx.addInitScript(CURSOR_SCRIPT)
  // the demo's theme toggle reads localStorage; start every shot in light mode unless asked otherwise
  await ctx.addInitScript((d) => { try { localStorage.setItem('torob-khaneh:theme', d ? 'dark' : 'light') } catch {} }, dark)
  const page = await ctx.newPage()
  page.__mouse = { x: 760, y: 900 }
  return page
}

/** Start recording; returns stop() → writes an MP4 of exactly `durationSec` if given. */
export async function record(page, outFile, { mobile = false } = {}) {
  const cdp = await page.context().newCDPSession(page)
  const dir = outFile + '.frames'
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  const frames = []
  const writes = []
  let t0 = null
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    // ack first: Chrome won't produce the next frame until this one is acknowledged
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
    const ts = metadata.timestamp
    if (t0 === null) t0 = ts
    const f = path.join(dir, String(frames.length).padStart(6, '0') + '.jpg')
    frames.push({ f, t: ts - t0 })
    writes.push(fs.promises.writeFile(f, Buffer.from(data, 'base64')))
  })
  const size = mobile ? { maxWidth: 1170, maxHeight: 2532 } : { maxWidth: 1920, maxHeight: 1080 }
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1, ...size })
  // nudge a repaint so the first frame arrives immediately
  await page.evaluate(() => { document.body.style.outline = '0 solid transparent'; requestAnimationFrame(() => { document.body.style.outline = '' }) })
  const started = Date.now()

  /** `skip` drops the first seconds (e.g. a page reload), keeping the frame on screen at that moment. */
  return async function stop(durationSec, { skip = 0 } = {}) {
    const elapsed = (Date.now() - started) / 1000 - skip
    await cdp.send('Page.stopScreencast')
    await sleep(200)
    await Promise.all(writes)
    const total = durationSec ?? elapsed
    if (!frames.length) throw new Error('no frames captured for ' + outFile)
    if (skip > 0) {
      const firstKept = Math.max(0, frames.findIndex((f) => f.t > skip) - 1)
      frames.splice(0, firstKept)
      frames.forEach((f) => { f.t = Math.max(0, f.t - skip) })
    }
    // concat demuxer with per-frame durations → exact wall-clock timing, then CFR 30fps
    const lines = []
    frames.forEach((fr, i) => {
      const next = i + 1 < frames.length ? frames[i + 1].t : total
      const d = Math.max(0.001, Math.min(next, total) - fr.t)
      if (fr.t >= total) return
      lines.push(`file '${path.basename(fr.f)}'`, `duration ${d.toFixed(4)}`)
    })
    lines.push(`file '${path.basename(frames.at(-1).f)}'`)
    fs.writeFileSync(path.join(dir, 'list.txt'), lines.join('\n'))
    const vf = mobile ? `fps=${FPS},scale=780:-2:flags=lanczos` : `fps=${FPS},scale=1920:1080:flags=lanczos`
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'list.txt'), '-vf', vf, '-t', total.toFixed(3), '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', outFile])
    fs.rmSync(dir, { recursive: true, force: true })
    return { frames: frames.length, seconds: total }
  }
}

/* ───────── choreography helpers ───────── */

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Glide the cursor to (x, y) in CSS px with an ease-in-out curve. */
export async function glide(page, x, y, ms = 700) {
  // time-based: each step lands where the curve says it should be *now*, so a busy page
  // (slow CDP round-trips) makes the motion coarser, never longer
  const from = page.__mouse
  const t0 = Date.now()
  for (;;) {
    const k = Math.min(1, (Date.now() - t0) / ms)
    const e = ease(k)
    await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e)
    if (k >= 1) break
    await sleep(12)
  }
  page.__mouse = { x, y }
}

export async function boxOf(page, locator) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator
  await el.waitFor({ state: 'visible', timeout: 8000 })
  const b = await el.boundingBox()
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, box: b }
}

export async function glideTo(page, locator, ms = 700, dx = 0, dy = 0) {
  const { x, y } = await boxOf(page, locator)
  await glide(page, x + dx, y + dy, ms)
}

export async function clickAt(page, locator, ms = 700) {
  await glideTo(page, locator, ms)
  await sleep(120)
  await page.mouse.down()
  await sleep(90)
  await page.mouse.up()
}

/** Smooth scroll so that `y` (document px) is at the top, or an element sits at `offset` px from the top. */
export async function scrollTo(page, target, ms = 1200, offset = 90) {
  await page.evaluate(async ({ target, ms, offset }) => {
    const y = typeof target === 'number' ? target : (() => { const el = [...document.querySelectorAll(target.sel)].find((e) => !target.text || e.textContent.includes(target.text)); return el.getBoundingClientRect().top + scrollY - offset })()
    const from = scrollY, to = Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight))
    const e = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const t0 = performance.now()
    await new Promise((res) => { const f = (now) => { const k = Math.min(1, (now - t0) / ms); scrollTo(0, from + (to - from) * e(k)); k < 1 ? requestAnimationFrame(f) : res() }; requestAnimationFrame(f) })
  }, { target, ms, offset })
}

/** Camera zoom: scale the page around a point (CSS px in the viewport). scale 1 = reset. */
// The camera scales <body>, not <html>, so the injected cursor (a child of <html>) stays true to the mouse.
// Origin = the target's centre in *unzoomed* document coordinates; animating origin + scale together
// gives a smooth zoom, and changing only the origin while zoomed reads as a camera pan.
const CAMERA_JS = (el, { scale, ms, padY, ax }) => {
  const b = document.body
  const cur = b.style.transform.match(/scale\(([\d.]+)\)/)
  const s = cur ? +cur[1] : 1
  const [ox, oy] = (b.style.transformOrigin || '0px 0px').split(' ').map(parseFloat)
  const r = el.getBoundingClientRect()
  const sx = r.left + r.width * ax, sy = r.top + scrollY + r.height / 2 + padY
  const cx = s === 1 ? sx : ox + (sx - ox) / s
  const cy = s === 1 ? sy : oy + (sy - oy) / s
  b.style.transition = `transform ${ms}ms cubic-bezier(.65,0,.35,1), transform-origin ${ms}ms cubic-bezier(.65,0,.35,1)`
  b.style.transformOrigin = `${cx}px ${cy}px`
  b.style.transform = `scale(${scale})`
}

/** Zoom the camera onto an element (keeps it where it is on screen, magnified).
 *  `ax` picks the anchor across the element (0 = left, 1 = right) — for wide RTL blocks, zoom near the text start. */
export async function zoomOn(page, locator, scale = 1.6, ms = 900, padY = 0, ax = 0.5) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(CAMERA_JS, { scale, ms, padY, ax })
  await sleep(ms)
}

/** Back to 1×. The transform is removed at the end so `position: fixed` (sheets, menus) works again. */
export async function resetCamera(page, ms = 700) {
  await page.evaluate((ms) => {
    const b = document.body
    if (!b.style.transform) return
    b.style.transition = `transform ${ms}ms cubic-bezier(.65,0,.35,1)`
    b.style.transform = 'scale(1)'
    setTimeout(() => { b.style.transition = ''; b.style.transform = ''; b.style.transformOrigin = '' }, ms + 30)
  }, ms)
  await sleep(ms + 60)
}

/** Type like a person: steady rhythm with tiny jitter. */
export async function typeHuman(page, text, totalMs) {
  // each character has a scheduled time (with a little jitter); never sleep when running behind
  const t0 = Date.now()
  const chars = [...text]
  for (let i = 0; i < chars.length; i++) {
    const due = ((i + 0.5 + (Math.random() - 0.5) * 0.4) / chars.length) * totalMs
    const wait = due - (Date.now() - t0)
    if (wait > 0) await sleep(wait)
    await page.keyboard.type(chars[i])
  }
}

/** Wait until `t` seconds after the shot's zero (keeps choreography on the narration clock). */
export function clock() {
  const t0 = Date.now()
  const at = async (sec) => { const wait = sec * 1000 - (Date.now() - t0); if (wait > 0) await sleep(wait) }
  at.now = () => (Date.now() - t0) / 1000
  return at
}

/** Press on the element, move by (dx, dy) CSS px over `ms`, release — for sliders. */
export async function drag(page, locator, dx, ms = 1500, dy = 0) {
  await glideTo(page, locator, 600)
  const { x, y } = page.__mouse
  await page.mouse.down()
  await glide(page, x + dx, y + dy, ms)
  await sleep(80)
  await page.mouse.up()
}
