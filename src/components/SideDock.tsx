import { useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import { IconChevronLeft } from './icons'

// A drawer that hides at the right edge of the screen, leaving only a slim tab showing.
// Clicking (or tapping) the tab slides it out; clicking it again, clicking elsewhere, or pressing Escape closes it.
// To add controls, drop a <DockGroup> with <DockButton>s into the children.
export function SideDock({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className={`fixed right-0 top-1/2 z-40 flex -translate-y-1/2 items-center gap-1.5 transition-transform duration-300 ease-out ${
        open ? 'translate-x-0' : 'translate-x-[calc(100%-1.75rem)]'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="side-dock-panel"
        aria-label={open ? 'Hide quick settings' : 'Show quick settings'}
        className="flex h-14 w-7 shrink-0 items-center justify-center rounded-l-xl border border-r-0 border-border/70 bg-card/80 text-text-secondary shadow-soft backdrop-blur transition-colors hover:text-primary"
      >
        <IconChevronLeft width={16} height={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id="side-dock-panel"
        className={`mr-2 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/95 p-2.5 shadow-soft backdrop-blur transition-[visibility] duration-300 ${
          open ? 'visible' : 'invisible'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export function DockGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col items-start gap-1 sm:items-center">
      <span className="px-0.5 text-[10px] font-mono uppercase tracking-wider text-text-secondary">{label}</span>
      <div className="flex gap-1 sm:flex-col">{children}</div>
    </div>
  )
}

interface DockButtonProps {
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  active?: boolean
  onClick: () => void
  sound?: 'chime' | 'none' // which UI sound a click makes; the default is a soft tick
}

export function DockButton({ label, Icon, active = false, onClick, sound }: DockButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      data-sound={sound}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
        active
          ? 'border-primary/60 bg-primary/15 text-primary'
          : 'border-transparent text-text-secondary hover:bg-text-primary/[0.06] hover:text-text-primary'
      }`}
    >
      <Icon width={18} height={18} />
    </button>
  )
}

interface DockLinkProps {
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  href: string
}

// A drawer button that opens a link (mailto: links stay in the page, everything else opens a new tab).
export function DockLink({ label, Icon, href }: DockLinkProps) {
  const isMail = href.startsWith('mailto:')
  return (
    <a
      href={href}
      target={isMail ? undefined : '_blank'}
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-text-secondary transition-colors hover:bg-text-primary/[0.06] hover:text-text-primary"
    >
      <Icon width={18} height={18} />
    </a>
  )
}
