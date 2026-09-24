import Link from 'next/link'
import { buttonVariants } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-md place-items-center px-6 py-24 text-center">
      <p className="text-[64px] font-black text-brand">۴۰۴</p>
      <h1 className="mt-2 text-[20px] font-bold">این صفحه پیدا نشد</h1>
      <p className="mt-2 text-[14px] leading-7 text-muted">شاید آگهی حذف شده یا لینک اشتباه است.</p>
      <Link href="/search/" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'mt-6')}>برو به جست‌وجو</Link>
    </div>
  )
}
