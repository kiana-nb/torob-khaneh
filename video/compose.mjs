// Final assembly: shots → one picture track, subtitles/chapters on top, narration at exact times,
// optional music ducked under the voice, loudness-normalised, H.264/AAC MP4.
//   node compose.mjs                  → video/out/torob-khaneh-demo.mp4
//   node compose.mjs --music a.mp3    → with a soft background track
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { launch } from './lib/capture.mjs'
import { buildOverlay } from './overlay.mjs'
import { shots } from './scenes.mjs'
import { BUILD, ROOT, VOICE, timeline } from './timeline.mjs'

const args = process.argv.slice(2)
const music = args.includes('--music') ? path.resolve(args[args.indexOf('--music') + 1]) : null
const OUTDIR = path.join(ROOT, 'out')
fs.mkdirSync(OUTDIR, { recursive: true })
const ff = (a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit' })
const S = (n) => path.join(BUILD, 'shots', n + '.mp4')

const { sections, total } = timeline(shots)

/* 1. phone frame around the mobile shot */
async function phoneShot() {
  const bg = path.join(BUILD, 'phone-bg.png')
  const frame = path.join(BUILD, 'phone-frame.png')
  const b = await launch()
  const page = await (await b.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 })).newPage()
  const url = pathToFileURL(path.join(ROOT, 'cards', 'phone.html')).href
  await page.goto(url); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300)
  await page.screenshot({ path: bg })
  await page.goto(url + '?frame'); await page.waitForTimeout(200)
  await page.screenshot({ path: frame, omitBackground: true })
  await b.close()
  const out = path.join(BUILD, 'shots', '6c-mobile-framed.mp4')
  const dur = sections.find((s) => s.s === 6).shots.find((x) => x.name === '6c-mobile').dur
  ff(['-loop', '1', '-t', String(dur), '-i', bg, '-i', S('6c-mobile'), '-loop', '1', '-t', String(dur), '-i', frame,
    '-filter_complex', '[1:v]scale=404:874:flags=lanczos[m];[0:v][m]overlay=560:103[a];[a][2:v]overlay=0:0,fps=30,format=yuv420p[v]',
    '-map', '[v]', '-t', String(dur), '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', out])
  return out
}

/* 2. picture: all shots in order */
function pictureTrack(mobile) {
  const order = ['0-intro', ...sections.flatMap((s) => s.shots.map((x) => x.name))]
  const list = order.map((n) => `file '${(n === '6c-mobile' ? mobile : S(n)).replace(/\\/g, '/')}'`).join('\n')
  const listFile = path.join(BUILD, 'picture.txt')
  fs.writeFileSync(listFile, list)
  const out = path.join(BUILD, 'picture.mp4')
  // re-encode so every cut lands on a frame boundary; a short fade in from black / out at the end
  ff(['-f', 'concat', '-safe', '0', '-i', listFile, '-vf', `fps=30,format=yuv420p,fade=t=in:st=0:d=0.5`, '-t', total.toFixed(3), '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', out])
  return out
}

/* 3. sound: narration at exact times (+ optional ducked music) */
function soundTrack() {
  const inputs = sections.flatMap((s) => ['-i', path.join(VOICE, `s${s.s}.mp3`)])
  const delays = sections.map((s, i) => `[${i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(s.voiceStart * 1000)}|${Math.round(s.voiceStart * 1000)}[v${i}]`)
  let graph = delays.join(';') + ';' + sections.map((_, i) => `[v${i}]`).join('') + `amix=inputs=${sections.length}:normalize=0,apad=whole_dur=${total.toFixed(3)}[voice]`
  const extra = []
  if (music) {
    extra.push('-i', music)
    const m = sections.length
    // every track is first levelled to −30 LUFS (≈14 dB under the voice), padded if it is shorter than
    // the video, then ducked a further ~6 dB whenever someone is talking
    graph += `;[${m}:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-30:TP=-8:LRA=11,apad,atrim=0:${total.toFixed(3)},afade=t=in:d=1.5,afade=t=out:st=${(total - 3).toFixed(2)}:d=3[bed]`
    graph += `;[voice]asplit=2[vk][vm];[bed][vk]sidechaincompress=threshold=0.02:ratio=6:attack=40:release=600[duck];[vm][duck]amix=inputs=2:normalize=0[mix]`
  }
  const last = music ? '[mix]' : '[voice]'
  const raw = path.join(BUILD, 'sound-raw.wav')
  ff([...inputs, ...extra, '-filter_complex', graph, '-map', last, '-t', total.toFixed(3), '-ar', '48000', raw])
  // two-pass loudness normalisation to −16 LUFS (web/social standard), true peak ≤ −1.5 dB
  const TARGET = 'I=-16:TP=-1.5:LRA=11'
  const probe = spawnSync('ffmpeg', ['-hide_banner', '-i', raw, '-af', `loudnorm=${TARGET}:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' }).stderr
  const m = JSON.parse(probe.slice(probe.lastIndexOf('{'), probe.lastIndexOf('}') + 1))
  const out = path.join(BUILD, 'sound.wav')
  ff(['-i', raw, '-af', `loudnorm=${TARGET}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`, '-ar', '48000', out])
  return out
}

// --reuse: keep the last picture + overlay renders and only redo the sound (e.g. to try another track)
const reuse = args.includes('--reuse') && fs.existsSync(path.join(BUILD, 'picture.mp4')) && fs.existsSync(path.join(BUILD, 'overlay.mov'))
let picture = path.join(BUILD, 'picture.mp4')
let ov = { video: path.join(BUILD, 'overlay.mov') }
if (!reuse) {
  const mobile = await phoneShot()
  console.log('✓ phone shot')
  picture = pictureTrack(mobile)
  console.log('✓ picture', total.toFixed(1) + 's')
  ov = await buildOverlay()
  console.log('✓ overlay', ov.images, 'images,', ov.subs.length, 'subtitles')
}
const sound = soundTrack()
console.log('✓ sound')
const final = path.join(OUTDIR, `torob-khaneh-demo${music ? '-' + path.basename(music, path.extname(music)) : ''}.mp4`)
// the finished picture (screen + subtitles) is encoded once; every sound variant is just muxed onto it
const graded = path.join(BUILD, 'video-final.mp4')
if (!reuse || !fs.existsSync(graded)) {
  // frames come from screenshots (full-range JPEG/PNG): convert to limited-range BT.709 and tag it, or Chrome shows the video too bright
  ff(['-i', picture, '-i', ov.video,
    '-filter_complex', '[0:v][1:v]overlay=0:0:format=auto,scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p[v]',
    '-map', '[v]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-t', total.toFixed(3), graded])
  console.log('✓ picture + subtitles encoded')
}
ff(['-i', graded, '-i', sound, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', total.toFixed(3), final])
const mb = fs.statSync(final).size / 1048576
console.log(`✓ ${final}  ${total.toFixed(1)}s  ${mb.toFixed(1)} MB`)
