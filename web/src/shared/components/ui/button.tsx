import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background,color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-brand-ink shadow-e1 hover:bg-brand-strong',
        secondary: 'bg-surface text-ink border border-line hover:border-line-strong hover:bg-surface-2',
        soft: 'bg-surface-3 text-ink hover:bg-line',
        ghost: 'text-ink-2 hover:bg-surface-3 hover:text-ink',
        brandSoft: 'bg-brand-soft text-brand hover:brightness-95',
        dark: 'bg-ink text-surface hover:opacity-90',
      },
      size: {
        sm: 'h-8 rounded-[10px] px-3 text-[13px]',
        md: 'h-10 rounded-[12px] px-4 text-sm',
        lg: 'h-12 rounded-[14px] px-5 text-[15px]',
        icon: 'size-10 rounded-full',
        iconSm: 'size-8 rounded-full',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export const Button = forwardRef<HTMLButtonElement, Props>(({ className, variant, size, type = 'button', ...props }, ref) => (
  <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
))
Button.displayName = 'Button'
