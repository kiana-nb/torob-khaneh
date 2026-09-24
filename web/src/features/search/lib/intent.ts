import neighborhoods from '@/data/neighborhoods.json'
import type { Deal, Features } from '@/shared/types/home'
import { faNum, toman } from '@/shared/lib/format'

export type FeatureKey = keyof Features

export interface Intent {
  deal?: Deal
  rooms?: number
  minRooms?: number
  maxDeposit?: number
  maxRent?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  districtIds: number[]
  regions: string[]
  nearMetro?: number
  must: FeatureKey[]
  maxAge?: number
  ownerOnly?: boolean
  realPhotos?: boolean
}

export interface IntentChip {
  key: string
  label: string
  /** [start, end) of the matched phrase in the original query — removing the chip removes this phrase */
  span: [number, number]
}

export interface ParsedQuery {
  intent: Intent
  chips: IntentChip[]
  leftover: string
}

// Persian → Latin digits (1:1 characters, so spans stay valid on the original string)
const FA = '۰۱۲۳۴۵۶۷۸۹', AR = '٠١٢٣٤٥٦٧٨٩'
const digits = (s: string) => s.replace(/[۰-۹]/g, (d) => String(FA.indexOf(d))).replace(/[٠-٩]/g, (d) => String(AR.indexOf(d))).replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
const squash = (s: string) => s.replace(/[\s‌‏‎-]/g, '')

const WORDS: Record<string, number> = { یک: 1, دو: 2, سه: 3, چهار: 4, پنج: 5 }
const NUM = String.raw`(\d+(?:[.,٫/]\d+)?|یک|دو|سه|چهار|پنج|ده|صد)`
const UNIT = String.raw`(میلیارد|میلیون|تومن|تومان|م(?![؀-ۿ])|ت(?![؀-ۿ]))?`
const MAX = String.raw`(?:تا|زیر|حداکثر|نهایتا|نهایتاً|کمتر از|بودجه(?:‌ی|ی)?|با)?`

const toNumber = (raw: string) => {
  if (raw in WORDS) return WORDS[raw]
  if (raw === 'ده') return 10
  if (raw === 'صد') return 100
  return Number(raw.replace(/[,٫/]/g, '.'))
}
function toToman(n: number, unit: string | undefined, kind: 'deposit' | 'rent' | 'price') {
  if (unit === 'میلیارد') return n * 1e9
  if (unit === 'میلیون' || unit === 'م') return n * 1e6
  if (unit === 'تومن' || unit === 'تومان' || unit === 'ت') return n >= 1e5 ? n : n * 1e6
  if (kind === 'deposit') return n < 30 ? n * 1e9 : n * 1e6
  if (kind === 'price') return n < 500 ? n * 1e9 : n * 1e6
  return n * 1e6 // rent
}

interface HoodEntry { id: number; key: string; name: string }
const ALIASES: Array<[string, number]> = [
  ['سعادتاباد', 75], ['پونک', 82], ['جنتاباد', 146], ['شهران', 151], ['تهرانپارس', 108], ['یوسفاباد', 90], ['امیراباد', 91],
  ['ونک', 315], ['گیشا', 88], ['کوینصر', 88], ['جردن', 86], ['تجریش', 61], ['پاسداران', 67], ['نارمک', 399], ['ستارخان', 205],
  ['اکباتان', 167], ['پیروزی', 292], ['نازیاباد', 252], ['صادقیه', 172], ['مرزداران', 139], ['ظفر', 72],
]
const HOODS: HoodEntry[] = [
  ...neighborhoods.map((n) => ({ id: n.id, key: squash(n.name).replace(/آ/g, 'ا'), name: n.name })),
  ...ALIASES.map(([key, id]) => ({ id, key, name: neighborhoods.find((n) => n.id === id)?.name ?? key })),
].sort((a, b) => b.key.length - a.key.length)

const REGIONS: Array<[RegExp, string]> = [
  [/شمال\s*غرب/, 'شمال‌غرب'], [/شمال\s*شرق/, 'شمال‌شرق'], [/شمال(?:\s*(?:شهر|تهران))?/, 'شمال'], [/غرب(?:\s*(?:شهر|تهران))?/, 'غرب'],
  [/شرق(?:\s*(?:شهر|تهران))?/, 'شرق'], [/مرکز(?:\s*(?:شهر|تهران))?/, 'مرکز'], [/جنوب(?:\s*(?:شهر|تهران))?/, 'جنوب'],
]

const FEATURES: Array<[RegExp, FeatureKey, string]> = [
  [/پارکینگ(?:\s*(?:داشته\s*باشه|دار|میخوام|می‌خوام|لازم))?/, 'parking', 'پارکینگ'],
  [/آسانسور(?:\s*(?:داشته\s*باشه|دار))?/, 'elevator', 'آسانسور'],
  [/انباری(?:\s*(?:داشته\s*باشه|دار))?/, 'storage', 'انباری'],
  [/(?:بالکن|تراس)(?:\s*(?:داشته\s*باشه|دار))?/, 'balcony', 'بالکن'],
  [/بازسازی(?:\s*شده)?/, 'renovated', 'بازسازی‌شده'],
]

export function parseQuery(query: string): ParsedQuery {
  const q = digits(query)
  const chips: IntentChip[] = []
  const intent: Intent = { districtIds: [], regions: [], must: [] }
  const taken: Array<[number, number]> = []
  const free = (a: number, b: number) => !taken.some(([x, y]) => a < y && b > x)
  const take = (re: RegExp, fn: (m: RegExpExecArray) => IntentChip | null | void) => {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
    let m: RegExpExecArray | null
    while ((m = g.exec(q))) {
      const span: [number, number] = [m.index, m.index + m[0].length]
      if (!m[0].trim() || !free(...span)) continue
      const chip = fn(m)
      if (chip) {
        chip.span = span
        chips.push(chip)
        taken.push(span)
      }
    }
  }

  // deal
  if (/خرید|بخرم|خریدار|فروشی|فروش|قیمت\s*کل|سرمایه\s*گذاری/.test(q)) intent.deal = 'buy'
  if (/اجاره|رهن|ودیعه|مستاجر|پیش\s*پرداخت/.test(q)) intent.deal = intent.deal === 'buy' ? 'buy' : 'rent'
  take(/(?:برای\s*)?(?:خرید|بخرم|فروشی|خریدار)/, () => ({ key: 'deal', label: 'خرید', span: [0, 0] }))

  // money (context word before the number)
  take(new RegExp(String.raw`(?:رهن|ودیعه|پیش(?:\s*پرداخت)?)\s*(?:کامل\s*)?${MAX}\s*${NUM}\s*${UNIT}`), (m) => {
    const v = toToman(toNumber(m[1]), m[2], 'deposit'); intent.maxDeposit = v; intent.deal ??= 'rent'
    return { key: 'maxDeposit', label: `رهن تا ${toman(v, { unit: false })}`, span: [0, 0] }
  })
  take(new RegExp(String.raw`(?:اجاره|ماهی|ماهانه|ماهیانه|کرایه)\s*${MAX}\s*${NUM}\s*${UNIT}`), (m) => {
    const v = toToman(toNumber(m[1]), m[2], 'rent'); intent.maxRent = v; intent.deal ??= 'rent'
    return { key: 'maxRent', label: `اجاره تا ${toman(v, { unit: false })}`, span: [0, 0] }
  })
  // number before the context word: «۴۰۰ رهن»، «تا ۱۵ اجاره»
  take(new RegExp(String.raw`${MAX}\s*${NUM}\s*${UNIT}\s*(رهن|ودیعه|اجاره|ماهی)`), (m) => {
    const isDeposit = /رهن|ودیعه/.test(m[3])
    const v = toToman(toNumber(m[1]), m[2], isDeposit ? 'deposit' : 'rent'); intent.deal ??= 'rent'
    if (isDeposit) { intent.maxDeposit = v; return { key: 'maxDeposit', label: `رهن تا ${toman(v, { unit: false })}`, span: [0, 0] } }
    intent.maxRent = v; return { key: 'maxRent', label: `اجاره تا ${toman(v, { unit: false })}`, span: [0, 0] }
  })
  // total price (buy)
  take(new RegExp(String.raw`(?:تا|زیر|حداکثر|بودجه(?:‌ی|ی)?|قیمت(?:\s*کل)?(?:\s*تا)?)\s*${NUM}\s*(میلیارد|میلیون)`), (m) => {
    if (intent.deal === 'rent') return null
    const v = toToman(toNumber(m[1]), m[2], 'price'); intent.maxPrice = v; intent.deal = 'buy'
    return { key: 'maxPrice', label: `قیمت تا ${toman(v, { unit: false })}`, span: [0, 0] }
  })

  // rooms
  take(/(\d|یک|دو|سه|چهار|پنج)\s*[‌ ]?(?:خواب(?:ه)?|اتاق(?:ه)?(?:\s*خواب)?)/, (m) => {
    const r = toNumber(m[1]); intent.rooms = r
    return { key: 'rooms', label: `${['', 'یک', 'دو', 'سه', 'چهار', 'پنج'][r] ?? faNum(r)}‌خوابه`, span: [0, 0] }
  })
  take(/(?:حداقل|بیشتر\s*از|بالای)\s*(\d|دو|سه|چهار)\s*خواب/, (m) => {
    const r = toNumber(m[1]); intent.minRooms = r; intent.rooms = undefined
    return { key: 'minRooms', label: `حداقل ${faNum(r)} خواب`, span: [0, 0] }
  })
  take(/سوئیت|سوییت|استودیو|بدون\s*اتاق/, () => { intent.rooms = 0; return { key: 'rooms', label: 'بدون اتاق / استودیو', span: [0, 0] } })

  // area
  take(/(?:(حداقل|بالای|بیشتر\s*از|بزرگتر\s*از)|(زیر|کمتر\s*از|حداکثر|تا))?\s*(\d{2,4})\s*متر(?:ی)?/, (m) => {
    const a = Number(m[3])
    if (m[1]) { intent.minArea = a; return { key: 'minArea', label: `حداقل ${faNum(a)} متر`, span: [0, 0] } }
    if (m[2]) { intent.maxArea = a; return { key: 'maxArea', label: `تا ${faNum(a)} متر`, span: [0, 0] } }
    intent.minArea = Math.round(a * 0.85); intent.maxArea = Math.round(a * 1.15)
    return { key: 'area', label: `حدود ${faNum(a)} متر`, span: [0, 0] }
  })

  // metro
  take(/(پیاده\s*(?:تا|به)?|نزدیک(?:\s*به)?|نزدیکی|کنار|دم|دسترسی\s*(?:به|خوب\s*به)?)?\s*(?:ایستگاه\s*)?مترو/, (m) => {
    intent.nearMetro = m[1] && /پیاده|کنار|دم/.test(m[1]) ? 700 : 1000
    return { key: 'nearMetro', label: intent.nearMetro === 700 ? 'پیاده تا مترو' : 'نزدیک مترو', span: [0, 0] }
  })

  // age
  take(/کلید\s*نخورده|نوساز|تازه\s*ساز/, () => { intent.maxAge = 5; return { key: 'maxAge', label: 'نوساز (تا ۵ سال)', span: [0, 0] } })
  take(/(?:زیر|کمتر\s*از|حداکثر)\s*(\d{1,2})\s*سال(?:\s*ساخت)?/, (m) => { intent.maxAge = Number(m[1]); return { key: 'maxAge', label: `ساخت زیر ${faNum(Number(m[1]))} سال`, span: [0, 0] } })

  // features
  for (const [re, key, label] of FEATURES) take(re, () => { if (!intent.must.includes(key)) intent.must.push(key); return { key: `f:${key}`, label, span: [0, 0] } })

  // trust
  take(/بدون\s*واسطه|از\s*مالک|فقط\s*مالک|مالک\s*باشه/, () => { intent.ownerOnly = true; return { key: 'ownerOnly', label: 'فقط مالک', span: [0, 0] } })
  take(/عکس\s*(?:های\s*)?واقعی/, () => { intent.realPhotos = true; return { key: 'realPhotos', label: 'عکس واقعی', span: [0, 0] } })

  // neighborhoods (longest names first), then regions
  const squashed = squash(q).replace(/آ/g, 'ا')
  for (const h of HOODS) {
    if (intent.districtIds.includes(h.id) || !squashed.includes(h.key)) continue
    // locate the phrase in the original string: allow optional spaces/ZWNJ between letters
    const pattern = h.key.split('').map((c) => (c === 'ا' ? '[اآ]' : c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('[\\s\\u200c]*')
    take(new RegExp(`(?:محله(?:‌ی|ی)?\\s*)?${pattern}`), () => { intent.districtIds.push(h.id); return { key: `d:${h.id}`, label: h.name, span: [0, 0] } })
  }
  for (const [re, region] of REGIONS) take(re, () => { if (!intent.regions.includes(region)) intent.regions.push(region); return { key: `r:${region}`, label: `${region} تهران`, span: [0, 0] } })

  if (intent.deal === 'buy' && !chips.some((c) => c.key === 'deal')) chips.unshift({ key: 'deal', label: 'خرید', span: [0, 0] })
  chips.sort((a, b) => a.span[0] - b.span[0])

  // leftover words that were not understood (ignoring filler words)
  const FILLER = /^(و|با|به|در|که|یه|یک|یا|رو|را|تو|توی|برای|میخوام|می‌خوام|خونه|خانه|آپارتمان|اپارتمان|واحد|داشته|باشه|باشد|حدود|تهران|محله|منطقه|ترجیحا|ترجیحاً|لطفا|ولی|هم|نه|خوب|خوبی|ایستگاه|سال|تومن|تومان|اجاره|رهن|،|,)$/
  let leftover = ''
  let last = 0
  for (const [a, b] of [...taken].sort((x, y) => x[0] - y[0])) { leftover += ' ' + query.slice(last, a); last = b }
  leftover += ' ' + query.slice(last)
  leftover = leftover.split(/[\s،,.]+/).filter((w) => w && !FILLER.test(w)).join(' ')

  return { intent, chips, leftover }
}

/** Remove a chip's phrase from the query text (keeps the rest untouched). */
export function removeSpan(query: string, span: [number, number]) {
  return (query.slice(0, span[0]) + ' ' + query.slice(span[1])).replace(/\s{2,}/g, ' ').replace(/^[\s،,و]+|[\s،,و]+$/g, '').trim()
}

export const EXAMPLE_QUERIES = [
  'دوخوابه نزدیک مترو با ۲ میلیارد رهن و ۲۰ میلیون اجاره، پارکینگ داشته باشه',
  'سعادت‌آباد ۱۰۰ متری نوساز با آسانسور',
  'غرب تهران رهن کامل تا ۳ میلیارد',
  'خرید آپارتمان در پونک تا ۳۰ میلیارد',
  'یک‌خوابه پیاده تا مترو، زیر ۴۰ میلیون اجاره',
]
