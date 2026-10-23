import type { Profile } from '../types'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { IconArrowDown } from "@/components/icons"
import DecodeText from './DecodeText'
import Reveal from './Reveal'

interface FooterProps {
  profile: Profile
}

export default function Footer({ profile }: FooterProps) {
  const currentYear = new Date().getFullYear()
  
  const footerSections = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-surface/90 border-t border-border/60">
      <div className="section-container">
        <div className="max-w-6xl mx-auto py-16 md:py-20">
          {/* System Info */}
          <Reveal className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Engineer Identity */}
            <div>
              <Button
                variant="ghost"
                onClick={scrollToTop}
                className="font-display text-lg font-semibold mb-4 text-text-primary hover:text-primary transition-colors p-0 h-auto"
              >
                {profile.name}
              </Button>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Senior software engineer specializing in Python and Go backends
                and AI-driven solutions.
              </p>

              {/* Technical Links */}
              <div className="flex gap-2.5">
                {Object.entries(profile.social).map(([platform, url]) => {
                  if (platform === 'portfolio') return null // Skip portfolio link
                  const labelMap: Record<string, string> = {
                    github: 'GH',
                    linkedin: 'IN',
                    twitter: 'X',
                    medium: 'M',
                    stackoverflow: 'SO',
                    telegram: 'TG',
                  }
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-surface border border-border/60 rounded-xl flex items-center justify-center text-text-secondary hover:border-primary/50 hover:text-primary hover:-translate-y-0.5 transition-all duration-200"
                      aria-label={`${platform} profile`}
                    >
                      <DecodeText text={labelMap[platform] || platform.slice(0, 2).toUpperCase()} className="font-mono text-xs" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Navigation Interface */}
            <div>
              <h3 className="section-eyebrow">
                <DecodeText text="Navigation" />
              </h3>
              <ul className="space-y-3">
                {footerSections.map((section) => (
                  <li key={section.label}>
                    <Button
                      variant="ghost"
                      onClick={() => scrollToSection(section.href.slice(1))}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 group p-0 h-auto justify-start"
                    >
                      <span className="w-1 h-1 bg-text-secondary/50 rounded-full group-hover:bg-primary"></span>
                      {section.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* System Status */}
            <div>
              <h3 className="section-eyebrow">
                <DecodeText text="Status" />
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    Available for hire
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Accepting projects
                  </Badge>
                </div>
                <a
                  href={profile.resumeUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm group"
                >
                  <IconArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
                  Resume (PDF)
                </a>
                {profile.resumeFallbackUrl && (
                  <a
                    href={profile.resumeFallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-text-secondary hover:text-primary transition-colors"
                  >
                    Online version
                  </a>
                )}
              </div>
            </div>
          </Reveal>

          {/* Terminal Footer */}
          <div className="text-center">
            <Separator className="mb-8 bg-border/60" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-secondary">
              <div>
                © {currentYear} {profile.name} — All rights reserved
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
