'use client'
import * as Slider from '@radix-ui/react-slider'
import { useEffect, useState } from 'react'
import neighborhoods from '@/data/neighborhoods.json'
import { Sheet } from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { faNum, toman } from '@/shared/lib/format'
import type { FeatureKey, Intent } from '../lib/intent'
import type { SearchState } from '../lib/url-state'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  /** effective intent (sentence + explicit filters) */
  intent: Intent
  /** intent understood from the sentence only */
  base: Intent
  onApply: (patch: Partial<SearchState>) => void
  resultCount?: number
}

const FEATURE_OPTS: Array<[FeatureKey, string]> = [['parking', 'پارکینگ'], ['elevator', 'آسانسور'], ['storage', 'انباری'], ['balcony', 'بالکن'], ['renovated', 'بازسازی‌شده']]

function Range({ label, value, max, step, onChange, fmt }: { label: string; value: number; max: number; step: number; onChange: (v: number) => void; fmt: (v: number) => string }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-[13px]">
        <span className="font-semibold text-ink">{label}</span>
        <span className="tabular font-medium text-ink-2">{value >= max ? 'بدون سقف' : `تا ${fmt(value)}`}</span>
      </div>
      <Slider.Root dir="rtl" className="relative flex h-6 touch-none select-none items-center" value={[value]} max={max} step={step} onValueChange={([v]) => onChange(v)} aria-label={label}>
        <Slider.Track className="relative h-1.5 grow rounded-full bg-surface-3">
          <Slider.Range className="absolute h-full rounded-full bg-brand" />
        </Slider.Track>
        <Slider.Thumb className="block size-5 rounded-full border-2 border-brand bg-surface shadow-e1 outline-none focus-visible:ring-4 focus-visible:ring-brand/25" />
      </Slider.Root>
    </div>
  )
}

export function FiltersSheet({ open, onOpenChange, intent, base, onApply, resultCount }: Props) {
  const [deal, setDeal] = useState<'rent' | 'buy'>(intent.deal ?? 'rent')
  const [rooms, setRooms] = useState<number | null>(intent.rooms ?? null)
  const [dep, setDep] = useState(Math.round((intent.maxDeposit ?? 10e9) / 1e6))
  const [rent, setRent] = useState(Math.round((intent.maxRent ?? 300e6) / 1e6))
  const [price, setPrice] = useState(Math.round((intent.maxPrice ?? 60e9) / 1e6))
  const [metro, setMetro] = useState(!!intent.nearMetro)
  const [feats, setFeats] = useState<FeatureKey[]>(intent.must)
  const [hoods, setHoods] = useState<number[]>(intent.districtIds)

  useEffect(() => {
    if (!open) return
    setDeal(intent.deal ?? 'rent'); setRooms(intent.rooms ?? null)
    setDep(Math.round((intent.maxDeposit ?? 10e9) / 1e6)); setRent(Math.round((intent.maxRent ?? 300e6) / 1e6)); setPrice(Math.round((intent.maxPrice ?? 60e9) / 1e6))
    setMetro(!!intent.nearMetro); setFeats(intent.must); setHoods(intent.districtIds)
  }, [open, intent])

  // Only persist what differs from the sentence, so the same condition never shows up twice as a chip.
  const apply = () => {
    const m = (v?: number) => (v === undefined ? undefined : Math.round(v / 1e6))
    const differs = <T,>(v: T, fromText: T | undefined) => (v === fromText ? null : v)
    const extraFeats = feats.filter((f) => !base.must.includes(f))
    const extraHoods = hoods.filter((h) => !base.districtIds.includes(h))
    onApply({
      deal: differs(deal, base.deal ?? 'rent'),
      rooms: rooms === null ? null : differs(rooms, base.rooms),
      dep: deal === 'rent' && dep < 10000 ? differs(dep, m(base.maxDeposit)) : null,
      rent: deal === 'rent' && rent < 300 ? differs(rent, m(base.maxRent)) : null,
      price: deal === 'buy' && price < 60000 ? differs(price, m(base.maxPrice)) : null,
      metro: metro && !base.nearMetro ? true : null,
      f: extraFeats.length ? extraFeats : null,
      hoods: extraHoods.length ? extraHoods : null,
    })
    onOpenChange(false)
  }
  const reset = () => { onApply({ q: '', deal: null, rooms: null, dep: null, rent: null, price: null, metro: null, f: null, hoods: null }); onOpenChange(false) }
  const hoodList = neighborhoods.filter((n) => (deal === 'rent' ? n.rentCount : n.buyCount) > 0)

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="فیلترها"
      description="فیلترها روی چیزی که نوشتی اعمال می‌شوند"
      footer={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={reset} className="px-3">پاک کردن همه</Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={apply}>
            نمایش نتایج{resultCount !== undefined ? ` (${faNum(resultCount)})` : ''}
          </Button>
        </div>
      }
    >
      <div className="space-y-7 pt-1">
        <div className="grid grid-cols-2 gap-1 rounded-[14px] bg-surface-3 p-1">
          {(['rent', 'buy'] as const).map((d) => (
            <button key={d} onClick={() => setDeal(d)} className={cn('h-10 rounded-[11px] text-sm font-semibold text-ink-2 transition', deal === d && 'bg-surface text-ink shadow-e1')}>
              {d === 'rent' ? 'رهن و اجاره' : 'خرید'}
            </button>
          ))}
        </div>

        <section>
          <h3 className="mb-2.5 text-[13px] font-semibold">تعداد خواب</h3>
          <div className="flex gap-1.5">
            {[null, 0, 1, 2, 3, 4].map((r) => (
              <button key={String(r)} onClick={() => setRooms(r)} className={cn('h-10 flex-1 rounded-[11px] text-[13px] font-medium ring-1 ring-line transition hover:ring-line-strong', rooms === r && 'bg-ink text-surface ring-ink')}>
                {r === null ? 'همه' : r === 0 ? 'استودیو' : r === 4 ? '+۴' : faNum(r)}
              </button>
            ))}
          </div>
        </section>

        {deal === 'rent' ? (
          <section className="space-y-6">
            <Range label="حداکثر رهن (ودیعه)" value={dep} max={10000} step={50} onChange={setDep} fmt={(v) => toman(v * 1e6, { unit: false })} />
            <Range label="حداکثر اجاره‌ی ماهانه" value={rent} max={300} step={1} onChange={setRent} fmt={(v) => toman(v * 1e6, { unit: false, zero: 'صفر' })} />
            <p className="rounded-[12px] bg-info-soft px-3 py-2 text-[12.5px] leading-6 text-info">
              رهن و اجاره را به هم تبدیل می‌کنیم (هر ۱۰۰ میلیون رهن ≈ ۳ میلیون اجاره)، پس خانه‌هایی که با جابه‌جایی رهن و اجاره در بودجه‌ات جا می‌شوند هم نشان داده می‌شوند.
            </p>
          </section>
        ) : (
          <Range label="حداکثر قیمت کل" value={price} max={60000} step={250} onChange={setPrice} fmt={(v) => toman(v * 1e6, { unit: false })} />
        )}

        <section>
          <h3 className="mb-2.5 text-[13px] font-semibold">باید داشته باشد</h3>
          <div className="flex flex-wrap gap-1.5">
            {FEATURE_OPTS.map(([k, label]) => {
              const on = feats.includes(k)
              return (
                <button key={k} onClick={() => setFeats(on ? feats.filter((x) => x !== k) : [...feats, k])} className={cn('h-9 rounded-full px-3.5 text-[13px] font-medium ring-1 ring-line transition hover:ring-line-strong', on && 'bg-ink text-surface ring-ink')}>
                  {label}
                </button>
              )
            })}
            <button onClick={() => setMetro(!metro)} className={cn('h-9 rounded-full px-3.5 text-[13px] font-medium ring-1 ring-line transition hover:ring-line-strong', metro && 'bg-ink text-surface ring-ink')}>
              نزدیک مترو
            </button>
          </div>
        </section>

        <section>
          <h3 className="mb-2.5 text-[13px] font-semibold">محله‌ها</h3>
          <div className="flex flex-wrap gap-1.5">
            {hoodList.map((n) => {
              const on = hoods.includes(n.id)
              return (
                <button key={n.id} onClick={() => setHoods(on ? hoods.filter((x) => x !== n.id) : [...hoods, n.id])} className={cn('h-8 rounded-full px-3 text-[12.5px] font-medium ring-1 ring-line transition hover:ring-line-strong', on && 'bg-brand-soft text-brand ring-brand/40')}>
                  {n.name}
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </Sheet>
  )
}
