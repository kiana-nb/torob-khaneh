'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const COMPARE_MAX = 4

interface ShortlistState {
  saved: string[]
  compare: string[]
  toggleSaved: (id: string) => void
  toggleCompare: (id: string) => { ok: boolean; reason?: 'full' }
  clearCompare: () => void
  removeCompare: (id: string) => void
}

export const useShortlist = create<ShortlistState>()(
  persist(
    (set, get) => ({
      saved: [],
      compare: [],
      toggleSaved: (id) => set((s) => ({ saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved] })),
      toggleCompare: (id) => {
        const { compare } = get()
        if (compare.includes(id)) {
          set({ compare: compare.filter((x) => x !== id) })
          return { ok: true }
        }
        if (compare.length >= COMPARE_MAX) return { ok: false, reason: 'full' }
        set({ compare: [...compare, id] })
        return { ok: true }
      },
      removeCompare: (id) => set((s) => ({ compare: s.compare.filter((x) => x !== id) })),
      clearCompare: () => set({ compare: [] }),
    }),
    { name: 'torob-khaneh:shortlist', storage: createJSONStorage(() => localStorage) },
  ),
)

interface UiState {
  hoveredId: string | null
  setHovered: (id: string | null) => void
  toast: { id: number; text: string } | null
  showToast: (text: string) => void
}

export const useUi = create<UiState>()((set) => ({
  hoveredId: null,
  setHovered: (id) => set({ hoveredId: id }),
  toast: null,
  showToast: (text) => {
    const id = Date.now()
    set({ toast: { id, text } })
    setTimeout(() => set((s) => (s.toast?.id === id ? { toast: null } : s)), 2600)
  },
}))
