'use client'
import { motion } from 'framer-motion'
import { AlertTriangle, Bookmark, Building2, Check, Columns3, ImageOff, Layers, TrainFront } from 'lucide-react'
import Link from 'next/link'
import { memo, useRef, useState, type MouseEvent } from 'react'
import type { HomeCard as HomeCardT } from '@/shared/types/home'
import type { Reason } from '../lib/rank'
import { Badge } from '@/shared/components/ui/badge'
import { SmartImg } from '@/shared/components/ui/smart-img'
import { cn } from '@/shared/lib/cn'
import { faNum, floorLabel, meters, percent, roomsLabel, toman } from '@/shared/lib/format'
import { useShortlist, useUi } from '@/shared/lib/stores'
import { useMounted } from '@/shared/hooks/use-mounted'

export function DealBadge({ v, className }: { v?: number; className?: string }) {
  if (v === undefined) return null
  // same thresholds as the price analysis on the home page: |Δ| < 7% = in line with the area
  if (v <= -0.07) return <Badge tone="good" className={className}>{percent(v)} زیر قیمت محله</Badge>
  if (v >= 0.07) return <Badge tone={v >= 0.15 ? 'warn' : 'neutral'} className={className}>{percent(v)} بالاتر از محله</Badge>
  return <Badge tone="neutral" className={className}>هم‌قیمت محله</Badge>
}

export function PriceLine({ h, big }: { h: Pick<HomeCardT, 'deal' | 'deposit' | 'rent' | 'equivRent' | 'price' | 'pricePerM2' | 'negotiable'>; big?: boolean }) {
  if (h.negotiable) return <p className={cn('font-bold', big ? 'text-xl' : 'text-[17px]')}>قیمت توافقی</p>
  if (h.deal === 'buy')
    return (
      <div>
        <p className={cn('font-extrabold tabular tracking-tight', big ? 'text-2xl' : 'text-[18px]')}>{toman(h.price)}</p>
        <p className="text-[12.5px] text-muted">متری {toman(h.pricePerM2)}</p>
      </div>
    )
  return (
    <div className="min-w-0">
      {big ? <p className="text-[12.5px] font-medium text-muted">اجاره‌ی معادل ماهانه</p> : null}
      <p className={cn('font-extrabold tabular', big ? 'text-[26px] leading-tight' : 'text-[18px]')}>
        {/* a real space: without it Chrome joins «ن» of «میلیون» to «تومان» across the element boundary */}
        {toman(h.equivRent, { unit: false })}{' '}
        <span className={cn('font-medium text-muted', big ? 'text-[14px]' : 'text-[12.5px]')}>{big ? 'تومان' : 'تومان در ماه (معادل)'}</span>
      </p>
      <p className={cn('truncate text-muted', big ? 'mt-0.5 text-[13.5px]' : 'text-[12.5px]')}>
        {h.deposit ? <>رهن <span className="font-semibold text-ink-2">{toman(h.deposit, { unit: false })}</span></> : 'بدون رهن'}
        <span className="mx-1 text-line-strong">·</span>
        {h.rent && h.rent >= 1e5 ? <>اجاره <span className="font-semibold text-ink-2">{toman(h.rent, { unit: false })}</span></> : h.rent ? 'اجاره‌ی نمادین' : 'رهن کامل'}
      </p>
    </div>
  )
}

function Photos({ h }: { h: HomeCardT }) {
  const [i, setI] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const photos = h.cover ? [h.cover, ...h.thumbs.slice(1)] : h.thumbs
  const onScroll = () => {
    const el = ref.current
    if (!el) return
    setI(Math.round(Math.abs(el.scrollLeft) / el.clientWidth))
  }
  if (!photos.length)
    return (
      <div className="grid aspect-[4/3] place-items-center bg-surface-3 text-muted">
        <ImageOff className="size-8" />
      </div>
    )
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-surface-3">
      <div ref={ref} onScroll={onScroll} className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto">
        {photos.map((src, idx) => (
          <SmartImg key={src} src={src} alt={idx === 0 ? h.title : ''} loading="lazy" wrapperClassName="shrink-0 snap-center" className="transition-[opacity,transform] duration-500 group-hover:scale-[1.03]" />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
      {photos.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1">
          {photos.map((_, idx) => (
            <span key={idx} className={cn('h-1.5 rounded-full bg-white/60 transition-all', idx === i ? 'w-4 bg-white' : 'w-1.5')} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

interface Props {
  h: HomeCardT
  reasons?: Reason[]
  rank?: number
  compact?: boolean
}

export const HomeCard = memo(function HomeCard({ h, reasons, rank }: Props) {
  const mounted = useMounted()
  const saved = useShortlist((s) => s.saved.includes(h.id)) && mounted
  const inCompare = useShortlist((s) => s.compare.includes(h.id)) && mounted
  const toggleSaved = useShortlist((s) => s.toggleSaved)
  const toggleCompare = useShortlist((s) => s.toggleCompare)
  const setHovered = useUi((s) => s.setHovered)
  const showToast = useUi((s) => s.showToast)
  const hovered = useUi((s) => s.hoveredId === h.id)

  const stop = (fn: () => void) => (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    fn()
  }
  const onSave = stop(() => {
    toggleSaved(h.id)
    showToast(saved ? 'از ذخیره‌ها حذف شد' : 'ذخیره شد')
  })
  const onCompare = stop(() => {
    const r = toggleCompare(h.id)
    if (!r.ok) showToast('حداکثر ۴ خانه را می‌شود مقایسه کرد')
    else showToast(inCompare ? 'از مقایسه حذف شد' : 'به مقایسه اضافه شد')
  })

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      onMouseEnter={() => setHovered(h.id)}
      onMouseLeave={() => setHovered(null)}
      className={cn('group relative overflow-hidden rounded-card bg-surface shadow-e1 ring-1 ring-line/80 transition-shadow hover:shadow-e2', hovered && 'ring-2 ring-ink/70')}
    >
      <Link href={`/home/${h.id}/`} className="block focus-visible:outline-none" aria-label={`${roomsLabel(h.rooms)} ${faNum(h.area)} متری در ${h.neighborhood}`}>
        <div className="relative">
          <Photos h={h} />
          <div className="absolute start-2.5 top-2.5 flex flex-wrap gap-1.5">
            {rank !== undefined && rank < 3 ? <Badge tone="solid" className="font-bold">#{faNum(rank + 1)} برای تو</Badge> : null}
            {h.sources > 1 ? (
              <Badge tone="glass">
                <Layers className="size-3.5" />
                {faNum(h.sources)} آگهی · ادغام‌شده
              </Badge>
            ) : null}
          </div>
          <DealBadge v={h.vsAreaMedian} className="absolute bottom-2.5 end-2.5 shadow-e1" />
          <div className="absolute bottom-2.5 start-2.5 flex gap-1.5">
            {h.flags.includes('stockPhotos') ? (
              <Badge tone="glass" title="آگهی‌دهنده اعلام کرده عکس‌ها مربوط به همین ملک نیست">
                <AlertTriangle className="size-3.5 text-amber-300" />
                عکس نمونه
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="space-y-2.5 p-3.5 pb-3">
          <PriceLine h={h} />
          <p className="truncate text-[14px] font-semibold text-ink-2">
            {roomsLabel(h.rooms)} · {faNum(h.area)} متر · {h.neighborhood}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted">
            {h.nearestMetro ? (
              <span className="inline-flex items-center gap-1">
                <TrainFront className="size-3.5" />
                {meters(h.nearestMetro.meters)} تا {h.nearestMetro.station}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Building2 className="size-3.5" />
              {h.age === undefined ? '—' : h.age === 0 ? 'نوساز' : `${faNum(h.age)} ساله`} · {floorLabel(h.floor, h.totalFloors)}
            </span>
          </div>
          {reasons?.length ? (
            <ul className="flex flex-wrap gap-1.5 pt-0.5">
              {reasons.slice(0, 3).map((r) => (
                <li key={r.text} className={cn('inline-flex items-center gap-1 rounded-[8px] px-2 py-1 text-[11.5px] font-medium', r.tone === 'good' && 'bg-good-soft text-good', r.tone === 'warn' && 'bg-warn-soft text-warn', r.tone === 'bad' && 'bg-bad-soft text-bad', r.tone === 'neutral' && 'bg-surface-3 text-ink-2')}>
                  {r.tone === 'good' ? <Check className="size-3" /> : r.tone === 'warn' ? <AlertTriangle className="size-3" /> : null}
                  {r.text}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Link>

      <div className="absolute end-2.5 top-2.5 flex gap-1.5">
        <button onClick={onCompare} aria-pressed={inCompare} aria-label={inCompare ? 'حذف از مقایسه' : 'افزودن به مقایسه'} className={cn('grid size-9 place-items-center rounded-full shadow-e1 backdrop-blur-md transition active:scale-90', inCompare ? 'bg-ink text-surface' : 'bg-white/85 text-zinc-800 hover:bg-white')}>
          <Columns3 className="size-[17px]" />
        </button>
        <button onClick={onSave} aria-pressed={saved} aria-label={saved ? 'حذف از ذخیره‌ها' : 'ذخیره'} className={cn('grid size-9 place-items-center rounded-full shadow-e1 backdrop-blur-md transition active:scale-90', saved ? 'bg-brand text-brand-ink' : 'bg-white/85 text-zinc-800 hover:bg-white')}>
          <Bookmark className="size-[17px]" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.article>
  )
})
