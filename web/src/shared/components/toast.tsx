'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useUi } from '@/shared/lib/stores'

export function Toast() {
  const toast = useUi((s) => s.toast)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-[70] flex justify-center px-4 md:bottom-8" aria-live="polite">
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-surface shadow-e3"
          >
            {toast.text}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
