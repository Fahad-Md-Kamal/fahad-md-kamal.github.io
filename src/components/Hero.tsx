import { useEffect, useState } from 'react'
import type { Profile } from '../types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { IconGithub, IconLinkedin, IconX, IconMail, IconWhatsapp, IconMapPin, IconArrowDown } from '@/components/icons'
import { whatsappLink, whatsappGreeting } from '@/lib/whatsapp'
import RevealText from './RevealText'
import RequestFlow from './RequestFlow'
interface HeroProps {
  profile: Profile
  projectCount: number
}

export default function Hero({ profile, projectCount }: HeroProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  
  const resolveAsset = (path: string) => {
    if (!path) return path
    if (path.startsWith('http')) return path
    const base = import.meta.env.BASE_URL || '/'
    return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  }
  const avatarSrc = resolveAsset(profile.avatar)
  
  const techStack = ['Python • Go • FastAPI', 'Django • DRF • gRPC', 'PostgreSQL • Redis • Elasticsearch', 'AWS • Terraform • Docker', 'LangChain • RAG • Claude & Azure OpenAI']

  // Calculate years of experience dynamically
  const calculateYearsExperience = () => {
    if (!profile.career?.startDate) return '5+'
    
    const startDate = new Date(profile.career.startDate)
    const today = new Date()
    const years = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    
    return years >= 5 ? `${years}+` : `${years}+`
  }
  
  // Calculate systems built from projects
  const calculateSystemsBuilt = () => `${projectCount}+`

  useEffect(() => {
    const currentTech = techStack[currentIndex]
    const speed = isDeleting ? 30 : 80
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentTech.length) {
          setDisplayedText(currentTech.slice(0, displayedText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % techStack.length)
        }
      }
    }, speed)

    return () => clearTimeout(timer)
  }, [displayedText, currentIndex, isDeleting, techStack])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-16 pb-8 px-4">
      {/* Ambient glow background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/4 w-[32rem] h-[32rem] rounded-full bg-primary/20 blur-[120px] animate-float-slow" />
        <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-secondary/20 blur-[120px] animate-float-slower" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--text-primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--text-primary)) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      <div className="section-container relative">
        <div className="max-w-4xl mx-auto">
          {/* Profile Avatar */}
          <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary to-secondary opacity-70 blur-md" />
              <Avatar className="relative w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-glow-lg">
                <AvatarImage
                  src={avatarSrc}
                  alt={profile.name}
                  className="object-cover"
                  onError={() => setAvatarError(true)}
                  style={avatarError ? { display: 'none' } : undefined}
                />
                <AvatarFallback className={`bg-primary text-white text-2xl sm:text-4xl font-bold ${avatarError ? '' : 'hidden'}`}>
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500 border-4 border-background flex items-center justify-center">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Main Title - Direct and Technical */}
          <div className="mb-8 sm:mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold mb-4 sm:mb-6 leading-[1.05] tracking-tight text-center">
              <span className="gradient-text">{profile.name}</span>
            </h1>
            <RevealText
              as="h2"
              text={profile.role}
              className="text-lg sm:text-2xl lg:text-3xl text-text-primary/90 mb-3 sm:mb-4 text-center font-display font-medium block"
            />
            <div className="text-base sm:text-xl lg:text-2xl text-text-secondary mb-6 sm:mb-8 leading-relaxed text-center px-4 max-w-2xl mx-auto">
              Building secure, scalable backends and AI-integrated systems for healthcare, SaaS, and enterprise platforms
            </div>
            {/* Tech Stack Rotation */}
            <div className="flex items-center justify-center mb-6 sm:mb-8 px-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/60 px-4 py-2.5 text-xs sm:text-base font-mono text-text-secondary">
                <span className="glow-dot" />
                <span className="min-w-fit">
                  {displayedText}
                  <span className="animate-pulse text-primary">_</span>
                </span>
              </div>
            </div>
          </div>

          <RequestFlow />

          {/* Key Metrics - Signal Dense */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8 sm:mb-12 animate-slide-up px-4" style={{ animationDelay: '0.2s' }}>
            <Card className="card-hover">
              <CardContent className="px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-5 text-center">
                <RevealText text={calculateYearsExperience()} className="text-xl sm:text-3xl font-display font-bold text-primary mb-1 block" />
                <div className="text-xs sm:text-sm text-text-secondary">Years Experience</div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-5 text-center">
                <RevealText text={calculateSystemsBuilt()} className="text-xl sm:text-3xl font-display font-bold text-primary mb-1 block" />
                <div className="text-xs sm:text-sm text-text-secondary">Systems Built</div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-5 text-center">
                <RevealText text="99.9%" className="text-xl sm:text-3xl font-display font-bold text-primary mb-1 block" />
                <div className="text-xs sm:text-sm text-text-secondary">Uptime Achieved</div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-5 text-center">
                <RevealText text="5M+" className="text-xl sm:text-3xl font-display font-bold text-primary mb-1 block" />
                <div className="text-xs sm:text-sm text-text-secondary">Records Processed</div>
              </CardContent>
            </Card>
          </div>

          {/* Calls to action */}
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 animate-slide-up px-4" style={{ animationDelay: '0.4s' }}>
            <Button onClick={() => scrollToSection('contact')} size="lg" className="w-full sm:w-auto">
              Start a project
            </Button>
            <Button onClick={() => scrollToSection('projects')} size="lg" variant="outline" className="flex-1 sm:flex-none sm:w-auto">
              View my work
            </Button>
            <Button
              asChild
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="lg"
              className="flex-1 sm:flex-none sm:w-auto"
            >
              <span className="flex items-center gap-2">
                Resume
                <IconArrowDown className="w-4 h-4" />
              </span>
            </Button>
          </div>

          {/* Professional Links */}
          <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-12 animate-fade-in px-4" style={{ animationDelay: '0.6s' }}>
            {[
              { href: profile.social.github, label: 'GitHub', Icon: IconGithub },
              { href: profile.social.linkedin, label: 'LinkedIn', Icon: IconLinkedin },
              { href: profile.social.twitter, label: 'X (Twitter)', Icon: IconX },
              { href: whatsappLink(profile.contact.phone, whatsappGreeting(profile.name)), label: 'WhatsApp', Icon: IconWhatsapp },
              { href: `mailto:${profile.contact.email}`, label: 'Email', Icon: IconMail },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-surface/40 px-3.5 py-2 text-text-secondary hover:text-primary hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 text-sm"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </a>
            ))}
          </div>

          {/* Location & Status */}
          <div className="text-center animate-fade-in px-4" style={{ animationDelay: '0.8s' }}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-text-secondary text-xs sm:text-sm">
              <Badge variant="secondary" className="flex items-center gap-2">
                <IconMapPin className="w-3.5 h-3.5" />
                <RevealText text={profile.contact.location} />
              </Badge>
              {profile.availability.status === 'open' && (
                <Badge variant="outline" className="flex items-center gap-2 border-green-500/25 text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <RevealText text={profile.availability.message} />
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
