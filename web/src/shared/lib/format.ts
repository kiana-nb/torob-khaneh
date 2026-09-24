const nf = new Intl.NumberFormat('fa-IR')
const nf1 = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 })

export const faNum = (n: number | undefined | null) => (n === undefined || n === null || Number.isNaN(n) ? '—' : nf.format(n))

/** Year without thousands separator: ۱۴۰۳ */
export const faYear = (n?: number) => (n ? new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(n) : '—')

/**
 * Compact toman: 32_000_000 → «۳۲ میلیون», 1_250_000_000 → «۱٫۲۵ میلیارد», 0 → «رایگان».
 */
export function toman(n: number | undefined, opts: { zero?: string; unit?: boolean } = {}) {
  if (n === undefined || n === null) return 'توافقی'
  if (n === 0) return opts.zero ?? 'رایگان'
  const unit = opts.unit === false ? '' : ' تومان'
  if (n >= 1e9) return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(n / 1e9)} میلیارد${unit}`
  if (n >= 1e6) return `${nf1.format(n / 1e6)} میلیون${unit}`
  if (n >= 1e3) return `${nf.format(Math.round(n / 1e3))} هزار${unit}`
  return `${nf.format(n)}${unit}`
}

/** Short pin label: «۳۲م»، «۱٫۲ میلیارد» */
export function tomanShort(n?: number) {
  if (n === undefined) return 'توافقی'
  if (n >= 1e9) return `${nf1.format(n / 1e9)} میلیارد`
  if (n >= 1e6) return `${nf.format(Math.round(n / 1e6))}م`
  return nf.format(n)
}

export const percent = (x: number) => `${nf.format(Math.round(Math.abs(x) * 100))}٪`

export const meters = (m: number) => (m >= 1000 ? `${nf1.format(m / 1000)} کیلومتر` : `${nf.format(m)} متر`)

export const roomsLabel = (r: number) => (r === 0 ? 'بدون اتاق' : `${['', 'یک', 'دو', 'سه', 'چهار', 'پنج'][r] ?? faNum(r)}‌خوابه`)

export function floorLabel(floor?: number, total?: number) {
  if (floor === undefined) return '—'
  const f = floor === 0 ? 'همکف' : floor < 0 ? 'زیرهمکف' : `طبقه‌ی ${faNum(floor)}`
  return total ? `${f} از ${faNum(total)}` : f
}

const CRAWL_DATE = new Date('2026-09-23T12:00:00Z')
export function ago(iso: string) {
  const days = Math.max(0, Math.round((CRAWL_DATE.getTime() - new Date(iso).getTime()) / 86400000))
  if (days === 0) return 'امروز'
  if (days === 1) return 'دیروز'
  if (days < 7) return `${faNum(days)} روز پیش`
  if (days < 31) return `${faNum(Math.round(days / 7))} هفته پیش`
  return `${faNum(Math.round(days / 30))} ماه پیش`
}
export const daysOld = (iso: string) => Math.max(0, Math.round((CRAWL_DATE.getTime() - new Date(iso).getTime()) / 86400000))
