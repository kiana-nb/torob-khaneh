import { Bot, Braces, ChartColumn, Columns3, Combine, Hash, House, ImageOff, ListOrdered, MessageSquareText, Rocket, Scale, Search, ShieldCheck, Smartphone, TrainFront, TrendingDown, TriangleAlert, Wallet } from 'lucide-react'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { WEIGHTS } from '@/features/results/lib/rank'
import { BeforeAfter, Donut, Eyebrow, MergeDots, Meter, Pipeline, ProblemOrbit, SplitBar, WeightBars } from '@/features/about/components/about-visuals'
import { ProductTour } from '@/features/about/components/product-tour'
import { CountUp, HeroCopy, HeroItem, HeroTitle, Reveal, RevealGroup, RevealItem } from '@/features/landing/components/motion'
import { homes, report } from '@/shared/lib/data.server'
import { faNum, percent, toman } from '@/shared/lib/format'

export const metadata: Metadata = { title: 'این دمو چطور ساخته شد؟' }

const W_LABEL: Record<keyof typeof WEIGHTS, string> = { budget: 'بودجه', deal: 'قیمت نسبت به محله', metro: 'مترو', features: 'امکانات', fresh: 'تازگی', trust: 'اعتماد' }

const PROBLEMS = [
  { icon: <MessageSquareText className="size-3.5" />, label: 'فهم جمله‌ی فارسی' },
  { icon: <Hash className="size-3.5" />, label: 'عدد از متن آزاد' },
  { icon: <Combine className="size-3.5" />, label: 'ادغام آگهی تکراری' },
  { icon: <Scale className="size-3.5" />, label: 'رهن + اجاره = یک عدد' },
  { icon: <TrendingDown className="size-3.5" />, label: 'قیمت نسبت به محله' },
  { icon: <TrainFront className="size-3.5" />, label: 'فاصله تا مترو' },
  { icon: <ImageOff className="size-3.5" />, label: 'هشدار عکس نمونه' },
  { icon: <ListOrdered className="size-3.5" />, label: 'رتبه‌بندی با دلیل' },
]

export default function AboutPage() {
  const sample = homes.find((h) => h.listings.length > 2 && h.deal === 'rent' && h.rooms > 0) ?? homes.find((h) => h.listings.length > 1 && h.deal === 'rent') ?? homes[0]
  const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <RevealItem className={`rounded-[22px] bg-surface p-5 shadow-e1 ring-1 ring-line ${className}`}>{children}</RevealItem>
  )

  return (
    <div className="pb-12">
      {/* hero */}
      <section className="px-3 pt-3 md:px-6 md:pt-5">
        <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[28px] bg-[#0f0f12] text-white ring-1 ring-white/[0.06]">
          <div className="blob-drift pointer-events-none absolute -top-48 end-[-8%] size-[560px] rounded-full bg-[#e11d48] opacity-30 blur-[150px]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
          <div className="relative grid items-center gap-10 px-5 py-12 md:px-12 md:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <HeroCopy>
              <HeroItem>
                <Eyebrow onDark>برای تیم ترب · چالش AI Product Engineer</Eyebrow>
              </HeroItem>
              <HeroTitle lead="«ترب ... رو بساز»" accent="ترب خانه." />
              <HeroItem>
                <p className="mt-4 max-w-xl text-[15px] leading-8 text-white/70">مستأجر تهرانی هر شب ده‌ها آگهی را اسکرول می‌کند که نصفشان تکراری، طعمه یا غیرقابل مقایسه‌اند. ترب خانه همان کاری را با خانه می‌کند که ترب با قیمت کالا:</p>
                <p className="mt-2 max-w-xl text-[15px] font-bold leading-8 text-white">جمع‌آوری، نرمال‌سازی، ادغام، رتبه‌بندی بر اساس نیت کاربر، و توضیح.</p>
              </HeroItem>
              <HeroItem className="mt-6 flex flex-wrap gap-2 text-[12px] text-white/60">
                {['کاملاً سمت فرانت', `${faNum(report.parsed)} آگهی واقعی`, 'بدون داده‌ی تماس'].map((t) => (
                  <span key={t} className="rounded-full bg-white/[0.06] px-3 py-1 ring-1 ring-white/10">{t}</span>
                ))}
              </HeroItem>
            </HeroCopy>
            <div>
              <ProblemOrbit problems={PROBLEMS} query="دوخوابه نزدیک مترو با ۲ میلیارد رهن، پارکینگ داشته باشه" />
              <p className="mt-3 text-center text-[12px] font-medium text-white/45 max-lg:text-start">مسئله‌هایی که پشت یک جست‌وجو حل می‌شوند</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] space-y-24 px-4 pt-20 md:px-6">
        {/* product tour: real screenshots of this build */}
        <section>
          <Reveal className="mb-8">
            <Eyebrow>تور محصول</Eyebrow>
            <h2 className="mt-2 text-[28px] font-black md:text-[34px]">از یک جمله تا یک تصمیم</h2>
          </Reveal>
          <ProductTour
            steps={[
              { icon: <Search className="size-[18px]" />, title: 'جست‌وجو با زبان خودت', text: 'یک جمله‌ی فارسی به چیپ‌های قابل‌حذف تبدیل می‌شود؛ نتایج با دلیلِ رتبه، برچسب قیمت نسبت به محله و پین روی نقشه.', src: '/shots/search.webp', path: '/search' },
              { icon: <House className="size-[18px]" />, title: 'یک خانه، همه‌ی آگهی‌هایش', text: 'آگهی‌های تکراری یک خانه کنار هم؛ ارزان‌ترین برجسته می‌شود، مثل فهرست فروشنده‌ها در ترب.', src: '/shots/home.webp', path: '/home/gagaDrc_' },
              { icon: <ChartColumn className="size-[18px]" />, title: 'این قیمت منطقی است؟', text: 'هیستوگرام قیمت هر متر در همان محله و مبدل زنده‌ی رهن و اجاره؛ عدد، نه حدس.', src: '/shots/home-analysis.webp', path: '/home/gagaDrc_' },
              { icon: <Columns3 className="size-[18px]" />, title: 'مقایسه‌ی کنار هم', text: 'تا ۴ خانه در یک جدول؛ بهترین مقدار هر ردیف سبز می‌شود و لینکش برای هم‌خانه قابل اشتراک است.', src: '/shots/compare.webp', path: '/compare' },
              { icon: <Wallet className="size-[18px]" />, title: 'با این بودجه کجا؟', text: 'رهن، اجاره و متراژ را تنظیم کن تا ببینی در کدام محله‌ها شدنی است.', src: '/shots/budget.webp', path: '/areas' },
              { icon: <Smartphone className="size-[18px]" />, title: 'اول برای موبایل', text: 'بیشتر جست‌وجوی خانه روی گوشی است؛ کارت‌ها، فیلترها و نقشه برای یک دست طراحی شده‌اند.', src: '/shots/search-mobile.webp', path: '/search', phone: true },
            ]}
          />
        </section>

        {/* numbers */}
        <section>
          <Reveal className="mb-8">
            <Eyebrow>داده‌ی واقعی دیوار، crawl شده در ۱ مهر ۱۴۰۵</Eyebrow>
            <h2 className="mt-2 text-[28px] font-black md:text-[34px]">داده‌ها به زبان عدد</h2>
          </Reveal>
          <RevealGroup className="grid gap-4 md:grid-cols-6">
            <Card className="md:col-span-3 md:row-span-2">
              <p className="text-[13px] text-muted">خانه‌ی یکتا، از {faNum(report.parsed)} آگهی قابل‌تحلیل</p>
              <p className="tabular mt-1 text-[56px] font-black leading-none tracking-tight"><CountUp value={report.homes} /></p>
              <div className="mt-6"><SplitBar a={{ n: report.rentHomes, label: 'رهن و اجاره' }} b={{ n: report.buyHomes, label: 'فروش' }} /></div>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 text-[13px]">
                <div><p className="tabular text-[22px] font-extrabold"><CountUp value={report.neighborhoods} /></p><p className="text-muted">محله‌ی تهران</p></div>
                <div><p className="tabular text-[22px] font-extrabold"><CountUp value={report.metroStations} /></p><p className="text-muted">ایستگاه مترو (Wikidata)</p></div>
              </div>
            </Card>
            <Card className="flex items-center gap-4 md:col-span-3">
              <div className="relative shrink-0">
                <Donut value={report.stockPhotos / report.parsed} />
                <span className="tabular absolute inset-0 grid place-items-center text-[20px] font-black text-warn"><CountUp value={report.stockPhotos / report.parsed} kind="pct" /></span>
              </div>
              <div>
                <p className="text-[15px] font-bold">عکس‌ها مال همین خانه نیست</p>
                <p className="mt-1 text-[13px] leading-6 text-muted">به گفته‌ی خود آگهی‌دهنده. روی کارت‌ها برچسب «عکس نمونه» می‌خورند و در رتبه‌بندی اعتماد کمتری می‌گیرند.</p>
              </div>
            </Card>
            <Card className="md:col-span-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-bold">آگهی تکراری، ادغام‌شده</p>
                  <p className="mt-0.5 text-[13px] text-muted">{faNum(report.mergedListings)} آگهی ← {faNum(report.mergedHomes)} خانه، مثل فروشنده‌ها در ترب</p>
                </div>
                <Combine className="size-5 shrink-0 text-good" />
              </div>
              <div className="mt-4"><MergeDots listings={report.mergedListings} homes={report.mergedHomes} /></div>
            </Card>
            <Card className="md:col-span-3">
              <div className="flex items-baseline justify-between"><p className="text-[14px] font-bold">آگهی از مشاور املاک</p><p className="tabular text-[20px] font-black"><CountUp value={report.agency / report.parsed} kind="pct" /></p></div>
              <div className="mt-3"><Meter value={report.agency / report.parsed} /></div>
            </Card>
            <Card className="md:col-span-3">
              <div className="flex items-baseline justify-between"><p className="text-[14px] font-bold">نردبان‌شده (پولی بالا آمده)</p><p className="tabular text-[20px] font-black"><CountUp value={report.bumped / report.parsed} kind="pct" /></p></div>
              <div className="mt-3"><Meter value={report.bumped / report.parsed} className="bg-ink/70" /></div>
            </Card>
          </RevealGroup>
        </section>

        {/* pipeline */}
        <section>
          <Reveal className="mb-10">
            <Eyebrow>از آگهی خام تا جواب</Eyebrow>
            <h2 className="mt-2 text-[28px] font-black md:text-[34px]">پایپ‌لاین داده</h2>
            <p className="mt-2 max-w-2xl text-[14.5px] leading-7 text-muted">یک بار و محلی اجرا می‌شود، نه در مرورگر. خروجی‌اش JSONی است که این دمو از آن می‌خواند.</p>
          </Reveal>
          <Pipeline
            steps={[
              { en: 'Crawl', fa: 'جمع‌آوری', text: `API عمومی دیوار، فقط مسیرهای مجاز robots.txt، هر ۲ ثانیه یک درخواست. ${faNum(report.rawListings)} آگهی از ${faNum(report.neighborhoods)} محله؛ بخش «تماس» هرگز خوانده نشد.`, example: ['۲۰ محله', `${faNum(report.rawListings)} آگهی`] },
              { en: 'Normalize', fa: 'نرمال‌سازی', text: 'عدد از متن آزاد، طبقه از «۳ از ۵»، سال تقریبی از «قبل از ۱۳۷۰»، و امکانات از توضیحات. تلفن و آیدی حذف می‌شود.', example: ['«دو» خواب', 'rooms: 2'] },
              { en: 'Dedupe', fa: 'ادغام تکراری‌ها', text: 'هم‌محله، متراژ ±۲، خواب و طبقه‌ی یکسان، به‌علاوه‌ی عکس مشترک یا متن بیش از ۵۵٪ شبیه؛ با union-find یک «خانه» می‌شوند.', example: ['۳ آگهی', '۱ خانه'] },
              { en: 'Enrich', fa: 'غنی‌سازی', text: `اجاره‌ی معادل (رهن × ${percent(report.rahnRate)})، میانه‌ی هر متر محله، نزدیک‌ترین مترو، برچسب‌های اعتماد و خلاصه‌ی قاعده‌محور.`, example: ['۱ میلیارد رهن', '۳۰ میلیون/ماه'] },
            ]}
          />
        </section>

        {/* before / after */}
        <section>
          <Reveal className="mb-8">
            <Eyebrow>یک نمونه‌ی واقعی</Eyebrow>
            <h2 className="mt-2 text-[28px] font-black md:text-[34px]">{faNum(sample.listings.length)} آگهی، یک خانه</h2>
          </Reveal>
          <BeforeAfter
            raw={sample.listings.slice(0, 3).map((l) => ({
              title: l.title,
              price: l.negotiable ? 'توافقی' : `ودیعه ${toman(l.deposit, { unit: false })} · اجاره ${toman(l.rent, { unit: false })}`,
              tag: l.isAgency ? 'مشاور' : 'شخصی',
            }))}
            after={[
              ['rooms · area', `${sample.rooms} · ${sample.area}m²`],
              ['floor', `${sample.floor ?? '—'} / ${sample.totalFloors ?? '—'}`],
              ['equivRent', `${sample.equivRent?.toLocaleString('en') ?? '—'} T/mo`],
              ['vsAreaMedian', sample.vsAreaMedian !== undefined ? `${Math.round(sample.vsAreaMedian * 100)}%` : '—'],
              ['nearestMetro', sample.nearestMetro ? `${sample.nearestMetro.meters} m` : '—'],
              ['listings', String(sample.listings.length)],
            ]}
          />
        </section>

        {/* ranking */}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <Reveal>
            <Eyebrow>بدون جعبه‌ی سیاه</Eyebrow>
            <h2 className="mt-2 text-[28px] font-black md:text-[34px]">رتبه‌بندی شفاف</h2>
            <p className="mt-3 text-[14.5px] leading-8 text-muted">
              نیت کاربر با یک پارسر قاعده‌محور فارسی (سریع، قطعی و قابل توضیح) از جمله استخراج می‌شود و به چیپ‌های قابل‌حذف تبدیل می‌شود. هر نتیجه با شش معیار وزن‌دار امتیاز می‌گیرد و روی کارتش می‌گوید چرا این‌جاست. بخشی از جمله که فهمیده نشود، صادقانه نشان داده می‌شود.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-[22px] bg-surface p-6 shadow-e1 ring-1 ring-line">
            <WeightBars rows={(Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).map((k) => ({ label: W_LABEL[k], w: WEIGHTS[k] }))} />
          </Reveal>
        </section>

        {/* principles */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#0f0f12] px-6 py-12 ring-1 ring-white/[0.06] text-white md:px-12 md:py-16">
          <div className="pointer-events-none absolute -bottom-40 start-[-10%] size-[480px] rounded-full bg-[#e11d48] opacity-25 blur-[140px]" />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Reveal>
              <Eyebrow onDark>چطور ساخته شد</Eyebrow>
              <p className="mt-3 text-[40px] font-black leading-[1.15] md:text-[56px]">
                داده‌ی کثیف،
                <br />
                <span className="text-[#ff5d7e]">جواب روشن.</span>
              </p>
            </Reveal>
            <RevealGroup className="divide-y divide-white/10">
              {[
                [Bot, 'نقش AI', 'ساخته‌شده با Claude Code: تحقیق، طراحی پایپ‌لاین، کد و تست؛ Playwright و Claude in Chrome برای بررسی UI. در محصول کلید API در فرانت نیست و غنی‌سازی هنگام جمع‌آوری انجام می‌شود.'],
                [ShieldCheck, 'اخلاق داده', 'حجم کم و یک‌باره، نرخ محترمانه، بدون داده‌ی تماس، عکس‌ها hotlink با انتساب، و noindex. مالکیت آگهی‌ها با منبع است.'],
                [Braces, 'آماده‌ی بک‌اند', 'لایه‌ی سرویس با شکل API واقعی و تأخیر ماک؛ می‌شود JSON را با API عوض کرد بی‌آن‌که UI تغییر کند.'],
              ].map(([Icon, t, d]) => {
                const I = Icon as typeof Bot
                return (
                  <RevealItem key={t as string} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                    <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-white/[0.06] text-[#ff7a93] ring-1 ring-white/10"><I className="size-5" /></span>
                    <div>
                      <p className="font-bold">{t as string}</p>
                      <p className="mt-1 text-[13.5px] leading-7 text-white/65">{d as string}</p>
                    </div>
                  </RevealItem>
                )
              })}
            </RevealGroup>
          </div>
        </section>

        {/* limits & next */}
        <RevealGroup className="grid gap-4 md:grid-cols-2">
          <RevealItem className="rounded-[22px] bg-warn-soft p-6">
            <p className="flex items-center gap-2 text-[16px] font-bold text-warn"><TriangleAlert className="size-5" />محدودیت‌ها</p>
            <ul className="mt-3 list-disc space-y-1.5 ps-5 text-[13.5px] leading-7 text-ink-2">
              <li>فقط یک منبع (دیوار). کیلید در دسترس crawl نبود؛ ادغام فعلاً درون‌منبعی است.</li>
              <li>فاصله تا مترو خط مستقیم است، نه مسیر پیاده.</li>
              <li>داده‌ی یک لحظه است، نه یک سری زمانی.</li>
              <li>پرسوناها فرضیه‌ی مبتنی بر شواهدند و باید با مصاحبه اعتبارسنجی شوند.</li>
            </ul>
          </RevealItem>
          <RevealItem className="rounded-[22px] bg-surface p-6 shadow-e1 ring-1 ring-line">
            <p className="flex items-center gap-2 text-[16px] font-bold"><Rocket className="size-5 text-brand" />قدم بعد</p>
            <ol className="mt-3 space-y-2.5 text-[13.5px] leading-7 text-ink-2">
              {['crawl دوره‌ای و تاریخچه‌ی قیمت هر خانه', 'هشدار «قیمت این خانه پایین آمد»', 'منبع دوم و ادغام بین‌منبعی', 'مسیر پیاده تا مترو به‌جای خط مستقیم', '۵ مصاحبه با مستأجرها و به‌روزرسانی پرسوناها'].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="tabular grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-[12px] font-bold text-brand">{faNum(i + 1)}</span>
                  {t}
                </li>
              ))}
            </ol>
          </RevealItem>
        </RevealGroup>
      </div>
    </div>
  )
}
