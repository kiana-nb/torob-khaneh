'use client'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

/** Inline script (in <head>) applies the saved theme before paint to avoid a flash. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('torob-khaneh:theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), [])
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('torob-khaneh:theme', next ? 'dark' : 'light')
    } catch {}
  }
  return (
    <button onClick={toggle} className="grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-surface-3 hover:text-ink" aria-label={dark ? 'حالت روشن' : 'حالت تاریک'}>
      {dark ? <Sun className="size-[19px]" /> : <Moon className="size-[19px]" />}
    </button>
  )
}
