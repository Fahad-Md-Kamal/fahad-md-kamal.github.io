import type { Profile, ServicesData } from '../types'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import RevealText from './RevealText'
import Reveal from './Reveal'

interface ServicesProps {
  services: ServicesData
  profile: Profile
}

export default function Services({ services, profile }: ServicesProps) {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="services" className="py-20 md:py-28 bg-background/85 section-glow [--glow:160_84%_39%] [--glow-x:0%] [--glow-y:100%]">
      <div className="section-container">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-16">
            <div className="section-eyebrow">
              <RevealText text="Work With Me" />
            </div>
            <RevealText as="h2" text={services.headline} className="section-title mb-4" />
            <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">{services.intro}</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {services.services.map((service, i) => (
              <Reveal key={service.id} delay={i * 100} className="flex">
                <Card className="flex flex-col w-full hover:border-primary/50 hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 mb-3 bg-gradient-to-br from-primary/20 to-secondary/20 border border-border/60 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{service.icon}</span>
                    </div>
                    <CardTitle className="text-lg font-display font-semibold text-text-primary">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono uppercase tracking-wider text-secondary">
                      {service.forWho}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-text-secondary leading-relaxed mb-4">{service.summary}</p>
                    <ul className="space-y-2 text-sm text-text-secondary mb-5">
                      {service.includes.map(item => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5" aria-hidden="true">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap gap-2">
                      {service.tech.map(t => (
                        <Badge key={t} variant="outline" className="font-mono text-xs">{t}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal className="mb-16">
            <div className="text-xs font-mono uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
              <RevealText text="How I Work" />
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.process.map((step, i) => (
                <Reveal key={step.step} delay={i * 80} className="p-5 rounded-2xl border border-border/60 bg-background/40">
                  <div className="font-mono text-sm text-primary mb-2">{step.step}</div>
                  <div className="font-display font-semibold text-text-primary mb-1">{step.title}</div>
                  <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal className="p-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-secondary/10 text-center">
            <RevealText as="h3" text="Have something in mind?" className="text-2xl font-display font-semibold text-text-primary mb-2" />
            <p className="text-text-secondary mb-2">
              Tell me what you're building and what's blocking you. I'll reply with an honest view of how I'd approach it.
            </p>
            <p className="text-xs font-mono text-text-secondary mb-6">
              {services.engagements.join(' · ')} · Remote, based in {profile.location}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={scrollToContact}>Start a project</Button>
              <a
                href={`mailto:${profile.contact.email}`}
                className="inline-flex items-center justify-center rounded-xl border border-border/60 px-6 py-3 text-sm font-medium text-text-primary hover:border-primary/50 hover:text-primary transition-colors"
              >
                {profile.contact.email}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
