'use client'
import { Columns3, Link2, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import type { HomeCard } from '@/shared/types/home'
import { DealBadge } from '@/features/results/components/home-card'
import { Button, buttonVariants } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useHomeIndex } from '@/shared/hooks/use-home-index'
import { useMounted } from '@/shared/hooks/use-mounted'
import { cn } from '@/shared/lib/cn'
import { faNum, floorLabel, meters, percent, roomsLabel, toman } from '@/shared/lib/format'
import { useShortlist, useUi } from '@/shared/lib/stores'
import { SmartImg } from '@/shared/components/ui/smart-img'

type Row = { label: string; get: (h: HomeCard) => React.ReactNode; best?: (h: HomeCard) => number | undefined; dir?: 'min' | 'max' }

const yes = (v?: boolean) => (v === undefined ? '—' : v ? '✓ دارد' : '✕ ندارد')
const ROWS: Row[] = [
  { label: 'رهن / اجاره', get: (h) => (h.deal === 'rent' ? `${toman(h.deposit, { unit: false, zero: '۰' })} / ${toman(h.rent, { unit: false, zero: '۰' })}` : toman(h.price)) },
  { label: 'اجاره‌ی معادل ماهانه', get: (h) => (h.deal === 'rent' ? toman(h.equivRent) : '—'), best: (h) => h.equivRent, dir: 'min' },
  { label: 'قیمت هر متر (معادل)', get: (h) => toman(h.deal === 'rent' ? h.equivRentPerM2 : h.pricePerM2), best: (h) => (h.deal === 'rent' ? h.equivRentPerM2 : h.pricePerM2), dir: 'min' },
  { label: 'نسبت به محله', get: (h) => (h.vsAreaMedian === undefined ? '—' : <DealBadge v={h.vsAreaMedian} />), best: (h) => h.vsAreaMedian, dir: 'min' },
  { label: 'متراژ', get: (h) => `${faNum(h.area)} متر`, best: (h) => h.area, dir: 'max' },
  { label: 'خواب', get: (h) => roomsLabel(h.rooms) },
  { label: 'سن بنا', get: (h) => (h.age === undefined ? '—' : h.age === 0 ? 'نوساز' : `${faNum(h.age)} سال`), best: (h) => h.age, dir: 'min' },
  { label: 'طبقه', get: (h) => floorLabel(h.floor, h.totalFloors) },
  { label: 'تا مترو', get: (h) => (h.nearestMetro ? `${meters(h.nearestMetro.meters)} · ${h.nearestMetro.station}` : '—'), best: (h) => h.nearestMetro?.meters, dir: 'min' },
  { label: 'پارکینگ', get: (h) => yes(h.features.parking) },
  { label: 'آسانسور', get: (h) => yes(h.features.elevator) },
  { label: 'انباری', get: (h) => yes(h.features.storage) },
  { label: 'تعداد آگهی', get: (h) => faNum(h.sources) },
  { label: 'هشدارها', get: (h) => (h.flags.length ? h.flags.map((f) => ({ negotiable: 'توافقی', stockPhotos: 'عکس نمونه', noPhotos: 'بی‌عکس', tooGood: 'قیمت مشکوک' })[f]).join('، ') : 'ندارد') },
]

export function CompareView() {
  const mounted = useMounted()
  const [shared] = useQueryState('ids', parseAsArrayOf(parseAsString))
  const stored = useShortlist((s) => s.compare)
  const remove = useShortlist((s) => s.removeCompare)
  const clear = useShortlist((s) => s.clearCompare)
  const showToast = useUi((s) => s.showToast)
  const { data, isLoading } = useHomeIndex()
  const homes = useMemo(() => {
    const ids = shared?.length ? shared : mounted ? stored : []
    return data ? ids.map((id) => data.find((h) => h.id === id)).filter((h): h is HomeCard => !!h) : []
  }, [data, shared, stored, mounted])

  const bestOf = (row: Row) => {
    if (!row.best || homes.length < 2) return undefined
    const vals = homes.map(row.best).filter((v): v is number => v !== undefined)
    if (vals.length < 2) return undefined
    return row.dir === 'max' ? Math.max(...vals) : Math.min(...vals)
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/compare/?ids=${homes.map((h) => h.id).join(',')}`); showToast('لینک مقایسه کپی شد') } catch {}
  }

  if (!mounted || isLoading) return <div className="grid gap-3 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div>

  if (!homes.length)
    return (
      <div className="grid place-items-center rounded-[22px] bg-surface px-6 py-16 text-center ring-1 ring-line">
        <span className="grid size-14 place-items-center rounded-full bg-surface-3 text-muted"><Columns3 className="size-7" /></span>
        <p className="mt-4 text-[17px] font-bold">هنوز خانه‌ای برای مقایسه انتخاب نکرده‌ای</p>
        <p className="mt-1 max-w-sm text-[13.5px] leading-7 text-muted">روی آیکون <Columns3 className="inline size-4" /> کارت‌ها بزن تا حداکثر ۴ خانه را کنار هم ببینی.</p>
        <Link href="/search/" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'mt-5')}>برو به جست‌وجو</Link>
      </div>
    )

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13.5px] text-muted">{shared?.length ? 'این مقایسه با لینک برایت فرستاده شده.' : `${faNum(homes.length)} از ۴ خانه`}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={copy}><Link2 className="size-4" />لینک اشتراک</Button>
          {!shared?.length ? <Button size="sm" variant="ghost" onClick={clear}><Trash2 className="size-4" />پاک کردن</Button> : null}
        </div>
      </div>
      <div className="no-scrollbar overflow-x-auto rounded-[22px] bg-surface shadow-e1 ring-1 ring-line">
        <table className="w-full min-w-[640px] table-fixed border-collapse text-[13.5px]">
          <thead>
            <tr>
              <th className="sticky start-0 z-10 w-32 bg-surface p-3 md:w-40" />
              {homes.map((h) => (
                <th key={h.id} className="p-3 align-top font-normal">
                  <div className="relative">
                    <Link href={`/home/${h.id}/`} className="block overflow-hidden rounded-[14px]">
                      <div className="aspect-[4/3]">{h.cover ? <SmartImg src={h.cover} /> : <div className="h-full bg-surface-3" />}</div>
                    </Link>
                    {!shared?.length ? (
                      <button onClick={() => remove(h.id)} className="absolute end-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-zinc-800 shadow-e1" aria-label="حذف از مقایسه"><X className="size-4" /></button>
                    ) : null}
                  </div>
                  <Link href={`/home/${h.id}/`} className="mt-2 block text-start text-[14px] font-bold hover:underline">
                    {roomsLabel(h.rooms)} {faNum(h.area)} متری · {h.neighborhood}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const best = bestOf(row)
              return (
                <tr key={row.label} className="border-t border-line">
                  <th scope="row" className="sticky start-0 z-10 bg-surface p-3 text-start text-[12.5px] font-medium text-muted">{row.label}</th>
                  {homes.map((h) => {
                    const v = row.best?.(h)
                    const isBest = best !== undefined && v === best
                    return (
                      <td key={h.id} className={cn('p-3 font-semibold tabular', isBest && 'text-good')}>
                        <span className={cn(isBest && 'rounded-[8px] bg-good-soft px-1.5 py-0.5')}>{row.get(h)}</span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {homes.length ? <p className="mt-3 text-[12px] text-muted">سبز = بهترین مقدار در هر ردیف. {homes[0].deal === 'rent' ? `اجاره‌ی معادل با تبدیل ${percent(0.03)} ماهانه‌ی رهن محاسبه شده.` : ''}</p> : null}
    </div>
  )
}
