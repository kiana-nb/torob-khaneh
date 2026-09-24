'use client'
import * as Menu from '@radix-ui/react-dropdown-menu'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpDown, Check, ChevronDown, Clock, Sparkles, TrainFront, TrendingDown, Wallet } from 'lucide-react'
import { useState } from 'react'
import { SORTS, sortLabels, type SearchState } from '@/features/search/lib/url-state'
import { cn } from '@/shared/lib/cn'

type Sort = SearchState['sort']

const ICON: Record<Sort, typeof Sparkles> = { best: Sparkles, cheap: Wallet, deal: TrendingDown, new: Clock, metro: TrainFront }
const HINT: Record<Sort, string> = {
  best: 'بودجه، قیمت، مترو، امکانات، تازگی و اعتماد',
  cheap: 'کم‌ترین اجاره‌ی معادل ماهانه',
  deal: 'بیشترین فاصله زیر میانه‌ی محله',
  new: 'آگهی‌های تازه‌تر اول',
  metro: 'کوتاه‌ترین فاصله تا ایستگاه',
}

export function SortMenu({ value, onChange }: { value: Sort; onChange: (s: Sort) => void }) {
  const [open, setOpen] = useState(false)
  const Current = ICON[value]
  return (
    <Menu.Root open={open} onOpenChange={setOpen} dir="rtl" modal={false}>
      <Menu.Trigger
        aria-label={`مرتب‌سازی: ${sortLabels[value]}`}
        className={cn('inline-flex h-9 items-center gap-1.5 rounded-full bg-surface ps-3 pe-2.5 text-[13px] font-medium ring-1 ring-line outline-none transition hover:ring-line-strong focus-visible:ring-2 focus-visible:ring-brand', open && 'ring-line-strong')}
      >
        <ArrowUpDown className="size-3.5 text-muted" />
        <Current className="size-3.5 text-brand" />
        <span className="max-w-[9.5rem] truncate">{sortLabels[value]}</span>
        <ChevronDown className={cn('size-3.5 text-muted transition-transform duration-200', open && 'rotate-180')} />
      </Menu.Trigger>
      <AnimatePresence>
        {open ? (
          <Menu.Portal forceMount>
            <Menu.Content asChild forceMount align="end" sideOffset={8} collisionPadding={12}>
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                style={{ transformOrigin: 'var(--radix-dropdown-menu-content-transform-origin)' }}
                className="z-[70] w-[268px] rounded-[18px] bg-surface p-1.5 text-ink shadow-e3 ring-1 ring-line outline-none"
              >
                <Menu.Label className="px-2.5 pb-1 pt-1.5 text-[11.5px] font-semibold text-muted">مرتب‌سازی بر اساس</Menu.Label>
                <Menu.RadioGroup value={value} onValueChange={(v) => onChange(v as Sort)}>
                  {SORTS.map((s) => {
                    const Icon = ICON[s]
                    const on = s === value
                    return (
                      <Menu.RadioItem
                        key={s}
                        value={s}
                        className="group flex cursor-pointer items-center gap-3 rounded-[12px] px-2.5 py-2 outline-none transition-colors data-[highlighted]:bg-surface-3"
                      >
                        <span className={cn('grid size-8 shrink-0 place-items-center rounded-[10px] transition-colors', on ? 'bg-brand text-brand-ink' : 'bg-surface-3 text-ink-2 group-data-[highlighted]:bg-surface')}>
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn('block text-[13.5px]', on ? 'font-bold' : 'font-medium')}>{sortLabels[s]}</span>
                          <span className="block truncate text-[11.5px] text-muted">{HINT[s]}</span>
                        </span>
                        <Menu.ItemIndicator>
                          <Check className="size-4 text-brand" />
                        </Menu.ItemIndicator>
                      </Menu.RadioItem>
                    )
                  })}
                </Menu.RadioGroup>
              </motion.div>
            </Menu.Content>
          </Menu.Portal>
        ) : null}
      </AnimatePresence>
    </Menu.Root>
  )
}
