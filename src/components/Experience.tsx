import type { ExperienceData, Experience, Profile } from '../types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DecodeText from './DecodeText'
import Reveal from './Reveal'

interface ExperienceProps {
  experience: ExperienceData
  profile: Profile
}

interface ExperienceCardProps {
  experience: Experience
  index: number
}

function ExperienceCard({ experience, index }: ExperienceCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Present'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const calculateDuration = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (years === 0) return `${months} month${months > 1 ? 's' : ''}`
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
  }

  return (
    <Reveal delay={index * 100} className="relative mb-8">
      {/* Timeline line */}
      <div className="absolute left-6 top-20 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent hidden md:block"></div>

      {/* Timeline dot */}
      <div className="absolute left-2 top-16 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full border-4 border-background shadow-glow hidden md:flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>

      {/* Content */}
      <Card className="md:ml-16 card-hover">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center overflow-hidden border">
                {experience.logo ? (
                  <img
                    src={experience.logo}
                    alt={`${experience.company} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement!.innerHTML = `<span class="text-primary font-bold text-lg">${experience.company[0]}</span>`
                    }}
                  />
                ) : (
                  <span className="text-primary font-bold text-lg">
                    {experience.company[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Experience Details */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                <div className="flex-1">
                  <DecodeText as="h3" text={experience.role} className="text-xl font-semibold text-foreground mb-2" />
                  <div className="flex items-center gap-3 mb-3">
                    {experience.website ? (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary font-medium hover:underline"
                        asChild
                        href={experience.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {experience.company} ↗
                      </Button>
                    ) : (
                      <span className="text-primary font-medium">{experience.company}</span>
                    )}
                    <Badge variant="outline" className="flex items-center gap-1">
                      {experience.location}
                    </Badge>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="secondary" className="flex items-center gap-2 mb-2">
                    <DecodeText text={`${formatDate(experience.startDate)} - ${formatDate(experience.endDate)}`} />
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {calculateDuration(experience.startDate, experience.endDate)}
                  </div>
                </div>
              </div>

              {/* Job Type and Status */}
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{experience.type}</Badge>
                {experience.current && (
                  <Badge className="bg-green-500/15 text-green-400 border border-green-500/25">
                    Current
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Description */}
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {experience.description}
          </p>

          {/* Key Highlights */}
          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-3">Key Achievements:</h4>
            <ul className="space-y-3">
              {experience.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-muted-foreground text-sm leading-relaxed">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technologies */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Technologies Used:</h4>
            <div className="flex flex-wrap gap-2">
              {experience.technologies.map((tech, idx) => (
                <Badge key={idx} variant="secondary" className="font-mono text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Reveal>
  )
}

export default function Experience({ experience, profile }: ExperienceProps) {
  
  // Calculate years of experience from career start date (consistent with Hero and About)
  const calculateYearsExperience = () => {
    if (!profile?.career?.startDate) return '7+'
    
    const startDate = new Date(profile.career.startDate)
    const today = new Date()
    const years = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    
    return years >= 5 ? `${years}+` : `${years}+`
  }

  const stats = [
    { label: 'Years Experience', value: calculateYearsExperience() },
    { label: 'Companies', value: experience.experiences.length.toString() },
    { label: 'Current Role', value: experience.experiences.find(exp => exp.current)?.role?.replace('Senior ', 'Sr. ') || 'Available' },
    { label: 'Location', value: experience.experiences[0]?.location.split(',')[0] || 'Remote' }
  ]

  return (
    <section id="experience" className="py-20 md:py-28 bg-background/85 section-glow [--glow:var(--secondary)] [--glow-x:0%] [--glow-y:0%]">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <Reveal className="mb-16">
            <div className="section-eyebrow">
              <DecodeText text="Career Path" />
            </div>
            <DecodeText as="h2" text="Engineering Experience" className="section-title mb-4" />
            <p className="text-xl text-muted-foreground max-w-2xl">
              My professional journey and the impact I've made at various organizations.
            </p>
          </Reveal>

          {/* Experience Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Reveal key={index} delay={index * 80} as={Card as any} className="text-center h-28 flex flex-col card-hover">
                <CardContent className="flex-1 flex items-center justify-center p-4">
                    {stat.value.length <= 2 ? <DecodeText text={stat.value} className="w-full text-center text-5xl pb-0 font-display font-bold text-primary leading-tight block" /> : <DecodeText text={stat.value} className="w-full text-center text-lg font-display font-bold text-primary leading-tight block" />}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground py-2 px-4 border-t border-border/60 justify-center">
                  {stat.label}
                </CardFooter>
              </Reveal>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            {experience.experiences.map((exp, index) => (
              <ExperienceCard key={exp.id} experience={exp} index={index} />
            ))}
          </div>

          {/* CTA */}
          <Reveal className="text-center mt-16">
            <Card className="p-8 bg-gradient-to-br from-primary/10 via-card to-secondary/10">
              <CardHeader className="pb-4">
                <DecodeText as="h3" text="Ready to Work Together?" className="text-2xl font-display font-semibold text-foreground mb-2" />
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  I'm always interested in new opportunities and challenges.
                  Let's discuss how my experience can contribute to your team's success.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Get In Touch
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    asChild
                    href={profile?.resumeUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
