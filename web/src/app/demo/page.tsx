import { ArrowLeft, Code2, PlayCircle, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthorLine } from '@/features/about/components/author-card'

export const metadata: Metadata = { title: 'ویدیوی دمو' }

const VIDEO = '/demo/torob-khaneh-demo.mp4'

export default function DemoVideoPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-8 md:px-6 md:pt-12">
      <header className="mb-6 md:mb-8">
        <p className="flex items-center gap-2 text-[12.5px] font-semibold text-muted">
          <span className="h-px w-6 bg-brand" />
          چالش AI Product Engineer ترب · کیانا نبی‌پور
        </p>
        <h1 className="mt-2 text-[28px] font-black leading-tight md:text-[38px]">ویدیوی دموی ترب خانه</h1>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-7 text-muted">
          مسئله، محصول و تصمیم‌های مهم در کمتر از ۴ دقیقه: جست‌وجو با زبان خود کاربر، ادغام آگهی‌های تکراری، اجاره‌ی معادل، رتبه‌بندی شفاف، و این‌که AI کجا به کار رفت.
        </p>
      </header>

      <div className="overflow-hidden rounded-[22px] bg-black shadow-e3 ring-1 ring-line">
        <video src={VIDEO} poster="/demo/poster.jpg" controls preload="metadata" playsInline className="aspect-video w-full" />
      </div>
      <p className="mt-3 text-[12.5px] text-muted">
        ۳:۵۲ دقیقه · 1080p · زیرنویس فارسی داخل ویدیو است. روایت با صدای ساخته‌شده در ElevenLabs است.{' '}
        <a href={VIDEO} download className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">دانلود فایل (۶۶ مگابایت)</a>
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link href="/" className="group flex items-center gap-3 rounded-[18px] bg-brand p-4 text-brand-ink shadow-e1 transition hover:bg-brand-strong">
          <PlayCircle className="size-6 shrink-0" />
          <span className="flex-1">
            <span className="block text-[15px] font-bold">خود دمو را امتحان کنید</span>
            <span className="block text-[12.5px] opacity-80">torob-khaneh.vercel.app</span>
          </span>
          <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
        </Link>
        <a href="https://github.com/kiana-nb/torob-khaneh" target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-[18px] bg-surface p-4 shadow-e1 ring-1 ring-line transition hover:ring-line-strong">
          <Code2 className="size-6 shrink-0 text-ink-2" />
          <span className="flex-1">
            <span className="block text-[15px] font-bold">کد روی گیت‌هاب</span>
            <span className="block text-[12.5px] text-muted" dir="ltr">github.com/kiana-nb/torob-khaneh</span>
          </span>
          <ArrowLeft className="size-4 text-muted transition group-hover:-translate-x-1" />
        </a>
        <Link href="/about/" className="group flex items-center gap-3 rounded-[18px] bg-surface p-4 shadow-e1 ring-1 ring-line transition hover:ring-line-strong">
          <Sparkles className="size-6 shrink-0 text-ink-2" />
          <span className="flex-1">
            <span className="block text-[15px] font-bold">این دمو چطور ساخته شد؟</span>
            <span className="block text-[12.5px] text-muted">داده، پایپ‌لاین و تصمیم‌ها</span>
          </span>
          <ArrowLeft className="size-4 text-muted transition group-hover:-translate-x-1" />
        </Link>
      </div>

      <div className="mt-6">
        <AuthorLine />
      </div>
    </div>
  )
}
