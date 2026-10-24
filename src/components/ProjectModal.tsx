import { useEffect, useRef } from 'react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import type { Project } from '../types'
import { Button } from './ui/button'
import { ProjectImage } from './ProjectImage'
import {
  IconActivity,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconClose,
  IconCode,
  IconCpu,
  IconDollar,
  IconExternalLink,
  IconEye,
  IconFlag,
  IconGithub,
  IconGlobe,
  IconHeartPulse,
  IconLayers,
  IconLightbulb,
  IconLock,
  IconMessage,
  IconPlay,
  IconServer,
  IconShield,
  IconSmartphone,
  IconSparkles,
  IconTarget,
  IconTrendingUp,
  IconWorkflow,
  IconZap,
} from './icons'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

// The "results" in the data use many different labels; pick an icon by what they are about.
const IMPACT_ICONS: [RegExp, IconType][] = [
  [/secur|auth|iam|access|isolat|privacy|safety/, IconShield],
  [/perform|scale|concurren|uptime|efficien|speed|latenc/, IconZap],
  [/^ai$|detect|precis|process|learn|llm/, IconCpu],
  [/automat|workflow|pipeline|deploy|integrat/, IconWorkflow],
  [/real.?time/, IconActivity],
  [/financ|billing|reconcil|payment|cost/, IconDollar],
  [/health|clinic/, IconHeartPulse],
  [/mobile/, IconSmartphone],
  [/observ|monitor/, IconEye],
]

const IMPACT_LABELS: Record<string, string> = {
  ai: 'AI',
  iam: 'IAM',
  realtime: 'Real-time',
  publichealth: 'Public health',
}

const impactIcon = (key: string): IconType => IMPACT_ICONS.find(([pattern]) => pattern.test(key.toLowerCase()))?.[1] ?? IconTarget

const impactLabel = (key: string) => {
  const lower = key.toLowerCase()
  if (IMPACT_LABELS[lower]) return IMPACT_LABELS[lower]
  const spaced = key.replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const formatMonth = (value: string) => {
  const date = new Date(`${value}-01T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const chipClass =
  'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-xs font-medium text-text-secondary'

function SectionHeading({ Icon, tone = 'primary', children }: { Icon: IconType; tone?: 'primary' | 'secondary'; children: ReactNode }) {
  const toneClass = tone === 'primary' ? 'border-primary/25 bg-primary/10 text-primary' : 'border-secondary/25 bg-secondary/10 text-secondary'
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${toneClass}`}>
        <Icon width={16} height={16} />
      </span>
      <h4 className="font-display text-base font-semibold text-text-primary">{children}</h4>
    </div>
  )
}

function LinkButton({ href, Icon, children, tone }: { href: string; Icon: IconType; children: ReactNode; tone: 'primary' | 'outline' | 'secondary' }) {
  const toneClass = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-border/70 text-text-primary hover:border-primary/50 hover:text-primary',
    secondary: 'border border-secondary/50 text-secondary hover:bg-secondary/10',
  }[tone]
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors ${toneClass}`}
    >
      <Icon width={16} height={16} />
      {children}
      <IconExternalLink width={13} height={13} className="opacity-70" />
    </a>
  )
}

export default function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const isNda = project.type === 'NDA'
  const inProgress = project.status === 'In Progress'
  const timeline = `${formatMonth(project.startDate)} – ${project.endDate ? formatMonth(project.endDate) : 'Present'}`
  const { live, github, demo } = project.links
  const hasLinks = (!isNda && !!live) || !!github || !!demo

  const specs: { Icon: IconType; label: string; value?: string }[] = project.architecture
    ? [
        { Icon: IconLayers, label: 'Pattern', value: project.architecture.pattern },
        { Icon: IconTrendingUp, label: 'Scale', value: project.architecture.scale },
        { Icon: IconServer, label: 'Infrastructure', value: project.architecture.infrastructure },
        { Icon: IconMessage, label: 'Messaging', value: project.architecture.messaging },
        { Icon: IconSparkles, label: 'AI stack', value: project.architecture.ai_stack },
      ].filter(spec => spec.value)
    : []

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto overscroll-contain bg-black/70 animate-fade-in sm:items-center sm:px-4 sm:py-8"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-t-3xl border border-border/60 bg-surface shadow-glow-lg animate-sheet-up sm:max-h-[88vh] sm:rounded-2xl sm:animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Stays in view while the content scrolls */}
        <div className="sticky top-0 z-10 h-0">
          <span className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-black/40 ring-1 ring-white/70 sm:hidden" aria-hidden="true" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
          >
            <IconClose />
          </button>
        </div>

        <ProjectImage
          project={project}
          className="relative aspect-[16/9] w-full overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/10 via-surface to-secondary/10"
        />

        {/* Header */}
        <div className="p-5 sm:p-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <IconLayers width={13} height={13} />
              {project.category}
            </span>
            {project.featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
                <IconSparkles width={13} height={13} />
                Featured
              </span>
            )}
          </div>

          <h3 id="project-modal-title" className="font-display text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
            {project.title}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">{project.shortDescription}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={chipClass}>
              {inProgress ? (
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
              ) : (
                <IconCheck width={13} height={13} className="text-green-400" />
              )}
              {project.status}
            </span>
            <span className={chipClass}>
              <IconCalendar width={13} height={13} />
              {timeline}
            </span>
            <span className={chipClass}>
              {isNda ? <IconLock width={13} height={13} /> : <IconCode width={13} height={13} />}
              {isNda ? 'Client work · NDA' : 'Personal project'}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {!isNda && live && (
              <LinkButton href={live} Icon={IconGlobe} tone="primary">
                Live site
              </LinkButton>
            )}
            {github && (
              <LinkButton href={github} Icon={IconGithub} tone="outline">
                Source code
              </LinkButton>
            )}
            {demo && (
              <LinkButton href={demo} Icon={IconPlay} tone="secondary">
                Demo
              </LinkButton>
            )}
            {!hasLinks && (
              <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-border/70 px-4 text-sm text-text-secondary">
                <IconLock width={15} height={15} />
                {isNda ? 'Details are shared under NDA' : 'Private project'}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-8 border-t border-border/60 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 space-y-8">
            {project.context && (
              <section className="rounded-2xl border border-secondary/25 bg-secondary/[0.06] p-4 sm:p-5">
                <SectionHeading Icon={IconFlag} tone="secondary">
                  The challenge
                </SectionHeading>
                <p className="leading-relaxed text-text-primary">{project.context}</p>
              </section>
            )}

            <section>
              <SectionHeading Icon={IconCode}>What I built</SectionHeading>
              <p className="leading-relaxed text-text-secondary">{project.description}</p>
            </section>

            {project.impact && (
              <section>
                <SectionHeading Icon={IconTrendingUp}>Results</SectionHeading>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(project.impact).map(([key, value]) => {
                    const Icon = impactIcon(key)
                    return (
                      <div key={key} className="flex gap-3 rounded-xl border border-border/60 bg-background/40 p-3.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                          <Icon width={17} height={17} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono uppercase tracking-wider text-primary">{impactLabel(key)}</div>
                          <p className="mt-0.5 text-sm leading-relaxed text-text-primary">{value}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {project.design_decisions && project.design_decisions.length > 0 && (
              <section>
                <SectionHeading Icon={IconLightbulb} tone="secondary">
                  Key decisions
                </SectionHeading>
                <ol className="space-y-3">
                  {project.design_decisions.map((decision, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-secondary/30 bg-secondary/10 font-mono text-xs text-secondary">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-text-secondary">{decision}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          <aside className="min-w-0 space-y-4">
            {specs.length > 0 && (
              <section className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <SectionHeading Icon={IconServer}>Architecture</SectionHeading>
                <dl className="space-y-3.5">
                  {specs.map(({ Icon, label, value }) => (
                    <div key={label} className="flex gap-3">
                      <Icon width={16} height={16} className="mt-0.5 shrink-0 text-text-secondary" />
                      <div className="min-w-0">
                        <dt className="text-[11px] font-mono uppercase tracking-wider text-text-secondary">{label}</dt>
                        <dd className="mt-0.5 text-sm leading-snug text-text-primary">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <SectionHeading Icon={IconCpu}>Tech stack</SectionHeading>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map(tech => (
                  <span
                    key={tech.name}
                    className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-surface/60 px-2.5 py-1.5 font-mono text-xs text-text-primary"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tech.color }} aria-hidden="true" />
                    {tech.name}
                  </span>
                ))}
              </div>
            </section>
          </aside>

          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-4 sm:flex-row sm:items-center sm:p-5 lg:col-span-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                <IconMessage width={18} height={18} />
              </span>
              <p className="text-sm text-text-primary sm:text-base">Need something similar built for your product?</p>
            </div>
            <Button
              onClick={() => {
                onClose()
                setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 50)
              }}
              className="gap-2"
            >
              Let&apos;s talk
              <IconArrowRight width={16} height={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
