'use client'
import { Sheet } from '@/shared/components/ui/sheet'
import { faNum } from '@/shared/lib/format'
import { WEIGHTS, type Ranked } from '../lib/rank'

const LABELS: Record<keyof typeof WEIGHTS, [string, string]> = {
  budget: ['بودجه', 'چقدر در بودجه‌ات (با تبدیل رهن و اجاره) جا می‌شود'],
  deal: ['قیمت نسبت به محله', 'قیمت هر متر در مقایسه با میانه‌ی همان محله'],
  metro: ['دسترسی به مترو', 'فاصله تا نزدیک‌ترین ایستگاه؛ اگر «مترو» بنویسی وزنش دو برابر می‌شود'],
  features: ['امکانات', 'پارکینگ، آسانسور و انباری یا هر چیزی که خواستی'],
  fresh: ['تازگی آگهی', 'آگهی‌های تازه‌تر احتمال بیشتری دارد هنوز موجود باشند'],
  trust: ['اعتماد', 'قیمت مشخص و عکس واقعی از خود ملک'],
}

export function RankingExplainer({ open, onOpenChange, top }: { open: boolean; onOpenChange: (o: boolean) => void; top?: Ranked }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="چطور رتبه‌بندی می‌کنیم؟" description="بدون جعبه‌ی سیاه: هر نتیجه از این شش معیار امتیاز می‌گیرد.">
      <div className="space-y-3">
        {(Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).map((k) => (
          <div key={k} className="rounded-[14px] bg-surface-2 p-3 ring-1 ring-line">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-semibold">{LABELS[k][0]}</p>
              <span className="tabular text-[13px] font-bold text-brand">{faNum(Math.round(WEIGHTS[k] * 100))}٪ وزن</span>
            </div>
            <p className="mt-0.5 text-[12.5px] text-muted">{LABELS[k][1]}</p>
            {top ? (
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-ink/80" style={{ width: `${Math.round(top.parts[k] * 100)}%` }} />
                </div>
                <span className="tabular w-10 text-end text-[12px] text-ink-2">{faNum(Math.round(top.parts[k] * 100))}</span>
              </div>
            ) : null}
          </div>
        ))}
        {top ? <p className="pt-1 text-[12.5px] text-muted">نوارها امتیاز نتیجه‌ی اول را در هر معیار نشان می‌دهند.</p> : null}
        <p className="rounded-[12px] bg-warn-soft px-3 py-2 text-[12.5px] leading-6 text-warn">
          فیلترهای سخت (نوع معامله، محله، تعداد خواب و امکانات «حتماً») قبل از امتیازدهی اعمال می‌شوند. بودجه ۱۰٪ تحمل دارد و خانه‌های کمی بالاتر با برچسب نشان داده می‌شوند.
        </p>
      </div>
    </Sheet>
  )
}
