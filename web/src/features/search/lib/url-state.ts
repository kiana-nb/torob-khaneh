'use client'
import { parseAsArrayOf, parseAsBoolean, parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import type { FeatureKey, Intent } from './intent'
import type { SortKey } from '@/features/results/lib/rank'

const FEATURE_KEYS = ['parking', 'elevator', 'storage', 'balcony', 'renovated'] as const
export const SORTS = ['best', 'cheap', 'deal', 'new', 'metro'] as const

export const searchParsers = {
  q: parseAsString.withDefault(''),
  deal: parseAsStringLiteral(['rent', 'buy'] as const),
  rooms: parseAsInteger,
  dep: parseAsInteger, // million toman
  rent: parseAsInteger, // million toman
  price: parseAsInteger, // million toman
  metro: parseAsBoolean,
  f: parseAsArrayOf(parseAsStringLiteral(FEATURE_KEYS)),
  hoods: parseAsArrayOf(parseAsInteger),
  sort: parseAsStringLiteral(SORTS).withDefault('best'),
  view: parseAsStringLiteral(['list', 'map'] as const).withDefault('list'),
}

export const useSearchState = () => useQueryStates(searchParsers, { history: 'replace', scroll: false })

export type SearchState = ReturnType<typeof useSearchState>[0]

/** Explicit filters (URL) override what was parsed from the sentence. */
export function mergeIntent(parsed: Intent, s: SearchState): Intent {
  return {
    ...parsed,
    deal: s.deal ?? parsed.deal,
    rooms: s.rooms ?? parsed.rooms,
    maxDeposit: s.dep !== null ? s.dep * 1e6 : parsed.maxDeposit,
    maxRent: s.rent !== null ? s.rent * 1e6 : parsed.maxRent,
    maxPrice: s.price !== null ? s.price * 1e6 : parsed.maxPrice,
    nearMetro: s.metro ? 900 : parsed.nearMetro,
    must: [...new Set([...(parsed.must as FeatureKey[]), ...((s.f ?? []) as FeatureKey[])])],
    districtIds: s.hoods?.length ? [...new Set([...parsed.districtIds, ...s.hoods])] : parsed.districtIds,
  }
}

export const sortLabels: Record<SortKey, string> = {
  best: 'بهترین برای تو',
  cheap: 'ارزان‌ترین',
  deal: 'بیشترین تخفیف نسبت به محله',
  new: 'تازه‌ترین',
  metro: 'نزدیک‌ترین به مترو',
}
