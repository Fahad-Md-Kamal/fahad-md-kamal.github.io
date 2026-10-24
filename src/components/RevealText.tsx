import React, { useMemo } from 'react'
import { useInView } from '../hooks/useInView'

interface RevealTextProps {
  text: string
  as?: React.ElementType
  className?: string
  delay?: number
}

// Softly brings text into focus once it scrolls into view: each word fades in, rises a few
// pixels and sharpens from a light blur, one after another. The words keep their space from the
// start, so nothing shifts while it plays.
export default function RevealText({ text, as: Tag = 'span', className, delay = 0 }: RevealTextProps) {
  const { ref, inView } = useInView<HTMLElement>()
  const reduceMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])

  const parts = text.split(/(\s+)/)
  const wordCount = parts.filter(part => part && !/^\s+$/.test(part)).length
  const stagger = Math.min(70, 420 / Math.max(1, wordCount))

  let word = 0
  const children = parts.map((part, i) => {
    if (!part || /^\s+$/.test(part)) return part
    const wait = delay + word++ * stagger
    return (
      <span
        key={i}
        className="inline-block"
        style={{
          opacity: inView ? 1 : 0,
          filter: inView ? 'blur(0px)' : 'blur(6px)',
          transform: inView ? 'translateY(0)' : 'translateY(0.4em)',
          transition: reduceMotion
            ? 'none'
            : `opacity 750ms ease ${wait}ms, filter 750ms ease ${wait}ms, transform 750ms cubic-bezier(0.22, 1, 0.36, 1) ${wait}ms`,
        }}
      >
        {part}
      </span>
    )
  })

  return React.createElement(
    Tag,
    { ref, className, 'aria-label': text },
    React.createElement('span', { 'aria-hidden': 'true' }, children)
  )
}
