import type { ComponentType, SVGProps } from 'react'
import type { Profile } from '../types'
import {
  IconArrowDown,
  IconGithub,
  IconLinkedin,
  IconMail,
  IconTelegram,
  IconWhatsapp,
  IconX,
} from '@/components/icons'
import { whatsappGreeting, whatsappLink } from '@/lib/whatsapp'
import RevealText from './RevealText'
import Reveal from './Reveal'

interface FooterProps {
  profile: Profile
}

type IconType = ComponentType<SVGProps<SVGSVGElement>>

const EXPLORE_LINKS = [
  { label: 'About', id: 'about' },
  { label: 'Skills', id: 'skills' },
  { label: 'Projects', id: 'projects' },
  { label: 'Services', id: 'services' },
  { label: 'Experience', id: 'experience' },
  { label: 'Blog', id: 'blogs' },
  { label: 'Playground', id: 'playground' },
  { label: 'Contact', id: 'contact' },
]

const AVAILABILITY: Record<Profile['availability']['status'], { label: string; dot: string; tone: string }> = {
  open: { label: 'Available for new projects', dot: 'bg-green-500 animate-pulse', tone: 'border-green-500/25 bg-green-500/10 text-green-400' },
  busy: { label: 'Limited availability', dot: 'bg-amber-500', tone: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
  closed: { label: 'Not taking new work', dot: 'bg-text-secondary', tone: 'border-border/60 bg-surface text-text-secondary' },
}

export default function Footer({ profile }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const availability = AVAILABILITY[profile.availability.status] ?? AVAILABILITY.open

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const goToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  // Icon buttons where we have an icon; the rest fall back to a short mono label.
  const connect: { label: string; href: string; Icon?: IconType; short?: string }[] = [
    { label: 'Email', href: `mailto:${profile.contact?.email || profile.email}`, Icon: IconMail },
    {
      label: 'WhatsApp',
      href: whatsappLink(profile.contact?.phone || profile.phone, whatsappGreeting(profile.name)),
      Icon: IconWhatsapp,
    },
    { label: 'LinkedIn', href: profile.social.linkedin, Icon: IconLinkedin },
    { label: 'GitHub', href: profile.social.github, Icon: IconGithub },
    ...(profile.social.telegram ? [{ label: 'Telegram', href: profile.social.telegram, Icon: IconTelegram }] : []),
    { label: 'X (Twitter)', href: profile.social.twitter, Icon: IconX },
    { label: 'Medium', href: profile.social.medium, short: 'M' },
    { label: 'Stack Overflow', href: profile.social.stackoverflow, short: 'SO' },
  ]

  return (
    <footer className="border-t border-border/60 bg-surface/90">
      <div className="section-container">
        <div className="mx-auto max-w-6xl py-12 md:py-16">
          <Reveal className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr] md:gap-12">
            {/* Identity */}
            <div>
              <button type="button" onClick={goToTop} className="group flex items-center gap-3 text-left" aria-label="Back to top">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary font-display text-sm font-bold text-primary-foreground shadow-glow transition-transform duration-200 group-hover:scale-105">
                  {profile.name.split(' ').map(word => word[0]).join('')}
                </span>
                <span>
                  <span className="block font-display text-lg font-semibold leading-tight text-text-primary transition-colors group-hover:text-primary">
                    {profile.name}
                  </span>
                  <span className="block text-xs font-mono text-text-secondary">{profile.role}</span>
                </span>
              </button>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
                Senior software engineer specializing in Python and Go backends and AI-driven solutions.
              </p>
              <span
                className={`mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${availability.tone}`}
              >
                <span className={`h-2 w-2 rounded-full ${availability.dot}`} aria-hidden="true" />
                {availability.label}
              </span>
            </div>

            {/* Explore */}
            <nav aria-label="Footer">
              <h3 className="section-eyebrow">
                <RevealText text="Explore" />
              </h3>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                {EXPLORE_LINKS.map(link => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={e => {
                        e.preventDefault()
                        goTo(link.id)
                      }}
                      className="group flex items-center gap-2 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      <span className="h-1 w-1 rounded-full bg-text-secondary/50 transition-colors group-hover:bg-primary" aria-hidden="true" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Connect */}
            <div>
              <h3 className="section-eyebrow">
                <RevealText text="Connect" />
              </h3>
              <ul className="grid grid-cols-4 gap-2.5 sm:flex sm:flex-wrap">
                {connect.map(({ label, href, Icon, short }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith('mailto:') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="flex h-11 w-full items-center justify-center rounded-xl border border-border/60 bg-background/40 text-text-secondary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary sm:h-10 sm:w-10"
                    >
                      {Icon ? <Icon width={18} height={18} /> : <span className="font-mono text-xs">{short}</span>}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1">
                <a
                  href={profile.resumeUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 py-2 text-sm text-primary transition-colors hover:text-primary/80"
                >
                  <IconArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
                  Resume (PDF)
                </a>
                {profile.resumeFallbackUrl && (
                  <a
                    href={profile.resumeFallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 text-xs text-text-secondary transition-colors hover:text-primary"
                  >
                    Online version
                  </a>
                )}
              </div>
            </div>
          </Reveal>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col-reverse items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-text-secondary sm:flex-row sm:items-center">
            <p>
              © {currentYear} {profile.name} — All rights reserved
            </p>
            <button
              type="button"
              onClick={goToTop}
              className="group inline-flex items-center gap-2 py-1 transition-colors hover:text-primary"
            >
              Back to top
              <IconArrowDown className="h-3.5 w-3.5 rotate-180 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
