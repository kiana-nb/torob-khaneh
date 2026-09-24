// node record.mjs            → every shot
// node record.mjs 3a 7b      → only shots whose name starts with these prefixes
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { clock, launch, newPage, record, sleep } from './lib/capture.mjs'
import { shots } from './scenes.mjs'
import { BUILD, INTRO, ROOT, timeline } from './timeline.mjs'

const only = process.argv.slice(2)
const { sections } = timeline(shots)
const plan = [{ name: '0-intro', card: 'intro', dur: INTRO }, ...sections.flatMap((s) => s.shots)]
const todo = plan.filter((x) => !only.length || only.some((o) => x.name.startsWith(o)))
fs.mkdirSync(path.join(BUILD, 'shots'), { recursive: true })

const browser = await launch()
for (const shot of todo) {
  const out = path.join(BUILD, 'shots', shot.name + '.mp4')
  const page = await newPage(browser, { mobile: !!shot.mobile })
  const t = Date.now()
  try {
    if (shot.card) {
      await page.goto(pathToFileURL(path.join(ROOT, 'cards', shot.card + '.html')).href + '?paused')
      await page.evaluate(() => document.getElementById('__cursor')?.remove())
      await sleep(400)
      const stop = await record(page, out)
      await page.evaluate(() => window.play?.())
      await sleep(shot.dur * 1000 + 100)
      console.log(shot.name, await stop(shot.dur))
    } else {
      await shot.prep(page)
      const stop = await record(page, out, { mobile: !!shot.mobile })
      let skip = 0
      if (shot.reload) { const r0 = Date.now(); await page.reload({ waitUntil: 'domcontentloaded' }); skip = (Date.now() - r0) / 1000 + 0.12 }
      const at = clock()
      await shot.run(page, at)
      const late = at.now() - shot.dur
      await at(shot.dur)
      const res = await stop(shot.dur, { skip })
      console.log(shot.name, res, late > 0.3 ? `⚠ choreography ran ${late.toFixed(2)}s over` : '')
    }
  } catch (e) {
    console.error('✗', shot.name, e.message.split('\n')[0])
  }
  await page.context().close()
  console.log(`  (${((Date.now() - t) / 1000).toFixed(1)}s)`)
}
await browser.close()
