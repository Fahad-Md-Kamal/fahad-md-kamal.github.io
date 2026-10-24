import { useState } from 'react'
import type { EducationData, Education } from '../types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import RevealText from './RevealText'
import Reveal from './Reveal'

interface EducationProps {
  education: EducationData
}

interface EducationCardProps {
  education: Education
  index: number
}

function resolveAsset(path: string) {
  if (!path) return path
  if (path.startsWith('http')) return path
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function EducationCard({ education, index }: EducationCardProps) {
  const [logoError, setLogoError] = useState(false)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Present'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <Reveal delay={index * 100} className="relative mb-8">
      <div className="absolute left-6 top-20 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent hidden md:block"></div>

      <div className="absolute left-2 top-16 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full border-4 border-background shadow-glow hidden md:flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>

      <Card className="md:ml-16 card-hover">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center overflow-hidden border p-2">
                {education.logo && !logoError ? (
                  <img
                    src={resolveAsset(education.logo)}
                    alt={`${education.institution} logo`}
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-primary font-bold text-lg">
                    {education.institution[0]}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                <div className="flex-1">
                  <RevealText as="h3" text={education.degree} className="text-xl font-semibold text-foreground mb-2" />
                  <div className="flex items-center gap-3 mb-3">
                    {education.website ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary font-medium hover:underline"
                        asChild
                        href={education.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {education.institution} ↗
                      </Button>
                    ) : (
                      <span className="text-primary font-medium">{education.institution}</span>
                    )}
                    <Badge variant="outline" className="flex items-center gap-1">
                      {education.location}
                    </Badge>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <RevealText text={`${formatDate(education.startDate)} - ${formatDate(education.endDate)}`} />
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {education.description}
          </p>

          {education.highlights && education.highlights.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-3">Highlights:</h4>
              <ul className="space-y-3">
                {education.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="text-muted-foreground text-sm leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </Reveal>
  )
}

export default function Education({ education }: EducationProps) {
  return (
    <section id="education" className="py-20 md:py-28 bg-surface/90 section-glow [--glow:160_84%_39%] [--glow-x:100%] [--glow-y:100%]">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <Reveal className="mb-16">
            <div className="section-eyebrow">
              <RevealText text="Background" />
            </div>
            <RevealText as="h2" text="Education" className="section-title mb-4" />
            <p className="text-xl text-muted-foreground max-w-2xl">
              Academic background behind the engineering work.
            </p>
          </Reveal>

          <div className="space-y-8">
            {education.education.map((edu, index) => (
              <EducationCard key={edu.id} education={edu} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
