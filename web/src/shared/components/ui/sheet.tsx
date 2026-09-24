'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  /** bottom sheet on mobile, centered dialog on desktop */
  className?: string
}

export function Sheet({ open, onOpenChange, title, description, children, footer, className }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-[fade-in_180ms_ease-out]" />
        <Dialog.Content
          dir="rtl"
          className={cn(
            'fixed z-[61] flex max-h-[88dvh] w-full flex-col bg-surface text-ink shadow-e3 outline-none',
            'inset-x-0 bottom-0 rounded-t-[22px] data-[state=open]:animate-[sheet-up_260ms_cubic-bezier(.2,.8,.2,1)]',
            'md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[82vh] md:w-[min(560px,92vw)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[22px] md:data-[state=open]:animate-[pop-in_220ms_cubic-bezier(.2,.8,.2,1)]',
            className,
          )}
        >
          <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-strong md:hidden" aria-hidden />
          <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-3 md:pt-5">
            <div>
              <Dialog.Title className="text-[17px] font-bold">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-0.5 text-[13px] text-muted">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="grid size-9 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-3" aria-label="بستن">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
          {footer ? <div className="border-t border-line px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
