import type { HomeCard } from '@/shared/types/home'
import type { Intent } from '@/features/search/lib/intent'
import { RAHN_RATE } from '@/shared/lib/rahn'
import { daysOld, faNum, meters, percent, toman } from '@/shared/lib/format'

export type SortKey = 'best' | 'cheap' | 'deal' | 'new' | 'metro'

export interface Reason {
  tone: 'good' | 'warn' | 'bad' | 'neutral'
  text: string
}

export interface Ranked {
  home: HomeCard
  score: number
  /** 0..1 contributions, used by «چرا این رتبه؟» */
  parts: Record<'budget' | 'deal' | 'metro' | 'features' | 'fresh' | 'trust', number>
  reasons: Reason[]
  overBudget?: number
}

export const WEIGHTS = { budget: 0.3, deal: 0.24, metro: 0.14, features: 0.1, fresh: 0.1, trust: 0.12 }

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const hoodMatch = (h: HomeCard, i: Intent) => (!i.districtIds.length && !i.regions.length) || i.districtIds.includes(h.districtId) || i.regions.some((r) => h.region === r || h.region.includes(r))

/** The user's rent budget expressed as one number (deposit converted at the market rate). */
export function rentCapacity(i: Intent) {
  if (i.maxDeposit === undefined && i.maxRent === undefined) return undefined
  return (i.maxRent ?? 0) + (i.maxDeposit ?? 0) * RAHN_RATE
}

export function filterAndRank(homes: HomeCard[], intent: Intent, sort: SortKey = 'best'): Ranked[] {
  const deal = intent.deal ?? 'rent'
  const cap = rentCapacity(intent)
  const out: Ranked[] = []

  for (const h of homes) {
    // ---------- hard filters ----------
    if (h.deal !== deal) continue
    if (!hoodMatch(h, intent)) continue
    if (intent.rooms !== undefined && (intent.rooms >= 4 ? h.rooms < 4 : h.rooms !== intent.rooms)) continue
    if (intent.minRooms !== undefined && h.rooms < intent.minRooms) continue
    if (intent.minArea !== undefined && h.area < intent.minArea) continue
    if (intent.maxArea !== undefined && h.area > intent.maxArea) continue
    if (intent.must.some((f) => h.features[f] === false)) continue
    if (intent.maxAge !== undefined && (h.age === undefined || h.age > intent.maxAge)) continue
    if (intent.ownerOnly && !h.owner) continue
    if (intent.realPhotos && h.flags.includes('stockPhotos')) continue

    let overBudget: number | undefined
    let budget = 0.6
    if (deal === 'rent' && cap !== undefined) {
      if (h.equivRent === undefined) continue
      const ratio = h.equivRent / cap
      if (ratio > 1.1) continue // 10% tolerance, shown as a caveat
      overBudget = ratio > 1 ? ratio - 1 : undefined
      budget = ratio > 1 ? 1 - (ratio - 1) / 0.1 : 0.75 + 0.25 * clamp((1 - ratio) / 0.4)
    }
    if (deal === 'buy' && intent.maxPrice !== undefined) {
      if (h.price === undefined) continue
      const ratio = h.price / intent.maxPrice
      if (ratio > 1.08) continue
      overBudget = ratio > 1 ? ratio - 1 : undefined
      budget = ratio > 1 ? 1 - (ratio - 1) / 0.08 : 0.75 + 0.25 * clamp((1 - ratio) / 0.4)
    }

    // ---------- soft scores ----------
    // «too good to be true» (>35% under the area median) is often a bait ad: don't reward it with a max deal score
    const tooGood = h.flags.includes('tooGood')
    const dealScore = h.vsAreaMedian === undefined ? 0.45 : tooGood ? 0.55 : clamp(0.5 - h.vsAreaMedian / 0.6)
    const m = h.nearestMetro?.meters
    const metroScore = m === undefined ? 0.3 : clamp(1 - (m - (intent.nearMetro ?? 500)) / 1800)
    const wanted = intent.must.length
    const nice = ['parking', 'elevator', 'storage'] as const
    const featureScore = wanted ? 1 : nice.filter((k) => h.features[k]).length / nice.length
    const fresh = clamp(1 - daysOld(h.postedAt) / 30)
    const trust = (h.flags.includes('negotiable') ? 0.2 : h.flags.includes('stockPhotos') ? 0.55 : 1) * (tooGood ? 0.5 : 1)
    const metroWeight = intent.nearMetro ? WEIGHTS.metro * 2 : WEIGHTS.metro
    const parts = { budget, deal: dealScore, metro: metroScore, features: featureScore, fresh, trust }
    const score =
      budget * WEIGHTS.budget + dealScore * WEIGHTS.deal + metroScore * metroWeight + featureScore * WEIGHTS.features + fresh * WEIGHTS.fresh + trust * WEIGHTS.trust

    if (intent.nearMetro && m !== undefined && m > intent.nearMetro * 2.2) continue // clearly not «near metro»

    out.push({ home: h, score, parts, reasons: explain(h, intent, overBudget), overBudget })
  }

  const by: Record<SortKey, (a: Ranked, b: Ranked) => number> = {
    best: (a, b) => b.score - a.score,
    cheap: (a, b) => (a.home.equivRent ?? a.home.price ?? Infinity) - (b.home.equivRent ?? b.home.price ?? Infinity),
    deal: (a, b) => (a.home.vsAreaMedian ?? 9) - (b.home.vsAreaMedian ?? 9),
    new: (a, b) => b.home.postedAt.localeCompare(a.home.postedAt),
    metro: (a, b) => (a.home.nearestMetro?.meters ?? Infinity) - (b.home.nearestMetro?.meters ?? Infinity),
  }
  return out.sort(by[sort])
}

/** Reasons in display order: the two strongest positives, then every caveat, then the rest. Cards show the first three. */
export function explain(h: HomeCard, intent: Intent, overBudget?: number): Reason[] {
  const good: Reason[] = []
  const warn: Reason[] = []
  if (h.vsAreaMedian !== undefined && h.vsAreaMedian <= -0.07) good.push({ tone: 'good', text: `${percent(h.vsAreaMedian)} زیر میانه‌ی ${h.neighborhood}` })
  if (h.nearestMetro && h.nearestMetro.meters <= (intent.nearMetro ?? 900)) good.push({ tone: 'good', text: `${meters(h.nearestMetro.meters)} تا مترو ${h.nearestMetro.station}` })
  for (const f of intent.must) good.push({ tone: 'good', text: { parking: 'پارکینگ دارد', elevator: 'آسانسور دارد', storage: 'انباری دارد', balcony: 'بالکن دارد', renovated: 'بازسازی‌شده' }[f] })
  if (h.sources > 1) good.push({ tone: 'good', text: `${faNum(h.sources)} آگهی ادغام شد` })
  if (intent.maxAge !== undefined && h.age !== undefined) good.push({ tone: 'good', text: h.age === 0 ? 'کلید نخورده' : `${faNum(h.age)} ساله` })
  if (overBudget) warn.push({ tone: 'warn', text: `${percent(Math.max(0.01, overBudget))} بالاتر از بودجه` })
  if (h.vsAreaMedian !== undefined && h.vsAreaMedian >= 0.15) warn.push({ tone: 'warn', text: `${percent(h.vsAreaMedian)} گران‌تر از میانه‌ی محله` })
  if (h.flags.includes('tooGood')) warn.push({ tone: 'warn', text: 'خیلی ارزان‌تر از محله؛ با احتیاط' })
  if (h.flags.includes('negotiable')) warn.push({ tone: 'neutral', text: 'قیمت توافقی' })
  return [...good.slice(0, 2), ...warn, ...good.slice(2)].slice(0, 4)
}

export function explainBudget(intent: Intent) {
  const cap = rentCapacity(intent)
  if (cap === undefined) return null
  return `بودجه‌ات معادل ${toman(Math.round(cap))} اجاره‌ی ماهانه است (هر ۱۰۰ میلیون رهن ≈ ${toman(100e6 * RAHN_RATE)} اجاره).`
}
