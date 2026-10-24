import { useSyncExternalStore } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const THEME_COLORS: Record<ResolvedTheme, string> = { light: '#dbe0eb', dark: '#0B0F14' }

const listeners = new Set<() => void>()
const systemQuery = window.matchMedia('(prefers-color-scheme: light)')

const readPreference = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // Storage can be blocked (private windows); fall back to following the system.
  }
  return 'system'
}

let preference = readPreference()

const resolve = (pref: ThemePreference): ResolvedTheme =>
  pref === 'system' ? (systemQuery.matches ? 'light' : 'dark') : pref

// The dark palette is the default; the `light` class on <html> switches to the light one.
const apply = () => {
  const resolved = resolve(preference)
  const root = document.documentElement
  root.classList.toggle('light', resolved === 'light')
  root.style.colorScheme = resolved
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolved])
  listeners.forEach(listener => listener())
}

systemQuery.addEventListener('change', () => {
  if (preference === 'system') apply()
})

export const setTheme = (next: ThemePreference) => {
  preference = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Not being able to remember the choice is fine.
  }
  apply()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useTheme() {
  const pref = useSyncExternalStore(subscribe, () => preference)
  const resolved = useSyncExternalStore(subscribe, () => resolve(preference))
  return { preference: pref, resolved, setTheme }
}

apply()
