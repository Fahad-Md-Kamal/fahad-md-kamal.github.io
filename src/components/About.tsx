import type { Profile } from '../types'
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { IconMapPin, IconMail } from '@/components/icons'
import DecodeText from './DecodeText'
import Reveal from './Reveal'

interface AboutProps {
  profile: Profile
  projectCount: number
}

export default function About({ profile, projectCount }: AboutProps) {
  const [avatarError, setAvatarError] = useState(false)
  const resolveAsset = (path: string) => {
    if (!path) return path
    if (path.startsWith('http')) return path
    const base = import.meta.env.BASE_URL || '/'
    return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  }
  
  // Calculate years of experience dynamically
  const calculateYearsExperience = () => {
    if (!profile.career?.startDate) return '5+'
    
    const startDate = new Date(profile.career.startDate)
    const today = new Date()
    const years = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    
    return years >= 5 ? `${years}+` : `${years}+`
  }
  
  const calculateSystemsBuilt = () => `${projectCount}+`

  const stats = [
    { label: 'Years Experience', value: calculateYearsExperience() },
    { label: 'Systems Built', value: calculateSystemsBuilt() },
    { label: 'Organizations', value: profile.stats?.clientsServed || '4+' },
    { label: 'Core Tools', value: profile.stats?.techStackSize || '12+' }
  ]

  return (
    <section id="about" className="py-20 md:py-28 bg-surface/90 section-glow [--glow-x:0%] [--glow-y:0%]">
      <div className="section-container">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <Reveal className="mb-16">
            <div className="section-eyebrow">
              <DecodeText text="About Me" />
            </div>
            <DecodeText as="h2" text="The engineer behind the systems" className="section-title mb-4" />
            <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
              Senior backend engineer building multi-tenant SaaS, healthcare, and data platforms in Python and Go, with production AI/LLM integration.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left - Technical Summary */}
            <Reveal className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={resolveAsset(profile.avatar)}
                        alt={profile.name}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                        style={avatarError ? { display: 'none' } : undefined}
                      />
                      <AvatarFallback className={`bg-primary/20 text-primary font-mono text-sm font-bold ${avatarError ? '' : 'hidden'}`}>
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DecodeText as="h3" text={profile.name} className="text-xl font-display font-semibold text-text-primary" />
                      <p className="text-text-secondary font-mono">{profile.role}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                    <DecodeText text="TECHNICAL SUMMARY" />
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                  </div>

                  <p className="text-text-secondary leading-relaxed">
                    {profile.summary}
                  </p>

                  <p className="text-text-secondary leading-relaxed">
                    {profile.technicalSummary || "Specialized in designing event-driven architectures for high-throughput systems, with expertise in microservices patterns, serverless computing, and AI/LLM integration. Focus on measurable performance improvements and cost optimization strategies."}
                  </p>

                  <div className="mt-6 pt-6 border-t border-border/60">
                    <div className="text-xs font-mono uppercase tracking-wider text-primary mb-3">
                      <DecodeText text="Core Expertise" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {profile.expertise ? (
                        Object.entries(profile.expertise).map(([key, expertise], i) => (
                          <Reveal key={key} delay={i * 60}>
                            <span className="text-text-secondary">{expertise.label}:</span>
                            <DecodeText text={expertise.technologies} className="font-mono text-text-primary block" />
                          </Reveal>
                        ))
                      ) : (
                        <>
                          <div>
                            <span className="text-text-secondary">Backend Systems:</span>
                            <div className="font-mono text-text-primary">Python, TypeScript, Microservices</div>
                          </div>
                          <div>
                            <span className="text-text-secondary">Cloud Architecture:</span>
                            <div className="font-mono text-text-primary">AWS, Azure, Serverless</div>
                          </div>
                          <div>
                            <span className="text-text-secondary">Messaging:</span>
                            <div className="font-mono text-text-primary">Redis, Kafka, Event-Driven</div>
                          </div>
                          <div>
                            <span className="text-text-secondary">AI/LLM:</span>
                            <div className="font-mono text-text-primary">LangChain, RAG, OpenAI</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            {/* Right - Stats & Contact */}
            <Reveal className="space-y-8" delay={120}>
              {/* Stats */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-primary flex items-center gap-2">
                    <DecodeText text="METRICS" />
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, index) => (
                      <Reveal key={index} delay={index * 60} className="text-center p-4 rounded-xl border border-border/60 bg-background/40">
                        <DecodeText text={stat.value} className="text-2xl font-display font-bold text-primary mb-1 block" />
                        <div className="text-xs text-text-secondary">
                          {stat.label}
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-primary flex items-center gap-2">
                    <DecodeText text="CONTACT" />
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-background/40 border border-border/60 rounded-xl flex items-center justify-center text-primary">
                      <IconMapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Location</p>
                      <DecodeText text={profile.contact?.location || profile.location} className="text-text-primary block" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-background/40 border border-border/60 rounded-xl flex items-center justify-center text-primary">
                      <IconMail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Email</p>
                      <a href={`mailto:${profile.contact?.email || profile.email}`} className="text-primary hover:text-primary/80 text-sm">
                        {profile.contact?.email || profile.email}
                      </a>
                    </div>
                  </div>

                  {profile.availability.status === 'open' && (
                    <div className="pt-4 border-t border-border/60">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                          Available
                        </Badge>
                        <span className="text-text-secondary font-mono text-xs">{profile.availability.message}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
