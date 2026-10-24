import { useEffect, useState } from 'react'

export const SECTION_IDS = [
  'hero', 'about', 'skills', 'projects', 'services', 'testimonials', 'experience',
  'education', 'certifications', 'github', 'blogs', 'playground', 'contact',
]

// The id of the section crossing the upper-middle of the screen.
// Looked up on every scroll because lazy sections replace their placeholder element.
export function useActiveSection(): string {
  const [active, setActive] = useState('hero')

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.4
      let current = 'hero'
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return active
}
