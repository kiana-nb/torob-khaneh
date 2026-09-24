import { ArrowLeft, Combine, Database, ListOrdered, Sparkles, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { SearchBar } from '@/features/search/components/search-bar'
import { HomeCard } from '@/features/results/components/home-card'
import { BudgetExplorer } from '@/features/areas/components/budget-explorer'
import { homes, neighborhoods, report, toCard } from '@/shared/lib/data.server'
import { faNum, percent, roomsLabel, toman } from '@/shared/lib/format'
import { CountUp, HeroCopy, HeroItem, HeroTitle, PhotoWall, Reveal, RevealGroup, RevealItem } from '@/features/landing/components/motion'

const STEPS = [
  { icon: Database, title: 'جمع‌آوری', text: `${faNum(report.parsed)} آگهی عمومی از ${faNum(report.neighborhoods)} محله، بدون هیچ داده‌ی تماسی` },
  { icon: Wand2, title: 'تمیز کردن', text: '«دو» خواب، «۱٫۲ میلیارد» و «رایگان» به عدد تبدیل می‌شوند و ویژگی‌ها از متن آزاد استخراج می‌شوند' },
  { icon: Combine, title: 'ادغام تکراری‌ها', text: `${faNum(report.mergedListings)} آگهی تکراری در ${faNum(report.mergedHomes)} خانه ادغام شد؛ مثل فروشندگان در ترب` },
  { icon: ListOrdered, title: 'رتبه‌بندی با دلیل', text: 'بودجه، قیمت نسبت به محله، مترو، امکانات، تازگی و اعتماد؛ برای هر نتیجه می‌گوییم چرا' },
]

export default function Landing() {
  const deals = homes
    .filter((h) => h.deal === 'rent' && !h.trust.stockPhotos && h.images.length >= 3 && h.vsAreaMedian !== undefined && h.vsAreaMedian <= -0.12 && h.vsAreaMedian > -0.35)
    .sort((a, b) => a.vsAreaMedian! - b.vsAreaMedian!)
    .slice(0, 8)
  // photo wall: real (non-stock) photos, the deals first, one cover per home
  const wall = [...deals, ...homes.filter((h) => h.deal === 'rent' && !h.trust.stockPhotos && h.images.length >= 3 && !deals.includes(h))].slice(0, 18).map((h) => h.images[0])
  const top = deals[0]
  const stockShare = report.stockPhotos / report.parsed

  return (
    <div className="pb-6">
      {/* hero */}
      <section className="relative overflow-hidden bg-[#131316] text-white">
        <div className="blob-drift pointer-events-none absolute -top-40 start-[-10%] size-[520px] rounded-full bg-[#e11d48] opacity-35 blur-[140px]" />
        <div className="blob-drift pointer-events-none absolute -bottom-48 end-[20%] size-[420px] rounded-full bg-[#fb5475] opacity-20 blur-[140px] [animation-delay:-9s] [animation-duration:26s]" />
        <div className="relative mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-12 md:px-12 md:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <HeroCopy>
            <HeroItem>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-medium text-white/85 ring-1 ring-white/15">
                <Sparkles className="size-3.5" />
                ترب، این بار برای خانه
              </span>
            </HeroItem>
            <HeroTitle lead="همه‌ی خانه‌های تهران،" accent="یک‌جا و قابل مقایسه." />
            <HeroItem>
              <p className="mt-4 max-w-xl text-[15px] leading-8 text-white/70 md:text-[16px]">
                مثل آدم بنویس دنبال چه خانه‌ای هستی. آگهی‌های تکراری را یکی می‌کنیم، رهن و اجاره را به یک عدد تبدیل می‌کنیم و می‌گوییم هر خانه چرا برای تو خوب است.
              </p>
            </HeroItem>
            <HeroItem className="mt-7 max-w-2xl">
              <SearchBar variant="hero" />
            </HeroItem>
          </HeroCopy>
          <PhotoWall
            photos={wall}
            merged={{ listings: report.mergedListings, homes: report.mergedHomes }}
            deal={top?.equivRent && top.vsAreaMedian !== undefined ? { neighborhood: top.neighborhood, rooms: roomsLabel(top.rooms), price: toman(top.equivRent), pct: percent(top.vsAreaMedian) } : undefined}
          />
        </div>
        <dl className="relative mx-auto grid max-w-[1320px] grid-cols-2 border-t border-white/10 md:grid-cols-4">
          {[
            [<CountUp key="a" value={report.parsed} />, 'آگهی تحلیل‌شده'],
            [<CountUp key="b" value={report.neighborhoods} />, 'محله‌ی تهران'],
            [<CountUp key="c" value={stockShare} kind="pct" />, 'آگهی با «عکس نمونه»'],
            [<CountUp key="d" value={report.metroStations} />, 'ایستگاه مترو برای فاصله‌سنجی'],
          ].map(([n, l]) => (
            <div key={String(l)} className="border-white/10 px-5 py-4 md:border-e md:px-8 [&:nth-child(odd)]:border-e md:[&:last-child]:border-e-0">
              <dt className="text-[12px] text-white/55">{l}</dt>
              <dd className="tabular mt-0.5 text-[22px] font-extrabold">{n}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mx-auto max-w-[1320px] space-y-20 px-4 pt-16 md:px-6">
        {/* how */}
        <section>
          <Reveal>
            <h2 className="text-[24px] font-extrabold md:text-[28px]">از آگهی شلوغ تا جواب روشن</h2>
            <p className="mt-2 max-w-2xl text-[14.5px] leading-7 text-muted">کاری که ترب با قیمت کالا می‌کند، این‌جا با خانه: داده‌ی پراکنده و کثیف را قابل مقایسه می‌کنیم.</p>
          </Reveal>
          <RevealGroup as="ol" className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <RevealItem as="li" key={title} className="relative rounded-[20px] bg-surface p-5 shadow-e1 ring-1 ring-line transition-shadow hover:shadow-e2">
                <span className="absolute end-5 top-5 text-[40px] font-black leading-none text-surface-3">{faNum(i + 1)}</span>
                <span className="grid size-11 place-items-center rounded-[13px] bg-brand-soft text-brand"><Icon className="size-[22px]" /></span>
                <h3 className="mt-4 text-[16px] font-bold">{title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-7 text-muted">{text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* deals */}
        <section>
          <Reveal className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[24px] font-extrabold md:text-[28px]">زیر قیمت محله، با عکس واقعی</h2>
              <p className="mt-2 text-[14.5px] text-muted">اجاره‌هایی که قیمت هر مترشان حداقل ۱۲٪ زیر میانه‌ی همان محله است.</p>
            </div>
            <Link href="/search/?sort=deal" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-surface px-4 text-[13.5px] font-semibold ring-1 ring-line hover:ring-line-strong">
              همه‌ی معامله‌ها <ArrowLeft className="size-4" />
            </Link>
          </Reveal>
          <RevealGroup className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((h) => <RevealItem key={h.id}><HomeCard h={toCard(h)} /></RevealItem>)}
          </RevealGroup>
        </section>

        {/* budget */}
        <section>
          <Reveal>
            <h2 className="text-[24px] font-extrabold md:text-[28px]">با این بودجه کجا؟</h2>
            <p className="mb-6 mt-2 max-w-2xl text-[14.5px] leading-7 text-muted">
              رهن و اجاره‌ای که داری را بگو؛ با میانه‌ی اجاره‌ی معادل هر متر در {faNum(neighborhoods.length)} محله، می‌گوییم کجا شدنی است. میانه‌ی اجاره‌ی معادل یک خانه در این محله‌ها {toman(Math.round(neighborhoods.reduce((s, n) => s + (n.medianEquivRent ?? 0), 0) / neighborhoods.filter((n) => n.medianEquivRent).length))} در ماه است.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <BudgetExplorer areas={neighborhoods} />
          </Reveal>
        </section>
      </div>
    </div>
  )
}
