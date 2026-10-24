import { useEffect, useRef } from 'react'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useEffectsEnabled } from '@/lib/effects'
import { useTheme } from '@/lib/theme'
import { FIREWORK_BANG_AT, claimAmbientSlot, hasFireworkSample, playBang, playFirework, playLaunch } from '@/lib/sound'

// A fixed canvas that sits between the sections' backgrounds and their content (see the
// "background effects" rule in index.css). The scene changes with the section being read:
// stars, drifting code symbols, a network, embers, falling binary, and fireworks.

type SceneName = 'stars' | 'glyphs' | 'network' | 'embers' | 'binary' | 'fireworks'

const SCENE_FOR_SECTION: Record<string, SceneName> = {
  hero: 'stars',
  about: 'glyphs',
  skills: 'glyphs',
  projects: 'network',
  services: 'network',
  testimonials: 'embers',
  experience: 'embers',
  education: 'embers',
  certifications: 'embers',
  github: 'network',
  blogs: 'embers',
  playground: 'binary',
  contact: 'fireworks',
}

type Kind = 'star' | 'glyph' | 'node' | 'ember' | 'bin' | 'shoot' | 'rocket' | 'spark' | 'flash'

interface Particle {
  kind: Kind
  x: number
  y: number
  vx: number
  vy: number
  size: number
  age: number
  born: number // seconds since spawn, drives the fade-in
  life: number
  phase: number
  speed: number
  color: keyof Palette
  ch: string
  dying: number // seconds since it started fading out; -1 while alive
  px: number // previous position, for trails
  py: number
  ty: number // rocket target height
}

interface Palette {
  star: string
  primary: string
  secondary: string
  gold: string
  pink: string
}

const GLYPHS = ['{ }', '</>', '=>', '[ ]', '( )', '#', '&&', '0x', 'λ', '::', '//', '++']
const AMBIENT: Kind[] = ['star', 'glyph', 'node', 'ember', 'bin', 'shoot']
const FADE_IN = 0.9
const FADE_OUT = 0.7
const MAX_SPARKS = 900

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

function readPalette(light: boolean): Palette {
  const primary = cssVar('--primary') || '199 89% 55%'
  const secondary = cssVar('--secondary') || '267 80% 74%'
  return light
    ? { star: primary, primary, secondary, gold: '38 92% 45%', pink: '330 75% 52%' }
    : { star: cssVar('--text-primary') || '220 20% 93%', primary, secondary, gold: '45 100% 62%', pink: '330 90% 68%' }
}

function createEngine(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  let w = 0
  let h = 0
  let dpr = 1
  let palette = readPalette(false)
  let intensity = 1
  let scene: SceneName = 'stars'
  let particles: Particle[] = []
  let enabled = true
  let reduced = false
  let raf = 0
  let last = 0
  let rocketTimer = 1.2
  let shootTimer = 1

  const mobile = () => w < 640
  const density = () => (mobile() ? 0.7 : 1)

  const make = (kind: Kind, over: Partial<Particle> = {}): Particle => ({
    kind, x: 0, y: 0, vx: 0, vy: 0, size: 1, age: 0, born: 0, life: Infinity, phase: rand(0, 6.28), speed: 1,
    color: 'star', ch: '', dying: -1, px: 0, py: 0, ty: 0, ...over,
  })

  const pickColor = (): keyof Palette => {
    const r = Math.random()
    return r < 0.62 ? 'star' : r < 0.82 ? 'primary' : 'secondary'
  }

  const spawnStar = () =>
    make('star', { x: rand(0, w), y: rand(0, h), size: rand(0.5, 1.7), speed: rand(0.6, 2.2), color: pickColor() })

  const spawnGlyph = (scatter: boolean) => {
    const vy = -rand(10, 26)
    const life = (h + 60) / -vy
    const age = scatter ? rand(0, life * 0.9) : 0
    return make('glyph', {
      x: rand(0, w), y: h + 24 + vy * age, vx: rand(-5, 5), vy, size: rand(12, 22), age, life,
      ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], color: Math.random() < 0.5 ? 'primary' : 'secondary',
    })
  }

  const spawnNode = () =>
    make('node', { x: rand(0, w), y: rand(0, h), vx: rand(-14, 14), vy: rand(-14, 14), size: rand(1.3, 2.4), color: Math.random() < 0.7 ? 'primary' : 'secondary' })

  const spawnEmber = (scatter: boolean) => {
    const vy = -rand(16, 44)
    const life = (h + 40) / -vy
    const age = scatter ? rand(0, life * 0.9) : 0
    return make('ember', {
      x: rand(0, w), y: h + 10 + vy * age, vy, size: rand(1, 2.8), age, life,
      color: Math.random() < 0.5 ? 'gold' : Math.random() < 0.5 ? 'primary' : 'secondary',
    })
  }

  const spawnBin = (scatter: boolean, x?: number) =>
    make('bin', {
      x: x ?? rand(0, w), y: scatter ? rand(-h * 0.2, h) : rand(-120, -10), vy: rand(70, 190), size: 14,
      ch: Math.random() < 0.5 ? '0' : '1', color: Math.random() < 0.8 ? 'primary' : 'secondary', speed: rand(0.15, 0.4),
    })

  const populate = (scatter: boolean) => {
    const area = w * h
    const d = density()
    const add = (n: number, fn: () => Particle) => {
      for (let i = 0; i < n; i++) particles.push(fn())
    }
    switch (scene) {
      case 'stars':
        add(Math.round(clamp(area / 10000, 35, 130) * d), spawnStar)
        break
      case 'glyphs':
        add(Math.round(clamp(area / 45000, 8, 26) * d), () => spawnGlyph(scatter))
        break
      case 'network':
        add(Math.round(clamp(area / 22000, 18, 55) * d), spawnNode)
        break
      case 'embers':
        add(Math.round(clamp(area / 30000, 10, 36) * d), () => spawnEmber(scatter))
        break
      case 'binary': {
        const cols = Math.round(clamp(w / 24, 14, 62) * d)
        for (let i = 0; i < cols; i++) particles.push(spawnBin(scatter, ((i + 0.5) / cols) * w))
        for (let i = 0; i < Math.round(cols * 0.5); i++) particles.push(spawnBin(scatter)) // extra streams at random columns
        break
      }
      case 'fireworks':
        add(Math.round(clamp(area / 16000, 18, 70) * d), spawnStar) // a faint night sky behind the fireworks
        break
    }
  }

  const setScene = (next: SceneName) => {
    if (next === scene && particles.length) return
    scene = next
    // Old ambient particles fade out; new ones fade in. Fireworks in flight finish on their own.
    for (const p of particles) if (AMBIENT.includes(p.kind) && p.dying < 0) p.dying = 0
    if (reduced) {
      particles = []
      scene = 'stars'
    }
    populate(true)
    if (reduced) drawStatic()
  }

  const burst = (x: number, y: number, power = 1, ambient = false, audible = true) => {
    if (particles.filter(p => p.kind === 'spark').length > MAX_SPARKS) return
    const base: (keyof Palette)[] = ['primary', 'secondary', 'gold', 'pink', 'star']
    const main = base[Math.floor(Math.random() * base.length)]
    const accent = base[Math.floor(Math.random() * base.length)]
    const shape = Math.random()
    const n = Math.round((mobile() ? 46 : 78) * power)
    const reach = mobile() ? 0.8 : 1
    const sparks = (count: number, speedMin: number, speedMax: number, ring: boolean, tint: keyof Palette) => {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + rand(-0.06, 0.06)
        const speed = (ring ? (speedMin + speedMax) / 2 : rand(speedMin, speedMax)) * reach * power
        particles.push(make('spark', {
          x, y, px: x, py: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: rand(1.6, 2.8),
          life: rand(1.3, 2.1), color: Math.random() < 0.8 ? tint : accent, speed: Math.random() < 0.35 ? 2 : 1, // speed 2 = glitters
        }))
      }
    }
    if (shape < 0.4) sparks(n, 140, 400, false, main) // classic sphere
    else if (shape < 0.7) sparks(n, 300, 340, true, main) // clean ring
    else {
      sparks(Math.round(n * 0.6), 330, 370, true, main) // ring with a starburst inside
      sparks(Math.round(n * 0.5), 100, 260, false, accent)
    }
    particles.push(make('flash', { x, y, size: 110 * power * reach, life: 0.45, color: main }))
    if (audible) playBang(power, ambient)
  }

  const launchRocket = (audible: boolean) => {
    const x = rand(w * 0.12, w * 0.88)
    const ty = rand(h * 0.14, h * 0.5)
    particles.push(make('rocket', { x, y: h + 8, px: x, py: h + 8, vy: -(h - ty) / FIREWORK_BANG_AT, vx: rand(-14, 14), ty, size: 2, color: 'gold', speed: audible ? 1 : 0 }))
  }

  const update = (dt: number) => {
    for (const p of particles) {
      p.age += dt
      p.born += dt
      if (p.dying >= 0) p.dying += dt
      p.px = p.x
      p.py = p.y
      switch (p.kind) {
        case 'glyph':
        case 'ember':
          p.x += (p.vx + (p.kind === 'ember' ? Math.sin(p.age * 1.4 + p.phase) * 12 : 0)) * dt
          p.y += p.vy * dt
          break
        case 'node':
          p.x += p.vx * dt
          p.y += p.vy * dt
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
          break
        case 'bin':
          p.y += p.vy * dt
          if (Math.floor(p.age / p.speed) !== Math.floor((p.age - dt) / p.speed)) p.ch = Math.random() < 0.5 ? '0' : '1'
          break
        case 'shoot':
          p.x += p.vx * dt
          p.y += p.vy * dt
          break
        case 'rocket':
          p.x += p.vx * dt
          p.y += p.vy * dt
          if (p.y <= p.ty) {
            burst(p.x, p.y, 1, true, p.speed === 1 && !hasFireworkSample())
            p.life = 0
          }
          break
        case 'spark': {
          const drag = Math.pow(0.985, dt * 60)
          p.vx *= drag
          p.vy = p.vy * drag + 170 * dt
          p.x += p.vx * dt
          p.y += p.vy * dt
          break
        }
      }
    }

    // Recycle particles that finished, and keep the current scene topped up.
    const keep: Particle[] = []
    for (const p of particles) {
      const gone =
        p.age >= p.life ||
        (p.dying > FADE_OUT) ||
        (p.kind === 'bin' && p.y > h + 30 && p.dying < 0) ||
        (p.kind === 'shoot' && (p.x > w + 80 || p.y > h + 80))
      if (!gone) {
        keep.push(p)
        continue
      }
      if (p.dying >= 0 || p.kind === 'spark' || p.kind === 'rocket' || p.kind === 'shoot') continue
      if (p.kind === 'glyph') keep.push(spawnGlyph(false))
      else if (p.kind === 'ember') keep.push(spawnEmber(false))
      else if (p.kind === 'bin') keep.push({ ...spawnBin(false, p.x) })
    }
    particles = keep

    if (scene === 'fireworks') {
      rocketTimer -= dt
      if (rocketTimer <= 0) {
        const volley = Math.random() < 0.35 ? 3 : Math.random() < 0.6 ? 2 : 1
        // Only one rocket per volley makes sound, and only when the sky has been quiet for a moment.
        // With the recording, one sound covers the whole launch: whistle on the way up, bang as it opens.
        const loud = claimAmbientSlot()
        if (loud && !playFirework()) playLaunch(FIREWORK_BANG_AT)
        for (let i = 0; i < volley; i++) launchRocket(loud && i === 0)
        rocketTimer = rand(0.8, 1.7)
      }
    }
    if (scene === 'stars') {
      shootTimer -= dt
      if (shootTimer <= 0) {
        const count = Math.random() < 0.3 ? 2 : 1
        for (let i = 0; i < count; i++) {
          const x = rand(0, w * 0.7)
          const y = rand(0, h * 0.4)
          particles.push(make('shoot', { x, y, px: x, py: y, vx: rand(420, 760), vy: rand(160, 320), life: rand(0.55, 0.95), color: 'star', size: 1.6 }))
        }
        shootTimer = rand(1.1, 3)
      }
    }
  }

  const fill = (c: keyof Palette, a: number) => `hsl(${palette[c]} / ${clamp(a, 0, 1).toFixed(3)})`

  const alphaOf = (p: Particle) => {
    const fadeIn = clamp(p.born / FADE_IN, 0, 1)
    const fadeOut = p.dying >= 0 ? clamp(1 - p.dying / FADE_OUT, 0, 1) : 1
    return fadeIn * fadeOut * intensity
  }

  const draw = () => {
    ctx.clearRect(0, 0, w, h)
    ctx.lineCap = 'round'

    for (const p of particles) {
      const a = alphaOf(p)
      switch (p.kind) {
        case 'star': {
          const tw = 0.45 + 0.55 * Math.sin(p.phase + p.age * p.speed)
          ctx.fillStyle = fill(p.color, a * tw * 0.85)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, 6.2832)
          ctx.fill()
          if (p.size > 1.25 && tw > 0.7) {
            ctx.strokeStyle = fill(p.color, a * tw * 0.35)
            ctx.lineWidth = 0.7
            const r = p.size * 3.6 * tw
            ctx.beginPath()
            ctx.moveTo(p.x - r, p.y)
            ctx.lineTo(p.x + r, p.y)
            ctx.moveTo(p.x, p.y - r)
            ctx.lineTo(p.x, p.y + r)
            ctx.stroke()
          }
          break
        }
        case 'glyph': {
          const env = Math.sin(Math.PI * clamp(p.age / p.life, 0, 1))
          ctx.font = `${p.size}px "JetBrains Mono", monospace`
          ctx.fillStyle = fill(p.color, a * env * 0.2)
          ctx.fillText(p.ch, p.x, p.y)
          break
        }
        case 'ember': {
          const env = Math.sin(Math.PI * clamp(p.age / p.life, 0, 1))
          ctx.fillStyle = fill(p.color, a * env * 0.12)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3.2, 0, 6.2832)
          ctx.fill()
          ctx.fillStyle = fill(p.color, a * env * 0.6)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, 6.2832)
          ctx.fill()
          break
        }
        case 'node':
          ctx.fillStyle = fill(p.color, a * 0.55)
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, 6.2832)
          ctx.fill()
          break
        case 'bin': {
          ctx.font = `${p.size}px "JetBrains Mono", monospace`
          for (let i = 0; i < 5; i++) {
            ctx.fillStyle = fill(p.color, a * (i === 0 ? 0.32 : 0.2 / (i + 0.5)))
            ctx.fillText(i === 0 ? p.ch : (i % 2 ? '1' : '0'), p.x, p.y - i * 17)
          }
          break
        }
        case 'shoot': {
          const t = clamp(p.age / p.life, 0, 1)
          const al = Math.sin(Math.PI * t) * intensity
          const tx = p.x - p.vx * 0.14
          const ty = p.y - p.vy * 0.14
          const g = ctx.createLinearGradient(p.x, p.y, tx, ty)
          g.addColorStop(0, fill(p.color, al * 0.9))
          g.addColorStop(1, fill(p.color, 0))
          ctx.strokeStyle = g
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(tx, ty)
          ctx.stroke()
          break
        }
        case 'rocket':
          ctx.strokeStyle = fill('gold', 0.9 * intensity)
          ctx.lineWidth = 2.4
          ctx.beginPath()
          ctx.moveTo(p.x - p.vx * 0.09, p.y - p.vy * 0.09)
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
          break
        case 'spark': {
          const t = clamp(p.age / p.life, 0, 1)
          let al = (1 - t) * (1 - t) * intensity
          if (p.speed > 1 && t > 0.35) al *= 0.55 + 0.45 * Math.sin(p.age * 38 + p.phase) // glitter as it fades
          ctx.strokeStyle = fill(p.color, al)
          ctx.lineWidth = p.size * (1 - t * 0.5)
          ctx.beginPath()
          ctx.moveTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045) // a longer streak than one frame's movement
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
          break
        }
        case 'flash': {
          const t = clamp(p.age / p.life, 0, 1)
          const r = p.size * (0.4 + t * 0.9)
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
          g.addColorStop(0, fill(p.color, (1 - t) * 0.42 * intensity))
          g.addColorStop(1, fill(p.color, 0))
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, 6.2832)
          ctx.fill()
          break
        }
      }
    }

    if (scene === 'network') {
      const reach = mobile() ? 100 : 140
      const nodes = particles.filter(p => p.kind === 'node')
      ctx.lineWidth = 0.8
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.hypot(dx, dy)
          if (d > reach) continue
          const a = Math.min(alphaOf(nodes[i]), alphaOf(nodes[j]))
          ctx.strokeStyle = fill('primary', (1 - d / reach) * 0.3 * a)
          ctx.beginPath()
          ctx.moveTo(nodes[i].x, nodes[i].y)
          ctx.lineTo(nodes[j].x, nodes[j].y)
          ctx.stroke()
        }
      }
    }
  }

  // Reduced motion: one still frame of stars, no animation.
  const drawStatic = () => {
    for (const p of particles) p.born = FADE_IN
    draw()
  }

  const frame = (t: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (t - last) / 1000)
    last = t
    // Nothing to see while the tab is hidden or a sheet/popup covers the page.
    if (document.hidden || document.body.style.overflow === 'hidden') return
    update(dt)
    draw()
  }

  const run = () => {
    cancelAnimationFrame(raf)
    if (!enabled) {
      ctx.clearRect(0, 0, w, h)
      return
    }
    if (reduced) {
      drawStatic()
      return
    }
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const nextW = Math.round(rect.width)
    const nextH = Math.round(rect.height)
    if (!nextW || !nextH) return
    const widthChanged = nextW !== w
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = nextW
    h = nextH
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (widthChanged || !particles.length) {
      particles = particles.filter(p => !AMBIENT.includes(p.kind))
      populate(true)
    }
    if (reduced || !enabled) run()
  }

  const onClick = (e: MouseEvent) => {
    if (!enabled || reduced || document.body.style.overflow === 'hidden') return
    const target = e.target as HTMLElement | null
    // Only bare background taps: not text, links, buttons, form fields or popups.
    if (!target || !['SECTION', 'MAIN', 'FOOTER', 'DIV', 'BODY', 'HTML'].includes(target.tagName)) return
    if (target.closest('a, button, input, textarea, select, label, summary, [role=dialog], [role=button], [contenteditable]')) return
    burst(e.clientX, e.clientY, 1.2)
  }

  return {
    start() {
      resize()
      window.addEventListener('click', onClick)
      run()
    },
    stop() {
      cancelAnimationFrame(raf)
      window.removeEventListener('click', onClick)
    },
    resize,
    setScene,
    setEnabled(next: boolean) {
      enabled = next
      run()
    },
    setReduced(next: boolean) {
      reduced = next
      if (next) {
        particles = []
        scene = 'stars'
        populate(true)
      }
      run()
    },
    setTheme(light: boolean) {
      palette = readPalette(light)
      intensity = light ? 1.6 : 1 // the faint scenes need a little more strength against the tinted light page
      if (reduced || !enabled) run()
    },
  }
}

export default function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null)
  const section = useActiveSection()
  const { enabled } = useEffectsEnabled()
  const { resolved } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const engine = createEngine(canvas)
    engineRef.current = engine

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    engine.setTheme(document.documentElement.classList.contains('light'))
    engine.setReduced(motion.matches)
    engine.start()

    const onMotion = () => engine.setReduced(motion.matches)
    motion.addEventListener('change', onMotion)
    const observer = new ResizeObserver(() => engine.resize())
    observer.observe(canvas)

    return () => {
      motion.removeEventListener('change', onMotion)
      observer.disconnect()
      engine.stop()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    engineRef.current?.setTheme(resolved === 'light')
  }, [resolved])

  useEffect(() => {
    engineRef.current?.setEnabled(enabled)
  }, [enabled])

  useEffect(() => {
    engineRef.current?.setScene(SCENE_FOR_SECTION[section] ?? 'stars')
  }, [section])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-screen w-full supports-[height:100lvh]:h-[100lvh]"
    />
  )
}
