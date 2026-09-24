// The whole video's clock, derived from the narration files, so picture and sound always line up.
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.dirname(fileURLToPath(import.meta.url))
export const BUILD = path.join(ROOT, '.build')
export const VOICE = path.join(ROOT, '..', 'voice', 'final')

export const INTRO = 3.0 // title card before the first words
export const LEAD = 0.25 // picture starts this much before each section's narration
export const TAIL = 0.45 // and holds this long after it
export const OUTRO_HOLD = 2.3 // the end card stays up after the last "thank you"

// shots with a fixed length; the last shot of each section takes whatever is left
export const FIXED = { '1a-results': 12.6, '6a-compare': 6.1, '6b-budget': 8.2, '7a-pipeline': 18.0, '7b-orbit': 12.1, '8a-terminal': 11.0, '9a-next': 13.4 }

export const CHAPTERS = {
  1: 'مسئله',
  2: 'داده‌ی واقعی',
  3: 'جست‌وجو با زبان کاربر',
  4: 'اجاره‌ی معادل و رتبه‌بندی',
  5: 'یک خانه، همه‌ی آگهی‌ها',
  6: 'مقایسه، بودجه، موبایل',
  7: 'داده و تصمیم‌های مهندسی',
  8: 'ساخت با AI',
  9: 'قدم بعد',
}

const probe = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString()

export function timeline(shots) {
  const sections = []
  let t = INTRO
  for (let s = 1; s <= 9; s++) {
    const voice = probe(path.join(VOICE, `s${s}.mp3`))
    const len = LEAD + voice + (s === 9 ? OUTRO_HOLD : TAIL)
    const own = shots.filter((x) => x.section === s)
    let used = 0
    const list = own.map((x, i) => {
      const d = i === own.length - 1 ? +(len - used).toFixed(3) : FIXED[x.name]
      if (!d || d <= 0) throw new Error('bad duration for ' + x.name)
      const item = { ...x, start: +(t + used).toFixed(3), dur: d }
      used += d
      return item
    })
    sections.push({ s, start: +t.toFixed(3), voiceStart: +(t + LEAD).toFixed(3), voice, len, shots: list })
    t += len
  }
  return { sections, total: +t.toFixed(3) }
}
