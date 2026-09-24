'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { Info, List, Map as MapIcon, RefreshCw, SearchX, SlidersHorizontal, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import neighborhoods from '@/data/neighborhoods.json'
import { SearchBar } from '@/features/search/components/search-bar'
import { FiltersSheet } from '@/features/search/components/filters-sheet'
import { IntentChips } from '@/features/search/components/intent-chips'
import { parseQuery, removeSpan, type IntentChip } from '@/features/search/lib/intent'
import { mergeIntent, useSearchState, type SearchState } from '@/features/search/lib/url-state'
import { SortMenu } from './sort-menu'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useHomeIndex } from '@/shared/hooks/use-home-index'
import { cn } from '@/shared/lib/cn'
import { faNum, toman } from '@/shared/lib/format'
import { explainBudget, filterAndRank } from '../lib/rank'
import { HomeCard } from './home-card'
import { RankingExplainer } from './ranking-explainer'

const ResultsMap = dynamic(() => import('./results-map'), { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-card" /> })
const PAGE = 24
const FEATURE_LABEL: Record<string, string> = { parking: 'پارکینگ', elevator: 'آسانسور', storage: 'انباری', balcony: 'بالکن', renovated: 'بازسازی‌شده' }

/** Chips for filters set explicitly (not from the sentence). */
function overrideChips(s: SearchState): Array<{ key: string; label: string; patch: Partial<SearchState> }> {
  const out: Array<{ key: string; label: string; patch: Partial<SearchState> }> = []
  if (s.deal) out.push({ key: 'deal', label: s.deal === 'buy' ? 'خرید' : 'رهن و اجاره', patch: { deal: null } })
  if (s.rooms !== null) out.push({ key: 'rooms', label: s.rooms === 0 ? 'استودیو' : `${faNum(s.rooms)} خواب`, patch: { rooms: null } })
  if (s.dep !== null) out.push({ key: 'dep', label: `رهن تا ${toman(s.dep * 1e6, { unit: false })}`, patch: { dep: null } })
  if (s.rent !== null) out.push({ key: 'rent', label: `اجاره تا ${toman(s.rent * 1e6, { unit: false })}`, patch: { rent: null } })
  if (s.price !== null) out.push({ key: 'price', label: `قیمت تا ${toman(s.price * 1e6, { unit: false })}`, patch: { price: null } })
  if (s.metro) out.push({ key: 'metro', label: 'نزدیک مترو', patch: { metro: null } })
  for (const f of s.f ?? []) out.push({ key: `f-${f}`, label: FEATURE_LABEL[f], patch: { f: (s.f ?? []).filter((x) => x !== f) } })
  for (const id of s.hoods ?? []) out.push({ key: `h-${id}`, label: neighborhoods.find((n) => n.id === id)?.name ?? '', patch: { hoods: (s.hoods ?? []).filter((x) => x !== id) } })
  return out
}

export function SearchResults() {
  const [state, setState] = useSearchState()
  const { data, isLoading, isError, refetch } = useHomeIndex()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [explainOpen, setExplainOpen] = useState(false)
  const [limit, setLimit] = useState(PAGE)

  const parsed = useMemo(() => parseQuery(state.q), [state.q])
  const intent = useMemo(() => mergeIntent(parsed.intent, state), [parsed, state])
  const ranked = useMemo(() => (data ? filterAndRank(data, intent, state.sort) : []), [data, intent, state.sort])
  const homes = useMemo(() => ranked.map((r) => r.home), [ranked])
  const mergedCount = useMemo(() => ranked.reduce((s, r) => s + r.home.sources, 0), [ranked])
  const extra = overrideChips(state)
  const budgetNote = explainBudget(intent)
  const deal = intent.deal ?? 'rent'

  const removeChip = (c: IntentChip) => { setState({ q: removeSpan(state.q, c.span) }); setLimit(PAGE) }
  const patch = (p: Partial<SearchState>) => { setState(p); setLimit(PAGE) }
  const activeFilterCount = extra.length

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-4 md:px-6">
      {/* toolbar */}
      <div className="sticky top-16 z-30 -mx-4 space-y-2.5 border-b border-line/60 bg-bg/85 px-4 pb-3 pt-2 backdrop-blur-xl md:-mx-6 md:px-6">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <SearchBar variant="compact" initial={state.q} onSubmit={(q) => patch({ q })} />
          </div>
          <Button onClick={() => setFiltersOpen(true)} className="relative h-12 shrink-0 rounded-[14px] px-3.5" aria-label="فیلترها">
            <SlidersHorizontal className="size-[18px]" />
            <span className="hidden sm:inline">فیلترها</span>
            {activeFilterCount ? <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-brand-ink">{faNum(activeFilterCount)}</span> : null}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <IntentChips chips={parsed.chips} onRemove={removeChip} leftover={parsed.leftover} />
          {extra.map((c) => (
            <span key={c.key} className="inline-flex h-7 items-center gap-1 rounded-full bg-ink ps-2.5 pe-1 text-[12.5px] font-medium text-surface">
              {c.label}
              <button onClick={() => patch(c.patch)} className="grid size-5 place-items-center rounded-full hover:bg-white/15" aria-label={`حذف ${c.label}`}>
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* summary + sort */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[19px] font-extrabold md:text-[21px]">
            {isLoading ? 'در حال جست‌وجو…' : `${faNum(ranked.length)} خانه برای ${deal === 'buy' ? 'خرید' : 'رهن و اجاره'}`}
          </h1>
          {!isLoading && ranked.length ? (
            <p className="mt-1 text-[13px] text-muted">
              از {faNum(mergedCount)} آگهی{mergedCount > ranked.length ? ` · ${faNum(mergedCount - ranked.length)} آگهی تکراری ادغام شد` : ''}
              {budgetNote ? ` · ${budgetNote}` : ''}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setExplainOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink-2 hover:bg-surface-3">
            <Info className="size-4" />
            <span className="sm:hidden">چرا این ترتیب؟</span>
            <span className="hidden sm:inline">چطور رتبه‌بندی می‌کنیم؟</span>
          </button>
          <SortMenu value={state.sort} onChange={(sort) => patch({ sort })} />
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)]">
        {/* list */}
        <section className={cn(state.view === 'map' && 'hidden lg:block')} aria-label="نتایج">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-card bg-surface ring-1 ring-line">
                  <Skeleton className="aspect-[4/3] rounded-none" />
                  <div className="space-y-2 p-3.5"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-3/4" /></div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="grid place-items-center rounded-card bg-surface p-10 text-center ring-1 ring-line">
              <p className="font-bold">داده‌ها بارگذاری نشدند</p>
              <p className="mt-1 text-[13px] text-muted">اتصال را بررسی کن و دوباره امتحان کن.</p>
              <Button className="mt-4" onClick={() => refetch()}><RefreshCw className="size-4" />تلاش دوباره</Button>
            </div>
          ) : !ranked.length ? (
            <EmptyState onReset={() => patch({ q: '', deal: null, rooms: null, dep: null, rent: null, price: null, metro: null, f: null, hoods: null })} chips={parsed.chips} onRemove={removeChip} />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatePresence initial={false}>
                  {ranked.slice(0, limit).map((r, i) => (
                    <HomeCard key={r.home.id} h={r.home} reasons={r.reasons} rank={state.sort === 'best' ? i : undefined} />
                  ))}
                </AnimatePresence>
              </div>
              {ranked.length > limit ? (
                <div className="mt-6 flex justify-center">
                  <Button onClick={() => setLimit((l) => l + PAGE)} size="lg">نمایش {faNum(Math.min(PAGE, ranked.length - limit))} خانه‌ی دیگر</Button>
                </div>
              ) : null}
            </>
          )}
        </section>

        {/* map */}
        <aside className={cn('lg:block', state.view === 'map' ? 'block' : 'hidden')} aria-label="نقشه">
          <div className="sticky top-[184px] h-[calc(100dvh-200px)] min-h-[420px] overflow-hidden rounded-card shadow-e1 ring-1 ring-line max-lg:h-[calc(100dvh-260px)]">
            {data ? <ResultsMap homes={homes} className="h-full w-full" /> : <Skeleton className="h-full w-full rounded-none" />}
          </div>
        </aside>
      </div>

      {/* mobile list/map toggle */}
      <div className="fixed inset-x-0 bottom-[76px] z-30 flex justify-center lg:hidden">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => patch({ view: state.view === 'map' ? 'list' : 'map' })}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-semibold text-surface shadow-e3"
        >
          {state.view === 'map' ? <List className="size-[18px]" /> : <MapIcon className="size-[18px]" />}
          {state.view === 'map' ? 'لیست' : 'نقشه'}
        </motion.button>
      </div>

      <FiltersSheet open={filtersOpen} onOpenChange={setFiltersOpen} intent={intent} base={parsed.intent} onApply={patch} resultCount={ranked.length} />
      <RankingExplainer open={explainOpen} onOpenChange={setExplainOpen} top={state.sort === 'best' ? ranked[0] : undefined} />
    </div>
  )
}

function EmptyState({ onReset, chips, onRemove }: { onReset: () => void; chips: IntentChip[]; onRemove: (c: IntentChip) => void }) {
  return (
    <div className="grid place-items-center rounded-card bg-surface px-6 py-14 text-center ring-1 ring-line">
      <span className="grid size-14 place-items-center rounded-full bg-surface-3 text-muted">
        <SearchX className="size-7" />
      </span>
      <p className="mt-4 text-[16px] font-bold">خانه‌ای با این شرایط پیدا نکردیم</p>
      <p className="mt-1 max-w-sm text-[13px] leading-6 text-muted">یکی از شرط‌ها را بردار یا بودجه را کمی بازتر کن. پیشنهاد: اول سخت‌گیرانه‌ترین شرط را حذف کن.</p>
      {chips.length ? (
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {chips.map((c) => (
            <button key={c.key} onClick={() => onRemove(c)} className="inline-flex h-8 items-center gap-1 rounded-full bg-surface-3 px-3 text-[12.5px] font-medium hover:bg-line">
              <X className="size-3.5" />
              {c.label}
            </button>
          ))}
        </div>
      ) : null}
      <Button className="mt-5" onClick={onReset}>شروع دوباره</Button>
    </div>
  )
}
