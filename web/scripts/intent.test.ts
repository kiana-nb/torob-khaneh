// Run: npx tsx scripts/intent.test.ts
import assert from 'node:assert/strict'
import { parseQuery, removeSpan } from '../src/features/search/lib/intent'

type Case = [string, (i: ReturnType<typeof parseQuery>['intent']) => void]
const M = 1e6, B = 1e9

const cases: Case[] = [
  ['دوخوابه نزدیک مترو با ۲ میلیارد رهن و ۲۰ میلیون اجاره، پارکینگ داشته باشه', (i) => { assert.equal(i.rooms, 2); assert.equal(i.maxDeposit, 2 * B); assert.equal(i.maxRent, 20 * M); assert.ok(i.nearMetro); assert.deepEqual(i.must, ['parking']); assert.equal(i.deal, 'rent') }],
  ['سعادت‌آباد ۱۰۰ متری نوساز با آسانسور', (i) => { assert.deepEqual(i.districtIds, [75]); assert.equal(i.minArea, 85); assert.equal(i.maxArea, 115); assert.equal(i.maxAge, 5); assert.deepEqual(i.must, ['elevator']) }],
  ['غرب تهران رهن کامل تا ۳ میلیارد', (i) => { assert.deepEqual(i.regions, ['غرب']); assert.equal(i.maxDeposit, 3 * B) }],
  ['خرید آپارتمان در پونک تا ۳۰ میلیارد', (i) => { assert.equal(i.deal, 'buy'); assert.equal(i.maxPrice, 30 * B); assert.deepEqual(i.districtIds, [82]) }],
  ['یک‌خوابه پیاده تا مترو، زیر ۴۰ میلیون اجاره', (i) => { assert.equal(i.rooms, 1); assert.equal(i.nearMetro, 700); assert.equal(i.maxRent, 40 * M) }],
  ['۲ خوابه رهن ۵۰۰ اجاره ۲۰', (i) => { assert.equal(i.rooms, 2); assert.equal(i.maxDeposit, 500 * M); assert.equal(i.maxRent, 20 * M) }],
  ['سه خوابه در یوسف آباد', (i) => { assert.equal(i.rooms, 3); assert.deepEqual(i.districtIds, [90]) }],
  ['ونک یا جردن ماهی ۶۰ تومن', (i) => { assert.deepEqual([...i.districtIds].sort((a, b) => a - b), [86, 315]); assert.equal(i.maxRent, 60 * M) }],
  ['خونه ۸۰ متری بازسازی شده انباری دار', (i) => { assert.equal(i.minArea, 68); assert.ok(i.must.includes('renovated')); assert.ok(i.must.includes('storage')) }],
  ['حداقل ۱۲۰ متر شمال تهران', (i) => { assert.equal(i.minArea, 120); assert.deepEqual(i.regions, ['شمال']) }],
  ['سوئیت نزدیک مترو', (i) => { assert.equal(i.rooms, 0); assert.equal(i.nearMetro, 1000) }],
  ['بدون واسطه، عکس واقعی', (i) => { assert.equal(i.ownerOnly, true); assert.equal(i.realPhotos, true) }],
  ['زیر ۱۰ سال ساخت در ستارخان', (i) => { assert.equal(i.maxAge, 10); assert.deepEqual(i.districtIds, [205]) }],
  ['جنت آباد ودیعه ۱ میلیارد', (i) => { assert.deepEqual(i.districtIds, [146]); assert.equal(i.maxDeposit, 1 * B) }],
  ['برای خرید، بودجه ۲۰ میلیارد، اکباتان', (i) => { assert.equal(i.deal, 'buy'); assert.equal(i.maxPrice, 20 * B); assert.deepEqual(i.districtIds, [167]) }],
  ['تهرانپارس دو خواب', (i) => { assert.deepEqual(i.districtIds, [108]); assert.equal(i.rooms, 2) }],
  ['رهن ۳ میلیارد', (i) => { assert.equal(i.maxDeposit, 3 * B); assert.equal(i.deal, 'rent') }],
  ['آپارتمان نزدیک دانشگاه', (i) => { assert.equal(i.rooms, undefined) }],
  ['گیشا تا ۲۵۰ میلیون اجاره', (i) => { assert.deepEqual(i.districtIds, [88]); assert.equal(i.maxRent, 250 * M) }],
  ['نارمک پارکینگ و آسانسور', (i) => { assert.deepEqual(i.districtIds, [399]); assert.deepEqual(i.must.sort(), ['elevator', 'parking']) }],
]

let pass = 0
for (const [q, check] of cases) {
  const p = parseQuery(q)
  try { check(p.intent); pass++; console.log('✓', q, '→', p.chips.map((c) => c.label).join(' | '), p.leftover ? `  [leftover: ${p.leftover}]` : '') }
  catch (e) { console.log('✗', q, '\n   ', (e as Error).message.split('\n')[0], '\n    intent:', JSON.stringify(p.intent), '\n    chips:', p.chips.map((c) => c.label).join(' | ')) }
}
// chip removal keeps the rest of the sentence
const q = 'دوخوابه نزدیک مترو با ۲ میلیارد رهن'
const p = parseQuery(q)
const metro = p.chips.find((c) => c.key === 'nearMetro')!
const after = removeSpan(q, metro.span)
assert.equal(parseQuery(after).intent.nearMetro, undefined)
assert.equal(parseQuery(after).intent.rooms, 2)
console.log(`\n${pass}/${cases.length} passed · removeSpan ok → «${after}»`)
if (pass !== cases.length) process.exit(1)
