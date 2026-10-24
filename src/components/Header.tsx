import { useEffect, useState } from 'react'
import type { Profile } from '../types'
import { Button } from '@/components/ui/button'
import { createPortal } from 'react-dom'
import { IconMenu, IconClose, IconHome, IconFolder, IconBriefcase, IconTerminal, IconGrid } from './icons'

interface HeaderProps {
  profile: Profile
  hasCertifications?: boolean
  hasTestimonials?: boolean
}

export default function Header({ profile, hasCertifications = true, hasTestimonials = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Highlight the bottom-bar tab for the section crossing the upper-middle of the screen.
  // Looked up on every scroll because lazy sections replace their placeholder element.
  useEffect(() => {
    const ids = ['hero', 'about', 'skills', 'projects', 'services', 'testimonials', 'experience', 'education', 'certifications', 'github', 'blogs', 'playground', 'contact']
    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.4
      let current = 'hero'
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActiveSection(current)
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

  // "More" sheet: lock page scroll behind it and let Escape close it.
  useEffect(() => {
    if (!isMoreOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMoreOpen(false)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [isMoreOpen])

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Services', href: '#services' },
    ...(hasTestimonials ? [{ label: 'Reviews', href: '#testimonials' }] : []),
    { label: 'Experience', href: '#experience' },
    { label: 'Education', href: '#education' },
    ...(hasCertifications ? [{ label: 'Certifications', href: '#certifications' }] : []),
    { label: 'Blog', href: '#blogs' },
    { label: 'Playground', href: '#playground' },
  ]

  const resumeLink = profile.resumeUrl || profile.resumeFallbackUrl || '#'

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setIsMobileOpen(false)
      setIsMoreOpen(false)
    }
  }

  const primarySections = ['hero', 'projects', 'experience', 'playground']
  const tabs = [
    { label: 'Home', Icon: IconHome, active: activeSection === 'hero', onClick: () => scrollToSection('hero') },
    { label: 'Projects', Icon: IconFolder, active: activeSection === 'projects', onClick: () => scrollToSection('projects') },
    { label: 'Experience', Icon: IconBriefcase, active: activeSection === 'experience', onClick: () => scrollToSection('experience') },
    { label: 'Playground', Icon: IconTerminal, active: activeSection === 'playground', onClick: () => scrollToSection('playground') },
    { label: 'More', Icon: IconGrid, active: isMoreOpen || !primarySections.includes(activeSection), onClick: () => setIsMoreOpen(true) },
  ]

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass border-b border-border/60 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="section-container">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <button
            onClick={() => scrollToSection('hero')}
            className="group flex items-center gap-2.5"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary text-background font-display font-bold text-sm shadow-glow transition-transform duration-200 group-hover:scale-105">
              {profile.name.split(' ').map(word => word[0]).join('')}
            </span>
            <span className="hidden sm:inline font-display font-semibold text-text-primary group-hover:text-primary transition-colors">
              {profile.name}
            </span>
          </button>

          {/* Desktop */}
          <div className="hidden xl:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href.slice(1))}
                className="group relative px-3 py-2 text-sm text-text-secondary hover:text-text-primary font-medium transition-colors"
              >
                {link.label}
                <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </button>
            ))}
            <a
              href={resumeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary font-medium transition-colors"
            >
              Resume
            </a>
            <button
              onClick={() => scrollToSection('contact')}
              className="ml-2 inline-flex items-center rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-medium px-4 py-2 shadow-glow hover:-translate-y-0.5 transition-all duration-200"
            >
              Start a project
            </button>
          </div>

          {/* Mobile trigger */}
          <div className="hidden md:block xl:hidden">
            <Button
              variant="outline"
              size="icon"
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileOpen}
              onClick={() => setIsMobileOpen(o => !o)}
            >
              {isMobileOpen ? <IconClose /> : <IconMenu />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileOpen && (
          <div className="hidden md:block xl:hidden mt-2 mb-4 space-y-1 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain glass rounded-2xl border border-border/60 p-2 shadow-soft">
            {navLinks.map(link => (
              <Button
                key={link.label}
                variant="ghost"
                className="w-full justify-start font-medium"
                onClick={() => scrollToSection(link.href.slice(1))}
              >
                {link.label}
              </Button>
            ))}
            <a
              href={resumeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center rounded-xl border border-border/60 text-text-primary text-sm font-medium px-4 py-2.5 mt-2"
            >
              Resume
            </a>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-center rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-medium px-4 py-2.5 mt-2"
            >
              Start a project
            </button>
          </div>
        )}
      </nav>

      {/* Phones: bottom tab bar */}
      {createPortal(
      <nav
        aria-label="Main"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border/60 pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-5">
          {tabs.map(tab => {
            const active = tab.active
            return (
              <li key={tab.label}>
                <button
                  type="button"
                  onClick={tab.onClick}
                  aria-current={active ? 'true' : undefined}
                  className={`relative w-full h-16 flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                    active ? 'text-primary' : 'text-text-secondary active:text-text-primary'
                  }`}
                >
                  {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden="true" />}
                  <tab.Icon width={22} height={22} />
                  {tab.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>,
      document.body
      )}

      {isMoreOpen &&
        createPortal(
          <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="All sections">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsMoreOpen(false)} />
            <div className="absolute inset-x-0 bottom-0 max-h-[82dvh] flex flex-col rounded-t-3xl border-t border-border/60 bg-card shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.6)] animate-sheet-up pb-[env(safe-area-inset-bottom)]">
              <div className="shrink-0 pt-2.5 pb-1 flex justify-center" aria-hidden="true">
                <span className="h-1 w-10 rounded-full bg-border" />
              </div>
              <div className="shrink-0 flex items-center justify-between px-5 pb-3">
                <h3 className="font-display font-semibold text-text-primary">Jump to</h3>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(false)}
                  aria-label="Close"
                  className="w-9 h-9 -mr-2 flex items-center justify-center rounded-full text-text-secondary hover:bg-white/[0.06]"
                >
                  <IconClose />
                </button>
              </div>
              <div className="overflow-y-auto overscroll-contain border-t border-border/60 p-3">
                <ul className="grid grid-cols-2 gap-2">
                  {navLinks.map(link => {
                    const active = activeSection === link.href.slice(1)
                    return (
                      <li key={link.label}>
                        <button
                          type="button"
                          onClick={() => scrollToSection(link.href.slice(1))}
                          aria-current={active ? 'true' : undefined}
                          className={`w-full min-h-12 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                            active
                              ? 'border-primary/60 bg-primary/10 text-text-primary'
                              : 'border-border/60 text-text-secondary active:bg-white/[0.06]'
                          }`}
                        >
                          {link.label}
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <a
                  href={resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center rounded-xl border border-border/60 text-text-primary text-sm font-medium px-4 py-3 mt-3"
                >
                  Resume
                </a>
                <button
                  type="button"
                  onClick={() => scrollToSection('contact')}
                  className="block w-full text-center rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-medium px-4 py-3 mt-2"
                >
                  Start a project
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  )
}
