import type { Metadata } from 'next'
import Link from 'next/link'
import { BudgetExplorer } from '@/features/areas/components/budget-explorer'
import { neighborhoods } from '@/shared/lib/data.server'
import { faNum, toman } from '@/shared/lib/format'
import { SmartImg } from '@/shared/components/ui/smart-img'

export const metadata: Metadata = { title: 'محله‌ها' }

export default function AreasPage() {
  const withRent = neighborhoods.filter((n) => n.medianEquivRentPerM2)
  const max = Math.max(...withRent.map((n) => n.medianEquivRentPerM2!))
  const sorted = [...neighborhoods].sort((a, b) => (b.medianEquivRentPerM2 ?? 0) - (a.medianEquivRentPerM2 ?? 0))
  return (
    <div className="mx-auto max-w-[1320px] space-y-14 px-4 pb-10 pt-8 md:px-6">
      <header>
        <h1 className="text-[28px] font-black md:text-[34px]">محله‌های تهران، با عدد</h1>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-7 text-muted">میانه‌ی اجاره‌ی معادل هر متر (رهن تبدیل‌شده به اجاره با نرخ ۳٪) و قیمت هر متر برای خرید، از آگهی‌های همین هفته.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((n) => (
          <Link key={n.id} href={`/areas/${n.slug}/`} className="group overflow-hidden rounded-[20px] bg-surface shadow-e1 ring-1 ring-line transition hover:shadow-e2">
            <div className="relative aspect-[16/9] overflow-hidden bg-surface-3">
              {n.coverImage ? <SmartImg src={n.coverImage} loading="lazy" className="transition-[opacity,transform] duration-500 group-hover:scale-[1.04]" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-3 start-4 text-white">
                <p className="text-[12px] text-white/75">{n.region} تهران</p>
                <p className="text-[22px] font-extrabold">{n.name}</p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-2 gap-2 text-[12.5px]">
                <div>
                  <p className="text-muted">اجاره‌ی معادل هر متر</p>
                  <p className="tabular text-[15px] font-bold">{n.medianEquivRentPerM2 ? toman(n.medianEquivRentPerM2) : '—'}</p>
                </div>
                <div>
                  <p className="text-muted">خرید، هر متر</p>
                  <p className="tabular text-[15px] font-bold">{n.medianPricePerM2 ? toman(n.medianPricePerM2) : '—'}</p>
                </div>
              </div>
              {n.medianEquivRentPerM2 ? (
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.round((n.medianEquivRentPerM2 / max) * 100)}%` }} />
                </div>
              ) : null}
              <p className="text-[12px] text-muted">{faNum(n.rentCount)} خانه‌ی اجاره‌ای{n.buyCount ? ` · ${faNum(n.buyCount)} فروشی` : ''} · متراژ میانه {faNum(n.medianArea)} متر</p>
            </div>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="mb-5 text-[24px] font-extrabold">با این بودجه کجا؟</h2>
        <BudgetExplorer areas={neighborhoods} />
      </section>
    </div>
  )
}
