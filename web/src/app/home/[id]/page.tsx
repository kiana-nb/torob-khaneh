import { ArrowRight, Check, CircleAlert, MapPin, Sparkles, TrainFront } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Gallery } from '@/features/home/components/gallery'
import { PricePanel } from '@/features/home/components/price-panel'
import { toPriceInfo } from '@/features/home/lib/price-info'
import { Offers } from '@/features/home/components/offers'
import { PriceAnalysis } from '@/features/home/components/price-analysis'
import { LocationMapLazy } from '@/features/home/components/location-map-lazy'
import { Description } from '@/features/home/components/description'
import { HomeCard } from '@/features/results/components/home-card'
import { Badge } from '@/shared/components/ui/badge'
import { districtValues, getHome, getStation, homes, neighborhoods, similarHomes } from '@/shared/lib/data.server'
import { ago, faNum, faYear, floorLabel, meters, roomsLabel } from '@/shared/lib/format'

export const dynamicParams = false
export const generateStaticParams = () => homes.map((h) => ({ id: h.id }))

type Params = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const h = getHome((await params).id)
  if (!h) return {}
  return { title: `${roomsLabel(h.rooms)} ${faNum(h.area)} متری در ${h.neighborhood}`, description: h.ai.summary }
}

function Spec({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'yes' | 'no' }) {
  return (
    <div className="rounded-[14px] bg-surface-2 p-3 ring-1 ring-line">
      <p className="text-[12px] text-muted">{label}</p>
      <p className={`mt-0.5 text-[14.5px] font-bold ${tone === 'no' ? 'text-muted line-through decoration-1' : ''}`}>{value}</p>
    </div>
  )
}

const yesNo = (v?: boolean) => (v === undefined ? '—' : v ? 'دارد' : 'ندارد')

export default async function HomePage({ params }: Params) {
  const h = getHome((await params).id)
  if (!h) notFound()
  const hood = neighborhoods.find((n) => n.id === h.districtId)
  const station = getStation(h.nearestMetro?.station)
  const similar = similarHomes(h)
  const values = districtValues(h)
  const perM2 = h.deal === 'rent' ? h.equivRentPerM2 : h.pricePerM2
  const priceInfo = toPriceInfo(h)

  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-28 pt-4 md:px-6 md:pb-10">
      <nav className="mb-4 flex items-center gap-2 text-[13px] text-muted" aria-label="مسیر">
        <Link href="/search/" className="inline-flex items-center gap-1 font-medium text-ink-2 hover:text-ink">
          <ArrowRight className="size-4" />
          نتایج
        </Link>
        <span>/</span>
        {hood ? <Link href={`/areas/${hood.slug}/`} className="hover:text-ink">{h.neighborhood}</Link> : <span>{h.neighborhood}</span>}
      </nav>

      <Gallery images={h.images} title={h.ai.summary} stock={h.trust.stockPhotos} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-9">
          <header>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="brand">{h.deal === 'rent' ? 'رهن و اجاره' : 'فروش'}</Badge>
              {h.region ? <Badge>{h.region} تهران</Badge> : null}
              <Badge>{ago(h.postedAt)}</Badge>
              {h.trust.owner ? <Badge tone="info">آگهی شخصی هم دارد</Badge> : null}
            </div>
            <h1 className="mt-3 text-[24px] font-extrabold leading-tight md:text-[30px]">
              {roomsLabel(h.rooms)} {faNum(h.area)} متری در {h.neighborhood}
            </h1>
            <p className="mt-1.5 text-[14px] text-muted">عنوان آگهی: «{h.title}»</p>
          </header>

          <section className="rounded-sheet bg-gradient-to-l from-brand-soft/70 to-surface p-5 ring-1 ring-brand/15">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-brand"><Sparkles className="size-4" />خلاصه‌ی خودکار</p>
            <p className="mt-2 text-[15px] font-medium leading-8">{h.ai.summary}</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <ul className="space-y-1.5">
                {h.ai.pros.map((p) => <li key={p} className="flex gap-2 text-[13.5px]"><Check className="mt-1 size-4 shrink-0 text-good" />{p}</li>)}
              </ul>
              <ul className="space-y-1.5">
                {h.ai.cons.map((c) => <li key={c} className="flex gap-2 text-[13.5px] text-ink-2"><CircleAlert className="mt-1 size-4 shrink-0 text-warn" />{c}</li>)}
              </ul>
            </div>
            <p className="mt-3 text-[11.5px] text-muted">از روی داده‌ی نرمال‌شده‌ی آگهی‌ها در زمان جمع‌آوری ساخته شده؛ مستقل از متن تبلیغاتی آگهی.</p>
          </section>

          <section>
            <h2 className="mb-3 text-[18px] font-extrabold">{h.listings.length > 1 ? `${faNum(h.listings.length)} آگهی از همین خانه` : 'آگهی این خانه'}</h2>
            {h.listings.length > 1 ? <p className="mb-3 -mt-1 text-[13px] text-muted">این آگهی‌ها را با مقایسه‌ی متراژ، طبقه، عکس و متن، یکی تشخیص دادیم؛ مثل «فروشندگان» در ترب.</p> : null}
            <Offers listings={h.listings} deal={h.deal} />
          </section>

          <section>
            <h2 className="mb-3 text-[18px] font-extrabold">این قیمت منطقی است؟</h2>
            <PriceAnalysis values={values} value={perM2} median={h.areaMedianPerM2} neighborhood={h.neighborhood} deal={h.deal} />
          </section>

          <section>
            <h2 className="mb-3 text-[18px] font-extrabold">مشخصات</h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              <Spec label="متراژ" value={`${faNum(h.area)} متر`} />
              <Spec label="خواب" value={roomsLabel(h.rooms)} />
              <Spec label="سال ساخت" value={h.yearBuilt ? `${faYear(h.yearBuilt)}${h.age !== undefined ? ` (${h.age === 0 ? 'نوساز' : `${faNum(h.age)} ساله`})` : ''}` : '—'} />
              <Spec label="طبقه" value={floorLabel(h.floor, h.totalFloors)} />
              <Spec label="آسانسور" value={yesNo(h.features.elevator)} tone={h.features.elevator === false ? 'no' : undefined} />
              <Spec label="پارکینگ" value={yesNo(h.features.parking)} tone={h.features.parking === false ? 'no' : undefined} />
              <Spec label="انباری" value={yesNo(h.features.storage)} tone={h.features.storage === false ? 'no' : undefined} />
              {h.direction ? <Spec label="جهت ساختمان" value={h.direction} /> : <Spec label="بالکن" value={yesNo(h.features.balcony)} />}
            </div>
          </section>

          {h.geo ? (
            <section>
              <h2 className="mb-3 text-[18px] font-extrabold">موقعیت و دسترسی</h2>
              <div className="overflow-hidden rounded-sheet ring-1 ring-line">
                <div className="h-[300px]"><LocationMapLazy lat={h.geo.lat} lng={h.geo.lng} station={station} /></div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-surface p-4 text-[13.5px]">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-brand" />{h.neighborhood}{h.geo.approx ? ' (موقعیت تقریبی)' : ''}</span>
                  {h.nearestMetro ? (
                    <span className="inline-flex items-center gap-1.5"><TrainFront className="size-4 text-brand" />{meters(h.nearestMetro.meters)} (خط مستقیم) تا ایستگاه {h.nearestMetro.station}{h.nearestMetro.lines.length ? ` · خط ${h.nearestMetro.lines.map(faNum).join(' و ')}` : ''}</span>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-[18px] font-extrabold">توضیحات آگهی</h2>
            <Description text={h.description} />
            <p className="mt-3 text-[11.5px] text-muted">شماره‌های تماس و آیدی‌ها از متن حذف شده‌اند. برای تماس به آگهی اصلی مراجعه کن.</p>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24"><PricePanel h={priceInfo} /></div>
        </aside>
      </div>

      {similar.length ? (
        <section className="mt-14">
          <h2 className="mb-4 text-[20px] font-extrabold">خانه‌های مشابه</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => <HomeCard key={s.id} h={s} />)}
          </div>
        </section>
      ) : null}

      {/* mobile: price panel inline + sticky action */}
      <div className="mt-8 lg:hidden"><PricePanel h={priceInfo} /></div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <PricePanel h={priceInfo} compact />
      </div>
    </div>
  )
}
