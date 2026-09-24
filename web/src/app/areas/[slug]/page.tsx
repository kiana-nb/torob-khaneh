import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HomeCard } from '@/features/results/components/home-card'
import { PriceAnalysis } from '@/features/home/components/price-analysis'
import { getNeighborhood, homesIn, neighborhoods, toCard } from '@/shared/lib/data.server'
import { faNum, toman } from '@/shared/lib/format'

export const dynamicParams = false
export const generateStaticParams = () => neighborhoods.map((n) => ({ slug: n.slug }))
type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const n = getNeighborhood((await params).slug)
  return n ? { title: `خانه در ${n.name}` } : {}
}

export default async function AreaPage({ params }: Params) {
  const n = getNeighborhood((await params).slug)
  if (!n) notFound()
  const all = homesIn(n.id)
  const rent = all.filter((h) => h.deal === 'rent')
  const buy = all.filter((h) => h.deal === 'buy')
  const best = [...rent].filter((h) => !h.trust.stockPhotos && h.vsAreaMedian !== undefined && h.vsAreaMedian > -0.35).sort((a, b) => a.vsAreaMedian! - b.vsAreaMedian!).slice(0, 8)
  const rentVals = rent.map((h) => h.equivRentPerM2).filter((v): v is number => !!v)

  return (
    <div className="pb-10">
      <section className="relative isolate overflow-hidden">
        {n.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.coverImage} alt="" referrerPolicy="no-referrer" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/55 to-black/30" />
        <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-8 text-white md:px-6 md:pb-14 md:pt-12">
          <Link href="/areas/" className="inline-flex items-center gap-1 text-[13px] text-white/80 hover:text-white"><ArrowRight className="size-4" />همه‌ی محله‌ها</Link>
          <p className="mt-6 text-[14px] text-white/70">{n.region} تهران</p>
          <h1 className="text-[36px] font-black md:text-[48px]">{n.name}</h1>
          <dl className="mt-6 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['اجاره‌ی معادل هر متر', n.medianEquivRentPerM2 ? toman(n.medianEquivRentPerM2) : '—'],
              ['میانه‌ی اجاره‌ی معادل', n.medianEquivRent ? toman(n.medianEquivRent) : '—'],
              ['خرید، هر متر', n.medianPricePerM2 ? toman(n.medianPricePerM2) : '—'],
              ['خانه در داده‌ها', faNum(all.length)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[16px] bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-md">
                <dt className="text-[11.5px] text-white/65">{k}</dt>
                <dd className="tabular mt-0.5 text-[16px] font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/search/?q=${encodeURIComponent(n.name)}`} className="inline-flex h-11 items-center gap-1.5 rounded-[12px] bg-white px-4 text-[14px] font-semibold text-zinc-900">اجاره در {n.name}<ArrowLeft className="size-4" /></Link>
            {buy.length ? <Link href={`/search/?q=${encodeURIComponent(`خرید ${n.name}`)}`} className="inline-flex h-11 items-center gap-1.5 rounded-[12px] bg-white/15 px-4 text-[14px] font-semibold text-white ring-1 ring-white/25">خرید در {n.name}</Link> : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1320px] space-y-12 px-4 pt-10 md:px-6">
        {n.medianEquivRentPerM2 && rentVals.length > 4 ? (
          <section className="max-w-3xl">
            <h2 className="mb-3 text-[20px] font-extrabold">پراکندگی اجاره‌ی معادل هر متر</h2>
            <PriceAnalysis values={rentVals} median={n.medianEquivRentPerM2} neighborhood={n.name} deal="rent" />
          </section>
        ) : null}
        {best.length ? (
          <section>
            <h2 className="mb-4 text-[20px] font-extrabold">به‌صرفه‌ترین‌های {n.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{best.map((h) => <HomeCard key={h.id} h={toCard(h)} />)}</div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
