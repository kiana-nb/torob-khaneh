import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/vazirmatn'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import { Providers } from '@/shared/components/providers'
import { BottomNav, SiteHeader } from '@/shared/components/site-header'
import { SiteFooter } from '@/shared/components/site-footer'
import { Toast } from '@/shared/components/toast'
import { themeInitScript } from '@/shared/components/theme-toggle'

export const metadata: Metadata = {
  title: { default: 'ترب خانه · همه‌ی خانه‌ها، یک‌جا، قابل مقایسه', template: '%s · ترب خانه' },
  description: 'دموی «ترب برای خانه»: آگهی‌های اجاره و خرید آپارتمان در تهران، یکپارچه، بدون تکراری، با اجاره‌ی معادل و رتبه‌بندی بر اساس نیاز تو.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f5f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f11' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh">
        <Providers>
          <SiteHeader />
          <main className="min-h-[70dvh]">{children}</main>
          <SiteFooter />
          <BottomNav />
          <Toast />
        </Providers>
      </body>
    </html>
  )
}
