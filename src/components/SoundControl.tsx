import { useEffect, useMemo, useRef, useState } from 'react'
import { playTap, useSoundEnabled, useSoundVolume } from '@/lib/sound'
import { IconVolume, IconVolumeOff } from './icons'

// A speaker button that is always on the page, so sound can be switched on (it starts off) and the
// volume adjusted from anywhere.
// With a mouse, hovering the button slides a vertical volume slider up above it. On touch screens
// there is no hover: a tap opens the slider, another tap on the button mutes, and tapping
// anywhere else closes it.
export default function SoundControl() {
  const { enabled: sound, setEnabled: setSound } = useSoundEnabled()
  const { volume, setVolume } = useSoundVolume()
  const canHover = useMemo(() => window.matchMedia('(hover: hover)').matches, [])

  const [open, setOpen] = useState(false) // only used where there is no hover
  const rootRef = useRef<HTMLDivElement>(null)
  const lastPreview = useRef(0)

  const audible = sound && volume > 0

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const onButton = () => {
    if (!canHover && !open) setOpen(true)
    else setSound(!sound)
  }

  const onSlide = (value: number) => {
    setVolume(value / 100)
    const now = performance.now()
    if (now - lastPreview.current > 160) {
      lastPreview.current = now
      playTap() // a soft tick so the new level can be heard
    }
  }

  return (
    <div
      ref={rootRef}
      data-sound-control
      className="group fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3 z-40 md:bottom-6 md:right-6"
    >
      {/* The vertical slider: the padding underneath bridges the gap, so moving the mouse onto it keeps it open */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 pb-2 ${
          open ? 'block' : 'hidden [@media(hover:hover)]:group-has-[:focus-visible]:block [@media(hover:hover)]:group-hover:block'
        }`}
      >
        <div className="flex flex-col items-center gap-2 rounded-full border border-border/70 bg-card/95 px-2.5 py-3 shadow-soft backdrop-blur animate-fade-in">
          <span className="font-mono text-[10px] text-text-secondary">{Math.round(volume * 100)}</span>
          {/* A horizontal slider turned on its end, which works in every browser */}
          <div className="relative h-28 w-6">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              onChange={e => onSlide(Number(e.target.value))}
              aria-label="Volume"
              aria-orientation="vertical"
              data-sound="none"
              className={`absolute left-1/2 top-1/2 h-6 w-28 -translate-x-1/2 -translate-y-1/2 -rotate-90 cursor-pointer accent-[hsl(var(--primary))] ${sound ? '' : 'opacity-50'}`}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onButton}
        aria-label={sound ? 'Turn sound off' : 'Turn sound on'}
        aria-pressed={sound}
        aria-expanded={canHover ? undefined : open}
        title={sound ? 'Turn sound off' : 'Turn sound on'}
        className={`flex h-10 w-10 items-center justify-center rounded-full border bg-card/85 shadow-soft backdrop-blur transition-colors ${
          sound ? 'border-primary/60 text-primary' : 'border-border/70 text-text-secondary hover:text-text-primary'
        }`}
      >
        {audible ? <IconVolume width={18} height={18} /> : <IconVolumeOff width={18} height={18} />}
      </button>
    </div>
  )
}
