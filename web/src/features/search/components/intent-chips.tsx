'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import type { IntentChip } from '../lib/intent'
import { cn } from '@/shared/lib/cn'

interface Props {
  chips: IntentChip[]
  onRemove?: (chip: IntentChip) => void
  leftover?: string
  className?: string
  tone?: 'default' | 'onDark'
}

export function IntentChips({ chips, onRemove, leftover, className, tone = 'default' }: Props) {
  if (!chips.length && !leftover) return null
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <span className={cn('me-0.5 inline-flex items-center gap-1 text-[12px] font-medium', tone === 'onDark' ? 'text-white/75' : 'text-muted')}>
        <Sparkles className="size-3.5" />
        فهمیدم:
      </span>
      <AnimatePresence initial={false}>
        {chips.map((c) => (
          <motion.span
            key={c.key + c.span[0]}
            layout
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className={cn(
              'inline-flex h-7 items-center gap-1 rounded-full ps-2.5 text-[12.5px] font-medium',
              tone === 'onDark' ? 'bg-white/15 text-white ring-1 ring-white/20' : 'bg-surface text-ink ring-1 ring-line',
              onRemove ? 'pe-1' : 'pe-2.5',
            )}
          >
            {c.label}
            {onRemove ? (
              <button onClick={() => onRemove(c)} className={cn('grid size-5 place-items-center rounded-full transition', tone === 'onDark' ? 'hover:bg-white/20' : 'text-muted hover:bg-surface-3 hover:text-ink')} aria-label={`حذف ${c.label}`}>
                <X className="size-3.5" />
              </button>
            ) : null}
          </motion.span>
        ))}
      </AnimatePresence>
      {leftover ? (
        <span className={cn('inline-flex h-7 items-center rounded-full px-2.5 text-[12px]', tone === 'onDark' ? 'bg-black/25 text-white/80' : 'bg-warn-soft text-warn')} title="این بخش را متوجه نشدم و در نتایج اثری ندارد">
          متوجه نشدم: «{leftover}»
        </span>
      ) : null}
    </div>
  )
}
