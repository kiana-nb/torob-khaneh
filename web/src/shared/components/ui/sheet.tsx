'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, MotionConfig, motion, useDragControls, type PanInfo, type Variants } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
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

const spring = { type: 'spring', stiffness: 420, damping: 38, mass: 0.9 } as const

const panel: Record<'mobile' | 'desktop', Variants> = {
  mobile: {
    hidden: { y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
    show: { y: 0, transition: { ...spring, staggerChildren: 0.045, delayChildren: 0.08 } },
  },
  desktop: {
    hidden: { opacity: 0, scale: 0.94, y: 18, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } },
    show: { opacity: 1, scale: 1, y: 0, transition: { ...spring, staggerChildren: 0.045, delayChildren: 0.06 } },
  },
}

/** Wrap each section of a sheet's body in this to have it fade up in sequence as the sheet opens. */
export function SheetItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 30 } } }}>
      {children}
    </motion.div>
  )
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return desktop
}

export function Sheet({ open, onOpenChange, title, description, children, footer, className }: SheetProps) {
  const desktop = useIsDesktop()
  const drag = useDragControls()
  // mobile: pull the handle/header down to dismiss
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onOpenChange(false)
  }

  return (
    <MotionConfig reducedMotion="user">
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <AnimatePresence>
          {open ? (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-[60] bg-black/40"
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(3px)' }}
                  exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  transition={{ duration: 0.22 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount dir="rtl">
                <motion.div
                  variants={panel[desktop ? 'desktop' : 'mobile']}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  drag={desktop ? false : 'y'}
                  dragControls={drag}
                  dragListener={false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.7 }}
                  onDragEnd={onDragEnd}
                  className={cn(
                    'fixed z-[61] flex max-h-[88dvh] w-full flex-col bg-surface text-ink shadow-e3 outline-none',
                    'inset-x-0 bottom-0 rounded-t-[22px]',
                    // centred without transforms, so framer-motion owns `transform`
                    'md:inset-0 md:m-auto md:h-fit md:max-h-[82vh] md:w-[min(560px,92vw)] md:rounded-[22px]',
                    className,
                  )}
                >
                  <div onPointerDown={(e) => { if (!desktop) drag.start(e) }} className="touch-none md:touch-auto">
                    <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-strong md:hidden" aria-hidden />
                    <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-3 md:pt-5">
                      <div>
                        <Dialog.Title className="text-[17px] font-bold">{title}</Dialog.Title>
                        {description ? <Dialog.Description className="mt-0.5 text-[13px] text-muted">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
                      </div>
                      <Dialog.Close className="grid size-9 shrink-0 place-items-center rounded-full text-ink-2 transition hover:rotate-90 hover:bg-surface-3 active:scale-90" aria-label="بستن">
                        <X className="size-5" />
                      </Dialog.Close>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
                  {footer ? <SheetItem className="border-t border-line px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">{footer}</SheetItem> : null}
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null}
        </AnimatePresence>
      </Dialog.Root>
    </MotionConfig>
  )
}
