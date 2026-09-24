import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap', {
  variants: {
    tone: {
      neutral: 'bg-surface-3 text-ink-2',
      good: 'bg-good-soft text-good',
      warn: 'bg-warn-soft text-warn',
      bad: 'bg-bad-soft text-bad',
      brand: 'bg-brand-soft text-brand',
      info: 'bg-info-soft text-info',
      glass: 'bg-black/55 text-white backdrop-blur-md',
      solid: 'bg-surface text-ink shadow-e1',
    },
    size: { sm: 'h-6 px-2 text-[11.5px]', md: 'h-7 px-2.5 text-xs' },
  },
  defaultVariants: { tone: 'neutral', size: 'sm' },
})

export function Badge({ className, tone, size, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />
}
