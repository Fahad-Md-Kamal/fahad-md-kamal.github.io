import { useEffect } from 'react'
import { playChime, playClose, playOpen, playTap, unlockAudio } from '@/lib/sound'

// Renders nothing. Watches the page and plays the small UI sounds:
//  - a soft tick for buttons, links and tiles (a theme change plays a chime instead)
//  - a quiet whoosh when a sheet or popup opens or closes (they all lock page scroll)
// Fireworks sounds are played by the background effects themselves.
const INTERACTIVE = 'button, a[href], summary, [role=button], [role=tab], [role=radio]'

export default function SoundEffects() {
  useEffect(() => {
    // Browsers only allow audio after a gesture, so get ready on the first one.
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, true)
    window.addEventListener('keydown', unlock, true)

    let pendingTap = 0
    let locked = document.body.style.overflow === 'hidden'

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      const control = target?.closest?.(INTERACTIVE) as HTMLElement | null
      if (!control) return
      if (control.hasAttribute('disabled') || control.getAttribute('aria-disabled') === 'true') return
      const kind = control.closest<HTMLElement>('[data-sound]')?.dataset.sound
      if (kind === 'none') return
      // Wait a moment: if this click opens or closes a sheet, the whoosh replaces the tick.
      window.clearTimeout(pendingTap)
      pendingTap = window.setTimeout(kind === 'chime' ? playChime : playTap, 40)
    }
    document.addEventListener('click', onClick, true)

    const observer = new MutationObserver(() => {
      const nowLocked = document.body.style.overflow === 'hidden'
      if (nowLocked === locked) return
      locked = nowLocked
      window.clearTimeout(pendingTap)
      if (nowLocked) playOpen()
      else playClose()
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })

    return () => {
      window.removeEventListener('pointerdown', unlock, true)
      window.removeEventListener('keydown', unlock, true)
      document.removeEventListener('click', onClick, true)
      observer.disconnect()
      window.clearTimeout(pendingTap)
    }
  }, [])

  return null
}
