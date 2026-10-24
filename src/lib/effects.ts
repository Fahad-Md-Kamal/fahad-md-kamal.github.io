import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'effects'
const listeners = new Set<() => void>()

const read = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

let enabled = read()

export const setEffectsEnabled = (next: boolean) => {
  enabled = next
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
  } catch {
    // Not being able to remember the choice is fine.
  }
  listeners.forEach(listener => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useEffectsEnabled() {
  const value = useSyncExternalStore(subscribe, () => enabled)
  return { enabled: value, setEnabled: setEffectsEnabled }
}
