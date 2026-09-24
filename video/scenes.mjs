// Shot list. Times inside `run` are seconds from the start of the shot; the narration of each
// section starts 0.25 s into its first shot (see timeline.mjs), so "voice t" ≈ shot t − 0.25.
import { SITE, clickAt, drag, glide, glideTo, resetCamera, scrollTo, sleep, typeHuman, zoomOn } from './lib/capture.mjs'

const Q = 'دوخوابه نزدیک مترو با ۲ میلیارد رهن و ۲۰ میلیون اجاره، پارکینگ داشته باشه'
const QS = encodeURIComponent(Q)
const settle = (page, ms = 1500) => page.waitForTimeout(ms)
const open = async (page, path, ms = 1800) => { await page.goto(SITE + path, { waitUntil: 'networkidle' }); await settle(page, ms) }
const card = (page, text) => page.locator('article', { hasText: text }).first()

export const shots = [
  /* ───────── 1. hook ───────── */
  {
    name: '1a-results', section: 1,
    prep: async (p) => { await open(p, '/search/') },
    run: async (p, at) => {
      await at(0.3); await glide(p, 980, 520, 900)
      const merged = card(p, 'ادغام‌شده')
      await at(1.4); await scrollTo(p, { sel: 'article', text: 'ادغام‌شده' }, 2600, 230)
      await at(6.6); await zoomOn(p, merged.getByText('ادغام‌شده'), 1.9, 900)
      await at(9.1); await zoomOn(p, merged.locator('p', { hasText: 'رهن' }).last(), 1.9, 900)
      await glideTo(p, merged.locator('p', { hasText: 'رهن' }).last(), 800)
    },
  },
  {
    name: '1b-hero', section: 1, reload: true,
    prep: async (p) => { await open(p, '/') },
    run: async (p, at) => { await at(0.8); await glide(p, 1050, 640, 2200) },
  },

  /* ───────── 2. who I am + the numbers ───────── */
  {
    name: '2a-stats', section: 2,
    prep: async (p) => {
      await open(p, '/about/')
      await p.evaluate(() => { const h = [...document.querySelectorAll('h2')].find((e) => e.textContent.includes('داده‌ها به زبان عدد')); scrollTo(0, h.getBoundingClientRect().top + scrollY - 950) })
      await settle(p, 800)
    },
    run: async (p, at) => {
      await at(0.3); await scrollTo(p, { sel: 'h2', text: 'داده‌ها به زبان عدد' }, 1500, 70)
      await at(2.4); await glideTo(p, p.getByText('خانه‌ی یکتا', { exact: false }).first(), 1000)
      await at(9.0); await zoomOn(p, p.getByText('عکس‌ها مال همین خانه نیست').locator('xpath=ancestor::div[contains(@class,"rounded-[22px]")][1]'), 1.55, 900)
      await glideTo(p, p.getByText('عکس‌ها مال همین خانه نیست'), 700)
      await at(13.3); await zoomOn(p, p.getByText('آگهی از مشاور املاک'), 1.55, 800)
      await at(15.6); await zoomOn(p, p.getByText('آگهی تکراری، ادغام‌شده'), 1.55, 800, 40)
      await at(18.2); await resetCamera(p, 900)
    },
  },

  /* ───────── 3. search in the user's own words ───────── */
  {
    name: '3a-search', section: 3,
    prep: async (p) => { await open(p, '/', 4200) },
    run: async (p, at) => {
      const input = p.locator('form[role=search] input').first()
      await at(0.6); await glideTo(p, input, 1800, 180)
      await at(3.1); await clickAt(p, input, 300)
      await at(4.6); await zoomOn(p, p.locator('form[role=search]').first(), 1.28, 900, 40)
      await at(5.4); await typeHuman(p, Q, 6900)
      await at(18.9); await resetCamera(p, 450)
      await at(19.4); await p.keyboard.press('Enter')
      await p.waitForURL(/\/search\//)
      await p.locator('h1', { hasText: 'خانه برای' }).first().waitFor()
      await at(20.4); await zoomOn(p, p.locator('h1').first(), 1.6, 800, 10, 0.9)
      await at(23.2); await resetCamera(p, 500)
      const reasons = p.locator('article ul').first()
      await at(23.8); await glideTo(p, reasons, 800)
      await zoomOn(p, reasons, 1.75, 900)
      await at(30.9); await resetCamera(p, 600)
      const x = p.getByRole('button', { name: 'حذف نزدیک مترو' }).first()
      await at(31.6); await glideTo(p, x, 1500)
      await at(34.2); await clickAt(p, x, 250)
      await at(34.8); await zoomOn(p, p.locator('form[role=search]').first(), 1.45, 800)
      await at(38.0); await resetCamera(p, 700)
      await at(38.8); await glideTo(p, p.locator('.leaflet-container').first(), 1200, -60, 40)
    },
  },

  /* ───────── 4. equivalent rent + transparent ranking ───────── */
  {
    name: '4a-rank', section: 4,
    prep: async (p) => { await open(p, `/search/?q=${QS}`, 2400) },
    run: async (p, at) => {
      await at(0.4); await zoomOn(p, p.getByText('بودجه‌ات معادل', { exact: false }).first(), 1.7, 900, 0, 0.8)
      const first = p.locator('article').first()
      await at(5.7); await zoomOn(p, first.locator('p.font-extrabold').first(), 1.9, 900)
      await glideTo(p, first.locator('p.font-extrabold').first(), 700)
      await at(8.6); await glideTo(p, first.locator('p', { hasText: 'رهن' }).last(), 800)
      await at(12.1); await resetCamera(p, 600)
      for (const [i, t] of [[0, 12.8], [1, 14.9], [2, 17.0]]) {
        await at(t); await glideTo(p, p.locator('article').nth(i).locator('p.font-extrabold').first(), 900)
      }
      await at(19.6); await clickAt(p, p.getByRole('button', { name: /چطور رتبه‌بندی|چرا این ترتیب/ }).first(), 800)
      await at(21.8); await glide(p, 760, 420, 1200)
      await at(24.6); await glide(p, 760, 560, 1600)
    },
  },

  /* ───────── 5. one home, many listings ───────── */
  {
    name: '5a-home', section: 5,
    prep: async (p) => { await open(p, '/home/gagaDrc_/', 2200) },
    run: async (p, at) => {
      const offers = p.locator('h2', { hasText: 'آگهی از همین خانه' }).first()
      await at(0.3); await scrollTo(p, { sel: 'h2', text: 'آگهی از همین خانه' }, 1500, 150)
      await at(2.2); await zoomOn(p, offers.locator('xpath=..'), 1.4, 900, 30)
      await glideTo(p, offers.locator('xpath=..').locator('a, li, div').filter({ hasText: 'ارزان' }).first(), 900)
      await at(8.4); await resetCamera(p, 500)
      await at(8.9); await scrollTo(p, { sel: 'h2', text: 'این قیمت منطقی است؟' }, 1200, 140)
      await at(10.3); await zoomOn(p, p.locator('h2', { hasText: 'این قیمت منطقی است؟' }).locator('xpath=..'), 1.3, 800, 60)
      await at(13.8); await resetCamera(p, 500)
      await at(14.3); await drag(p, p.getByRole('slider').first(), 170, 1400)
      await sleep(250); await drag(p, p.getByRole('slider').first(), -90, 1000)
    },
  },

  /* ───────── 6. compare, budget, mobile, dark ───────── */
  {
    name: '6a-compare', section: 6,
    prep: async (p) => { await open(p, '/compare/?ids=ga02C6f8,ga0CgVjP,ga0Gxtt1', 2200) },
    run: async (p, at) => {
      await at(0.3); await glide(p, 1180, 700, 1200)
      await at(1.7); await glide(p, 820, 740, 900)
      await at(3.1); await clickAt(p, p.getByRole('button', { name: /لینک اشتراک/ }).first(), 900)
    },
  },
  {
    name: '6b-budget', section: 6,
    prep: async (p) => { await open(p, '/areas/'); await p.evaluate(() => { const h = [...document.querySelectorAll('h2')].find((e) => e.textContent.includes('با این بودجه کجا')); scrollTo(0, h.getBoundingClientRect().top + scrollY - 90) }); await settle(p, 1200) },
    run: async (p, at) => {
      // explorer sliders in order: deposit, monthly rent, size (the label sits on the slider root, not the thumb)
      await at(0.4); await drag(p, p.getByRole('slider').nth(1), -150, 2300)
      await at(4.3); await drag(p, p.getByRole('slider').nth(2), 110, 1800)
      await at(6.9); await glide(p, 700, 520, 900)
    },
  },
  {
    name: '6c-mobile', section: 6, mobile: true,
    prep: async (p) => { await open(p, `/search/?q=${QS}`, 2400); await p.evaluate(() => { document.getElementById('__cursor')?.remove() }) },
    run: async (p, at) => {
      await at(0.3); await scrollTo(p, 520, 2600)
      await at(3.6); await p.getByRole('button', { name: 'حالت تاریک' }).first().tap()
      await at(4.4); await scrollTo(p, 900, 1500)
    },
  },

  /* ───────── 7. data pipeline + engineering decisions ───────── */
  {
    name: '7a-pipeline', section: 7,
    prep: async (p) => {
      await open(p, '/about/')
      await p.evaluate(() => { const h = [...document.querySelectorAll('h2')].find((e) => e.textContent.includes('پایپ‌لاین داده')); scrollTo(0, h.getBoundingClientRect().top + scrollY - 950) })
      await settle(p, 800)
    },
    run: async (p, at) => {
      await at(0.3); await scrollTo(p, { sel: 'h2', text: 'پایپ‌لاین داده' }, 1500, 60)
      const step = (en) => p.locator('li', { hasText: en }).first()
      await at(4.4); await zoomOn(p, step('Crawl'), 1.35, 900); await glideTo(p, step('Crawl'), 700)
      await at(9.9); await zoomOn(p, step('Normalize'), 1.35, 800); await glideTo(p, step('Normalize'), 600)
      await at(12.0); await zoomOn(p, step('Dedupe'), 1.35, 800); await glideTo(p, step('Dedupe'), 600)
      await at(17.0); await resetCamera(p, 700)
    },
  },
  {
    name: '7b-orbit', section: 7, reload: true,
    prep: async (p) => { await open(p, '/about/') },
    run: async (p, at) => {
      await at(4.3); await zoomOn(p, p.locator('svg[viewBox="0 0 100 100"]').first(), 1.28, 1100)
      await glideTo(p, p.getByText('فهم جمله‌ی فارسی').first(), 1000)
      await at(8.0); await glideTo(p, p.getByText('رتبه‌بندی با دلیل').first(), 1400)
    },
  },
  {
    name: '7c-toogood', section: 7,
    prep: async (p) => {
      await open(p, `/search/?q=${encodeURIComponent('پیروزی قدیمی دوخوابه')}`, 2400)
      const c = card(p, 'با احتیاط')
      await c.scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, -140)); await settle(p, 600)
    },
    run: async (p, at) => {
      const warn = card(p, 'با احتیاط').getByText('با احتیاط', { exact: false }).first()
      await at(0.3); await glideTo(p, warn, 900)
      await at(1.1); await zoomOn(p, warn, 2.0, 1000)
    },
  },

  /* ───────── 8. built with AI ───────── */
  {
    name: '8a-terminal', section: 8, card: 'terminal',
  },
  {
    name: '8b-cheapest', section: 8,
    prep: async (p) => { await open(p, '/search/?sort=cheap', 2400) },
    run: async (p, at) => {
      await at(0.3); await clickAt(p, p.getByRole('button', { name: /مرتب‌سازی/ }).first(), 1000)
      await at(1.9); await glideTo(p, p.getByRole('menuitemradio', { name: /ارزان‌ترین/ }).first(), 700)
      await at(2.9); await p.keyboard.press('Escape')
      await at(3.4); await zoomOn(p, p.locator('article').first().locator('p.font-extrabold').first(), 1.9, 900)
      await glideTo(p, p.locator('article').first().locator('p.font-extrabold').first(), 700)
    },
  },

  /* ───────── 9. limits, next, links ───────── */
  {
    name: '9a-next', section: 9,
    prep: async (p) => {
      await open(p, '/about/')
      await p.evaluate(() => { const el = [...document.querySelectorAll('p')].find((e) => e.textContent.trim() === 'محدودیت‌ها'); scrollTo(0, el.getBoundingClientRect().top + scrollY - 1100) })
      await settle(p, 800)
    },
    run: async (p, at) => {
      await at(0.3); await scrollTo(p, { sel: 'p', text: 'محدودیت‌ها' }, 1500, 260)
      await at(2.2); await glideTo(p, p.getByText('فقط یک منبع', { exact: false }).first(), 900)
      await at(6.5); await zoomOn(p, p.getByText('قدم بعد', { exact: true }).first().locator('xpath=..'), 1.35, 900, 110)
      await glideTo(p, p.getByText('تاریخچه‌ی قیمت', { exact: false }).first(), 900)
    },
  },
  {
    name: '9b-end', section: 9, card: 'end',
  },
]
