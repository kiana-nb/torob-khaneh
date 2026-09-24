import { percent, toman } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'

/**
 * Histogram of price-per-m² in a neighborhood.
 * With `value` it positions a specific home against the median; without it, it describes the area.
 */
export function PriceAnalysis({ values, value, median, neighborhood, deal }: { values: number[]; value?: number; median?: number; neighborhood: string; deal: 'rent' | 'buy' }) {
  if (values.length < 3 || median === undefined) return null
  const sorted = [...values].sort((a, b) => a - b)
  const lo = sorted[Math.floor(sorted.length * 0.03)] ?? sorted[0]
  const hi = sorted[Math.ceil(sorted.length * 0.97) - 1] ?? sorted.at(-1)!
  const BINS = 18
  const w = (hi - lo) / BINS || 1
  const bins = Array.from({ length: BINS }, () => 0)
  for (const v of sorted) bins[Math.min(BINS - 1, Math.max(0, Math.floor((v - lo) / w)))]++
  const maxBin = Math.max(...bins)
  const pos = (v: number) => Math.min(100, Math.max(0, ((v - lo) / (hi - lo || 1)) * 100))
  const unit = deal === 'rent' ? 'اجاره‌ی معادل هر متر' : 'قیمت هر متر'
  const home = value !== undefined
  const diff = home ? (value - median) / median : 0
  const cheaperShare = home ? sorted.filter((v) => v > value).length / sorted.length : 0

  return (
    <div className="rounded-sheet bg-surface p-5 ring-1 ring-line">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        {home ? (
          <p className="text-[15px] font-bold">
            {Math.abs(diff) < 0.07 ? 'هم‌قیمت محله' : diff < 0 ? <span className="text-good">{percent(diff)} ارزان‌تر از میانه‌ی {neighborhood}</span> : <span className="text-warn">{percent(diff)} گران‌تر از میانه‌ی {neighborhood}</span>}
          </p>
        ) : (
          <p className="text-[15px] font-bold">میانه‌ی {unit}: {toman(median)}</p>
        )}
        <p className="text-[12.5px] text-muted">{home ? `ارزان‌تر از ${percent(cheaperShare)} خانه‌های ${neighborhood}` : `از ${toman(lo)} تا ${toman(hi)}`}</p>
      </div>
      <div className="relative mt-7 h-24" dir="ltr">
        <div className="flex h-full items-end gap-[3px]">
          {bins.map((b, i) => {
            const mid = lo + (i + 0.5) * w
            const isHere = home && value >= lo + i * w && (value < lo + (i + 1) * w || (i === BINS - 1 && value >= hi))
            return <div key={i} className={cn('flex-1 rounded-t-[4px] transition-colors', isHere ? 'bg-brand' : mid < median ? 'bg-good/35' : 'bg-line-strong')} style={{ height: `${Math.max(6, (b / maxBin) * 100)}%` }} />
          })}
        </div>
        <div className="absolute inset-y-0 border-s-2 border-dashed border-ink/50" style={{ left: `${pos(median)}%` }}>
          <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 text-[10.5px] font-semibold text-surface" dir="rtl">میانه</span>
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted" dir="ltr">
        <span dir="rtl">ارزان‌تر</span>
        <span dir="rtl">گران‌تر</span>
      </div>
      {home ? (
        <div className="mt-3 grid grid-cols-2 gap-3 text-[12.5px]">
          <div className="rounded-[12px] bg-surface-2 p-3 ring-1 ring-line">
            <p className="text-muted">{unit} (این خانه)</p>
            <p className="tabular mt-0.5 text-[15px] font-bold">{toman(value)}</p>
          </div>
          <div className="rounded-[12px] bg-surface-2 p-3 ring-1 ring-line">
            <p className="text-muted">میانه‌ی {neighborhood}</p>
            <p className="tabular mt-0.5 text-[15px] font-bold">{toman(median)}</p>
          </div>
        </div>
      ) : null}
      <p className="mt-3 text-[11.5px] leading-5 text-muted">بر اساس {values.length.toLocaleString('fa-IR')} خانه‌ی همین محله در داده‌های ما؛ ۳٪ ابتدا و انتهای بازه برای کم کردن اثر آگهی‌های غیرعادی حذف شده.</p>
    </div>
  )
}
