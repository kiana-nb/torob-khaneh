'use client'
import * as Slider from '@radix-ui/react-slider'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { Neighborhood } from '@/shared/types/home'
import { cn } from '@/shared/lib/cn'
import { faNum, toman } from '@/shared/lib/format'
import { RAHN_RATE } from '@/shared/lib/rahn'
import { SmartImg } from '@/shared/components/ui/smart-img'

/** «با این بودجه کجا؟» — which neighborhoods fit a deposit + rent budget for a given size. */
export function BudgetExplorer({ areas }: { areas: Neighborhood[] }) {
  const [deposit, setDeposit] = useState(2000) // million
  const [rent, setRent] = useState(20) // million
  const [size, setSize] = useState(80)
  const cap = rent * 1e6 + deposit * 1e6 * RAHN_RATE

  const rows = useMemo(
    () =>
      areas
        .filter((a) => a.medianEquivRentPerM2)
        .map((a) => ({ a, need: a.medianEquivRentPerM2! * size }))
        .sort((x, y) => x.need - y.need),
    [areas, size],
  )
  const fits = rows.filter((r) => r.need <= cap)

  return (
    <div className="grid gap-6 rounded-[24px] bg-surface p-5 shadow-e1 ring-1 ring-line md:grid-cols-[320px_minmax(0,1fr)] md:p-7">
      <div className="space-y-6">
        {[
          { label: 'رهن (ودیعه)', value: deposit, set: setDeposit, max: 8000, step: 100, fmt: (v: number) => toman(v * 1e6, { unit: false, zero: 'صفر' }) },
          { label: 'اجاره‌ی ماهانه', value: rent, set: setRent, max: 120, step: 1, fmt: (v: number) => toman(v * 1e6, { unit: false, zero: 'صفر' }) },
          { label: 'متراژ دلخواه', value: size, set: setSize, max: 200, step: 5, fmt: (v: number) => `${faNum(v)} متر` },
        ].map((s) => (
          <div key={s.label}>
            <div className="mb-2 flex items-baseline justify-between text-[13px]">
              <span className="font-semibold">{s.label}</span>
              <span className="tabular font-bold text-ink-2">{s.fmt(s.value)}</span>
            </div>
            <Slider.Root dir="rtl" className="relative flex h-6 touch-none select-none items-center" value={[s.value]} min={s.label === 'متراژ دلخواه' ? 30 : 0} max={s.max} step={s.step} onValueChange={([v]) => s.set(v)} aria-label={s.label}>
              <Slider.Track className="relative h-1.5 grow rounded-full bg-surface-3"><Slider.Range className="absolute h-full rounded-full bg-brand" /></Slider.Track>
              <Slider.Thumb className="block size-5 rounded-full border-2 border-brand bg-surface shadow-e1 outline-none focus-visible:ring-4 focus-visible:ring-brand/25" />
            </Slider.Root>
          </div>
        ))}
        <div className="rounded-[14px] bg-surface-2 p-3.5 ring-1 ring-line">
          <p className="text-[12px] text-muted">بودجه‌ات معادل</p>
          <p className="tabular text-[20px] font-extrabold">{toman(cap)} <span className="text-[13px] font-medium text-muted">در ماه</span></p>
          <p className="mt-1 text-[11.5px] text-muted">هر ۱۰۰ میلیون رهن ≈ ۳ میلیون اجاره</p>
        </div>
      </div>

      <div>
        <p className="mb-3 text-[14px] font-semibold">
          {fits.length ? <>در <span className="text-brand">{faNum(fits.length)} محله</span> یک خانه‌ی {faNum(size)} متری با این بودجه پیدا می‌شود</> : 'با این بودجه در محله‌های ما خانه‌ای با این متراژ نیست؛ متراژ را کم کن یا بودجه را بالا ببر'}
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {rows.map(({ a, need }) => {
              const ok = need <= cap
              const q = encodeURIComponent(`${a.name} حدود ${size} متری رهن ${deposit} اجاره ${rent}`)
              return (
                <motion.li key={a.id} layout transition={{ type: 'spring', stiffness: 320, damping: 30 }}>
                  <Link href={`/search/?q=${q}`} className={cn('flex items-center gap-3 rounded-[14px] p-2.5 ring-1 transition', ok ? 'bg-surface ring-line hover:ring-line-strong' : 'bg-surface-2 opacity-55 ring-transparent hover:opacity-80')}>
                    {a.coverImage ? <SmartImg src={a.coverImage} loading="lazy" wrapperClassName="size-12 shrink-0 rounded-[10px]" /> : <span className="size-12 shrink-0 rounded-[10px] bg-surface-3" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold">{a.name}</span>
                      <span className="block text-[12px] text-muted">{a.region} · حدود {toman(need)} در ماه</span>
                    </span>
                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-semibold', ok ? 'bg-good-soft text-good' : 'bg-surface-3 text-muted')}>{ok ? 'در بودجه' : 'بالاتر'}</span>
                  </Link>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  )
}
