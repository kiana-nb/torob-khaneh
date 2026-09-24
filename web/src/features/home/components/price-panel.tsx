'use client'
import * as Slider from '@radix-ui/react-slider'
import { Bookmark, Columns3, ExternalLink, Share2 } from 'lucide-react'
import { useState } from 'react'
import type { PriceInfo } from '../lib/price-info'
import { PriceLine, DealBadge } from '@/features/results/components/home-card'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { toman } from '@/shared/lib/format'
import { RAHN_RATE, rentForDeposit } from '@/shared/lib/rahn'
import { useShortlist, useUi } from '@/shared/lib/stores'
import { useMounted } from '@/shared/hooks/use-mounted'

function Converter({ h }: { h: PriceInfo }) {
  const equiv = h.equivRent ?? 0
  const maxDep = Math.max(h.deposit ?? 0, Math.round(equiv / RAHN_RATE / 1e7) * 1e7)
  const [dep, setDep] = useState(h.deposit ?? 0)
  const rent = rentForDeposit(equiv, dep)
  return (
    <div className="rounded-[14px] bg-surface-2 p-3.5 ring-1 ring-line">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold">تبدیل رهن و اجاره</p>
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', h.convertible === false ? 'bg-warn-soft text-warn' : 'bg-good-soft text-good')}>
          {h.convertible === false ? 'به گفته‌ی آگهی: غیرقابل تبدیل' : h.convertible ? 'قابل تبدیل' : 'تخمینی'}
        </span>
      </div>
      <Slider.Root dir="rtl" className="relative mt-4 flex h-6 touch-none select-none items-center" value={[dep]} max={maxDep} step={Math.max(1e7, Math.round(maxDep / 100 / 1e7) * 1e7)} onValueChange={([v]) => setDep(v)} aria-label="مقدار رهن">
        <Slider.Track className="relative h-1.5 grow rounded-full bg-surface-3"><Slider.Range className="absolute h-full rounded-full bg-ink/80" /></Slider.Track>
        <Slider.Thumb className="block size-5 rounded-full border-2 border-ink bg-surface shadow-e1 outline-none focus-visible:ring-4 focus-visible:ring-ink/20" />
      </Slider.Root>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-[10px] bg-surface p-2 ring-1 ring-line">
          <p className="text-[11.5px] text-muted">رهن</p>
          <p className="tabular text-[14px] font-bold">{toman(dep, { unit: false, zero: 'صفر' })}</p>
        </div>
        <div className="rounded-[10px] bg-surface p-2 ring-1 ring-line">
          <p className="text-[11.5px] text-muted">اجاره‌ی ماهانه</p>
          <p className="tabular text-[14px] font-bold">{toman(rent, { unit: false, zero: 'صفر' })}</p>
        </div>
      </div>
      <p className="mt-2 text-[11.5px] leading-5 text-muted">با نرخ بازار ۳٪ در ماه. عدد نهایی به توافق با صاحب‌خانه بستگی دارد.</p>
    </div>
  )
}

export function PricePanel({ h, compact }: { h: PriceInfo; compact?: boolean }) {
  const mounted = useMounted()
  const saved = useShortlist((s) => s.saved.includes(h.id)) && mounted
  const inCompare = useShortlist((s) => s.compare.includes(h.id)) && mounted
  const toggleSaved = useShortlist((s) => s.toggleSaved)
  const toggleCompare = useShortlist((s) => s.toggleCompare)
  const showToast = useUi((s) => s.showToast)

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: h.summary, url })
      else { await navigator.clipboard.writeText(url); showToast('لینک کپی شد') }
    } catch {}
  }

  if (compact)
    return (
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="tabular truncate text-[17px] font-extrabold">{h.deal === 'buy' ? toman(h.price) : toman(h.equivRent)}</p>
          <p className="truncate text-[11.5px] text-muted">
            {h.deal === 'buy' ? `متری ${toman(h.pricePerM2, { unit: false })}` : `معادل ماهانه · رهن ${toman(h.deposit, { unit: false, zero: '۰' })} · اجاره ${toman(h.rent, { unit: false, zero: '۰' })}`}
          </p>
        </div>
        <a href={h.bestUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[12px] bg-brand px-4 text-[14px] font-semibold text-brand-ink">
          مشاهده در دیوار <ExternalLink className="size-4" />
        </a>
      </div>
    )

  return (
    <div className="space-y-4 rounded-sheet bg-surface p-5 shadow-e2 ring-1 ring-line">
      <div className="flex items-start justify-between gap-3">
        <PriceLine h={h} big />
        <DealBadge v={h.vsAreaMedian} className="mt-1 shrink-0" />
      </div>
      {h.listingCount > 1 ? (
        <p className="rounded-[12px] bg-good-soft px-3 py-2 text-[12.5px] leading-6 text-good">
          این خانه {h.listingCount.toLocaleString('fa-IR')} بار آگهی شده؛ ارزان‌ترین را نشان می‌دهیم.
        </p>
      ) : null}
      {h.deal === 'rent' && !h.negotiable ? <Converter h={h} /> : null}
      <a href={h.bestUrl} target="_blank" rel="noreferrer" className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-brand text-[15px] font-semibold text-brand-ink shadow-e1 transition hover:bg-brand-strong">
        مشاهده‌ی آگهی در دیوار
        <ExternalLink className="size-4" />
      </a>
      <div className="grid grid-cols-3 gap-2">
        <Button variant={saved ? 'brandSoft' : 'secondary'} onClick={() => { toggleSaved(h.id); showToast(saved ? 'از ذخیره‌ها حذف شد' : 'ذخیره شد') }}>
          <Bookmark className="size-4" fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'ذخیره شد' : 'ذخیره'}
        </Button>
        <Button variant={inCompare ? 'dark' : 'secondary'} onClick={() => { const r = toggleCompare(h.id); showToast(!r.ok ? 'حداکثر ۴ خانه' : inCompare ? 'از مقایسه حذف شد' : 'به مقایسه اضافه شد') }}>
          <Columns3 className="size-4" />
          مقایسه
        </Button>
        <Button onClick={share}>
          <Share2 className="size-4" />
          اشتراک
        </Button>
      </div>
    </div>
  )
}
