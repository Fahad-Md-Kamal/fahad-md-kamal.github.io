import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'

export const inputClass =
  'w-full min-w-0 rounded-xl border border-border/60 bg-background/60 px-3.5 py-2.5 sm:px-4 sm:py-3 text-base sm:text-sm font-mono text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary/60'

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-primary mb-1.5 sm:mb-2 block">
      {children}
    </label>
  )
}

interface SegmentedProps<T extends string> {
  label: string
  value: T
  options: { id: T; label?: string }[]
  onChange: (value: T) => void
  size?: 'md' | 'sm'
}

// A row of mutually exclusive buttons (radio group semantics).
export function Segmented<T extends string>({ label, value, options, onChange, size = 'md' }: SegmentedProps<T>) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {options.map(option => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          onClick={() => onChange(option.id)}
          className={`rounded-xl border font-mono transition-colors max-sm:min-h-9 ${
            size === 'sm' ? 'px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs' : 'px-3 py-1.5 text-[13px] sm:px-4 sm:py-2 sm:text-sm'
          } ${
            value === option.id
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-border/60 text-text-secondary hover:border-primary/40 hover:text-text-primary'
          }`}
        >
          {option.label ?? option.id}
        </button>
      ))}
    </div>
  )
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }
  return (
    <Button type="button" size="sm" variant="outline" onClick={copy}>
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

export function ResultBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-mono uppercase tracking-wider text-primary">{label}</div>
        <CopyButton text={value} />
      </div>
      <output
        aria-live="polite"
        className="block rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 sm:px-4 sm:py-3 text-[13px] sm:text-sm font-mono text-text-primary break-all select-all"
      >
        {value}
      </output>
    </div>
  )
}

// The Playground provides a place (its right-hand column) where each tool's note is shown.
// Outside the Playground, a Note simply renders where it is written.
export const NotesContext = createContext<{ target: HTMLElement | null } | null>(null)

export function Note({ title, children }: { title: string; children: ReactNode }) {
  const notes = useContext(NotesContext)
  const content = (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3.5 sm:p-4 text-[13px] sm:text-sm text-text-secondary leading-relaxed">
      <div className="font-display font-semibold text-text-primary mb-2">{title}</div>
      <div>{children}</div>
    </div>
  )
  if (!notes) return content
  // Wait until the column exists, then show the note there.
  return notes.target ? createPortal(content, notes.target) : null
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p className="text-[13px] sm:text-sm text-red-400" role="alert">
      {children}
    </p>
  )
}
