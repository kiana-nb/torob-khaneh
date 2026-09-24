import { ArrowDown, Bot, Braces, Scale, ShieldCheck, TriangleAlert } from 'lucide-react'
import type { Metadata } from 'next'
import { WEIGHTS } from '@/features/results/lib/rank'
import { homes, report } from '@/shared/lib/data.server'
import { faNum, percent, toman } from '@/shared/lib/format'

export const metadata: Metadata = { title: 'این دمو چطور ساخته شد؟' }

const W_LABEL: Record<keyof typeof WEIGHTS, string> = { budget: 'بودجه', deal: 'قیمت نسبت به محله', metro: 'مترو', features: 'امکانات', fresh: 'تازگی', trust: 'اعتماد' }

export default function AboutPage() {
  const sample = homes.find((h) => h.listings.length > 1 && h.deal === 'rent' && h.rooms > 0) ?? homes[0]
  const Stat = ({ n, l, tone }: { n: string; l: string; tone?: string }) => (
    <div className="rounded-[18px] bg-surface p-4 ring-1 ring-line">
      <p className={`tabular text-[26px] font-black ${tone ?? ''}`}>{n}</p>
      <p className="mt-0.5 text-[12.5px] text-muted">{l}</p>
    </div>
  )

  return (
    <div className="mx-auto max-w-[920px] space-y-14 px-4 pb-10 pt-10 md:px-6">
      <header>
        <p className="text-[13px] font-semibold text-brand">برای تیم ترب · چالش AI Product Engineer</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight md:text-[38px]">«ترب ... رو بساز» → ترب خانه</h1>
        <p className="mt-3 text-[15px] leading-8 text-ink-2">
          مسئله: مستأجر تهرانی هر شب ده‌ها آگهی را اسکرول می‌کند که نصفشان تکراری، طعمه یا غیرقابل مقایسه‌اند. راه‌حل: همان کاری که ترب با قیمت کالا می‌کند،
          یعنی <b>جمع‌آوری، نرمال‌سازی، ادغام، رتبه‌بندی بر اساس نیت کاربر و توضیح</b>. این دمو کاملاً سمت فرانت است؛ داده‌ی واقعی یک بار crawl و به JSON تبدیل شده.
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-[21px] font-extrabold">داده‌ها به زبان عدد</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat n={faNum(report.parsed)} l="آگهی تحلیل‌شده" />
          <Stat n={faNum(report.homes)} l="خانه‌ی یکتا پس از ادغام" />
          <Stat n={percent(report.stockPhotos / report.parsed)} l="آگهی‌هایی که گفته‌اند عکس مال همین ملک نیست" tone="text-warn" />
          <Stat n={percent(report.agency / report.parsed)} l="آگهی از مشاور املاک" />
          <Stat n={faNum(report.mergedListings)} l={`آگهی تکراری در ${faNum(report.mergedHomes)} خانه`} tone="text-good" />
          <Stat n={percent(report.bumped / report.parsed)} l="آگهی نردبان‌شده (پولی بالا آمده)" />
          <Stat n={faNum(report.neighborhoods)} l="محله" />
          <Stat n={faNum(report.metroStations)} l="ایستگاه مترو (Wikidata)" />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-[21px] font-extrabold">پایپ‌لاین داده</h2>
        <ol className="space-y-3">
          {[
            ['Crawl', `API عمومی دیوار (مسیرهای مجاز در robots.txt)، هر ۲ ثانیه یک درخواست، ${faNum(report.rawListings)} آگهی از ${faNum(report.neighborhoods)} محله. بخش «تماس» هرگز درخواست یا ذخیره نشد.`],
            ['Normalize', '«دو» → ۲، «‏۱٬۲۰۰٬۰۰۰٬۰۰۰ تومان» → 1200000000، «رایگان» → ۰، «۳ از ۵» → طبقه ۳ از ۵، و «قبل از ۱۳۷۰» → سال تقریبی. شماره تلفن و آیدی از متن حذف شد.'],
            ['Dedupe', 'آگهی‌های هم‌محله با متراژ ±۲، خواب و طبقه‌ی یکسان، و عکس مشترک یا شباهت متن بالای ۵۵٪ یا قیمت و سال ساخت نزدیک، با union-find یک «خانه» شدند.'],
            ['Enrich', `اجاره‌ی معادل = اجاره + رهن × ${percent(report.rahnRate)}، میانه‌ی هر متر در هر محله، نزدیک‌ترین مترو (فاصله‌ی haversine)، برچسب‌های اعتماد، و خلاصه و مزایا و معایب قاعده‌محور.`],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4 rounded-[18px] bg-surface p-4 ring-1 ring-line">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-[14px] font-black text-brand">{faNum(i + 1)}</span>
              <div>
                <p className="font-bold" dir="ltr">{t}</p>
                <p className="mt-1 text-[13.5px] leading-7 text-ink-2">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-4 text-[21px] font-extrabold">یک نمونه‌ی واقعی: قبل و بعد</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="rounded-[18px] bg-[#16161a] p-4 font-mono text-[12.5px] leading-7 text-zinc-300" dir="ltr">
            <p className="mb-1 text-[11px] uppercase tracking-wider text-zinc-500">raw · {faNum(sample.listings.length)} ads</p>
            {sample.listings.slice(0, 3).map((l) => (
              <p key={l.id} className="truncate" dir="rtl">«{l.title}» · {l.negotiable ? 'توافقی' : `ودیعه ${toman(l.deposit, { unit: false })} · اجاره ${toman(l.rent, { unit: false })}`}</p>
            ))}
          </div>
          <ArrowDown className="mx-auto size-6 text-muted md:-rotate-90" />
          <div className="rounded-[18px] bg-surface p-4 font-mono text-[12.5px] leading-7 ring-1 ring-line" dir="ltr">
            <p className="mb-1 text-[11px] uppercase tracking-wider text-muted">home · normalized</p>
            <p>rooms: {sample.rooms} · area: {sample.area}m² · floor: {sample.floor ?? '—'}/{sample.totalFloors ?? '—'}</p>
            <p>equivRent: {sample.equivRent?.toLocaleString('en')} T/mo</p>
            <p>vsAreaMedian: {sample.vsAreaMedian !== undefined ? `${Math.round(sample.vsAreaMedian * 100)}%` : '—'}</p>
            <p>metro: {sample.nearestMetro ? `${sample.nearestMetro.meters}m` : '—'} · listings: {sample.listings.length}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-[21px] font-extrabold"><Scale className="size-5 text-brand" />رتبه‌بندی شفاف</h2>
        <div className="space-y-2">
          {(Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).map((k) => (
            <div key={k} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-[13.5px] font-medium">{W_LABEL[k]}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-brand" style={{ width: `${WEIGHTS[k] * 100 * 2.6}%` }} /></div>
              <span className="tabular w-10 text-end text-[13px] font-bold">{faNum(Math.round(WEIGHTS[k] * 100))}٪</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-7 text-muted">نیت کاربر با یک پارسر قاعده‌محور فارسی (سریع، قطعی و قابل‌توضیح) از جمله استخراج می‌شود و به چیپ‌های قابل‌حذف تبدیل می‌شود. بخشی که فهمیده نشود صادقانه نشان داده می‌شود.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          [Bot, 'نقش AI', 'ساخت با Claude Code: تحقیق، طراحی پایپ‌لاین، کد و تست؛ Playwright و Claude in Chrome برای بررسی UI. در محصول، کلید API در فرانت نیست؛ غنی‌سازی در زمان جمع‌آوری انجام می‌شود.'],
          [ShieldCheck, 'اخلاق داده', 'حجم کم و یک‌باره، نرخ محترمانه، بدون داده‌ی تماس، عکس‌ها hotlink با انتساب، noindex. مالکیت آگهی‌ها با منبع است.'],
          [Braces, 'آماده‌ی بک‌اند', 'لایه‌ی سرویس با شکل API واقعی (با تأخیر ماک). جایگزینی JSON با API بدون تغییر UI ممکن است.'],
        ].map(([Icon, t, d]) => {
          const I = Icon as typeof Bot
          return (
            <div key={t as string} className="rounded-[18px] bg-surface p-4 ring-1 ring-line">
              <I className="size-5 text-brand" />
              <p className="mt-2 font-bold">{t as string}</p>
              <p className="mt-1 text-[13px] leading-7 text-ink-2">{d as string}</p>
            </div>
          )
        })}
      </section>

      <section className="rounded-[18px] bg-warn-soft p-5">
        <p className="flex items-center gap-2 font-bold text-warn"><TriangleAlert className="size-5" />محدودیت‌ها</p>
        <ul className="mt-2 list-disc space-y-1 ps-5 text-[13.5px] leading-7 text-ink-2">
          <li>فقط یک منبع (دیوار). کیلید در دسترس crawl نبود؛ ادغام فعلاً درون‌منبعی است.</li>
          <li>فاصله تا مترو خط مستقیم است، نه مسیر پیاده.</li>
          <li>داده‌ی یک لحظه است؛ در نسخه‌ی واقعی crawl دوره‌ای، تاریخچه‌ی قیمت و هشدار کاهش قیمت اضافه می‌شود.</li>
          <li>پرسوناها فرضیه‌ی مبتنی بر شواهد هستند و با ۵ مصاحبه باید اعتبارسنجی شوند.</li>
        </ul>
      </section>
    </div>
  )
}
