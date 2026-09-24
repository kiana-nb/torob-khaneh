import Link from 'next/link'
import report from '@/data/report.json'
import { faNum } from '@/shared/lib/format'

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-surface/60 pb-24 md:pb-10">
      <div className="mx-auto grid max-w-[1320px] gap-6 px-4 py-10 text-[13px] leading-7 text-muted md:grid-cols-[1.4fr_1fr] md:px-6">
        <div>
          <p className="font-bold text-ink">ترب خانه · دموی غیررسمی</p>
          <p className="mt-1 max-w-xl">
            این پروژه یک دموی مستقل برای چالش «AI Product Engineer» ترب است و وابستگی رسمی به ترب یا دیوار ندارد. {faNum(report.parsed)} آگهی عمومی
            اجاره و فروش آپارتمان در {faNum(report.neighborhoods)} محله‌ی تهران، در {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(report.crawledAt))} از دیوار
            جمع‌آوری شده‌اند. مالکیت آگهی‌ها و عکس‌ها با منبع اصلی است و هیچ داده‌ی تماسی ذخیره نشده.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-x-5 gap-y-2 md:justify-end">
          <Link href="/about/" className="hover:text-ink">این دمو چطور ساخته شد؟</Link>
          <Link href="/areas/" className="hover:text-ink">محله‌ها</Link>
          <a href="https://divar.ir" target="_blank" rel="noreferrer" className="hover:text-ink">منبع آگهی‌ها: دیوار</a>
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="hover:text-ink">نقشه: © OpenStreetMap</a>
        </div>
      </div>
    </footer>
  )
}
