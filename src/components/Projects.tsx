import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProjectsData, Project } from '../types'
import { Button } from './ui/button'
import { IconLayers } from './icons'
import DecodeText from './DecodeText'
import Reveal from './Reveal'

interface ProjectsProps {
  projects: ProjectsData
}

interface ProjectCardProps {
  project: Project
  onOpen: (project: Project) => void
  delay?: number
}

const MAX_VISIBLE_TECH = 4

function resolveAsset(path: string) {
  if (!path) return path
  if (path.startsWith('http')) return path
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function ProjectImage({ project, className }: { project: Project; className: string }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className={className}>
      {project.image && !imageError ? (
        <img
          src={resolveAsset(project.image)}
          alt={`${project.title} architecture overview`}
          className="absolute inset-0 w-full h-full object-cover object-top"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-secondary/70">
          <IconLayers className="w-8 h-8" />
          <span className="text-xs font-mono uppercase tracking-wider">{project.category}</span>
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project, onOpen, delay = 0 }: ProjectCardProps) {
  const visibleTech = project.technologies.slice(0, MAX_VISIBLE_TECH)
  const hiddenCount = project.technologies.length - visibleTech.length

  return (
    <Reveal delay={delay}>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onOpen(project)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(project) } }}
        className="group hover:border-primary/50 hover:-translate-y-1 hover:shadow-glow transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer"
      >
        <ProjectImage
          project={project}
          className="relative aspect-[16/9] w-full border-b border-border/60 overflow-hidden bg-gradient-to-br from-primary/10 via-surface to-secondary/10"
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <DecodeText
              as={CardTitle as any}
              text={project.title}
              className="text-lg font-display font-semibold text-text-primary group-hover:text-primary transition-colors"
            />
            {project.featured && (
              <Badge variant="default" className="border-primary text-primary bg-primary/10 flex-shrink-0">
                Featured
              </Badge>
            )}
          </div>
          <CardDescription className="text-text-secondary text-sm leading-relaxed line-clamp-2">
            {project.shortDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col justify-end">
          <div className="flex flex-wrap gap-2 mb-4">
            {visibleTech.map((tech, index) => (
              <Badge
                key={index}
                variant="outline"
                className="font-mono text-xs"
                style={{
                  borderBottomColor: tech.color,
                  borderBottomWidth: '2px',
                  borderBottomStyle: 'solid'
                }}
              >
                {tech.name}
              </Badge>
            ))}
            {hiddenCount > 0 && (
              <Badge variant="outline" className="font-mono text-xs text-text-secondary">
                +{hiddenCount} more
              </Badge>
            )}
          </div>
          <div className="text-sm text-primary font-medium flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            View details
            <span aria-hidden="true">→</span>
          </div>
        </CardContent>
      </Card>
    </Reveal>
  )
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        className="max-w-5xl w-full max-h-[85vh] overflow-y-auto bg-surface rounded-2xl border border-border/60 shadow-glow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <ProjectImage
          project={project}
          className="relative aspect-[16/9] w-full border-b border-border/60 overflow-hidden bg-gradient-to-br from-primary/10 via-surface to-secondary/10"
        />

        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <DecodeText as="h3" text={project.title} className="text-2xl font-display font-semibold text-text-primary" />
              {project.featured && (
                <Badge variant="default" className="border-primary text-primary bg-primary/10">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">{project.shortDescription}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close">
            Close
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {project.context && (
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-secondary mb-2">
                <DecodeText text="The challenge" />
              </div>
              <p className="text-text-primary leading-relaxed">{project.context}</p>
            </div>
          )}

          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-secondary mb-2">
              <DecodeText text="What I built" />
            </div>
            <p className="text-text-secondary leading-relaxed">{project.description}</p>
          </div>

          {project.impact && (
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <DecodeText text="Results" />
                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(project.impact).map(([key, value], i) => (
                  <Reveal key={key} delay={i * 60} className="p-4 rounded-xl border border-border/60 bg-background/40">
                    <div className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <p className="text-sm text-text-primary leading-relaxed">{value}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {project.design_decisions && (
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-secondary mb-3 flex items-center gap-2">
                <DecodeText text="Key decisions" />
                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
              </div>
              <ul className="text-sm text-text-secondary space-y-2">
                {project.design_decisions.map((decision, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>{decision}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
              <DecodeText text="Tech stack" />
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="font-mono text-xs"
                  style={{
                    borderBottomColor: tech.color,
                    borderBottomWidth: '2px',
                    borderBottomStyle: 'solid'
                  }}
                >
                  {tech.name}
                </Badge>
              ))}
            </div>
          </div>

          {project.architecture && (
            <details className="group rounded-xl border border-border/60 bg-background/40 open:bg-background/60">
              <summary className="cursor-pointer select-none px-4 py-3 text-xs font-mono uppercase tracking-wider text-primary flex items-center justify-between">
                Architecture details
                <span className="transition-transform group-open:rotate-90" aria-hidden="true">›</span>
              </summary>
              <div className="grid sm:grid-cols-2 gap-3 text-sm px-4 pb-4">
                <div>
                  <span className="text-text-secondary">Pattern:</span>
                  <div className="font-mono text-text-primary">{project.architecture.pattern}</div>
                </div>
                <div>
                  <span className="text-text-secondary">Scale:</span>
                  <div className="font-mono text-primary">{project.architecture.scale}</div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-text-secondary">Infrastructure:</span>
                  <div className="font-mono text-text-primary">{project.architecture.infrastructure}</div>
                </div>
              </div>
            </details>
          )}

          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-text-primary">Need something similar built for your product?</p>
            <Button
              size="sm"
              onClick={() => {
                onClose()
                setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 50)
              }}
            >
              Let's talk
            </Button>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex gap-3 p-6 pt-0">
          {project.type === 'NDA' ? (
            <div className="flex-1 text-center py-2 px-3 border border-border/60 text-text-secondary/60 font-mono text-sm rounded-xl cursor-not-allowed">
              NDA Project
            </div>
          ) : project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-3 bg-primary text-background hover:bg-primary/90 transition-colors font-mono text-sm rounded-xl"
            >
              Live Site
            </a>
          )}
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-3 border border-border/60 text-text-secondary hover:text-primary hover:border-primary/50 transition-all font-mono text-sm rounded-xl"
            >
              Code
            </a>
          )}
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-3 border border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/70 transition-all font-mono text-sm rounded-xl"
            >
              Demo
            </a>
          )}
          {!project.links.live && !project.links.github && !project.links.demo && (
            <div className="flex-1 text-center py-2 px-3 border border-border/60 text-text-secondary/60 font-mono text-sm rounded-xl cursor-not-allowed">
              Private Project
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Projects({ projects }: ProjectsProps) {
  // Separate regular projects and AI projects
  const systemsProjects = projects.projects || []
  const aiProjects = projects.aiProjects || []
  const allProjects = [...systemsProjects, ...aiProjects]

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  return (
    <section id="projects" className="py-20 md:py-28 bg-background/85">
      <div className="section-container">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <Reveal className="mb-16">
            <div className="section-eyebrow">
              <DecodeText text="Selected Work" />
            </div>
            <DecodeText as="h2" text="Engineering Systems" className="section-title" />
            <p className="text-lg text-text-secondary max-w-3xl mb-8">
              Production systems built for scale, reliability, and maintainability.
              Focus on architecture decisions, performance impact, and real-world constraints.
            </p>
          </Reveal>

          {/* Tabs */}
          <Tabs defaultValue="all" className="mb-12">
            <TabsList className="w-full mb-12 grid grid-cols-1 sm:grid-cols-3 h-auto">
              <TabsTrigger value="all" className="font-mono text-xs md:text-sm p-2 md:p-3">
                <span className="hidden sm:inline">All Projects ({allProjects.length})</span>
                <span className="sm:hidden">All ({allProjects.length})</span>
              </TabsTrigger>
              <TabsTrigger value="systems" className="font-mono text-xs md:text-sm p-2 md:p-3">
                <span className="hidden sm:inline">Backend Systems ({systemsProjects.length})</span>
                <span className="sm:hidden">Backend ({systemsProjects.length})</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="font-mono text-xs md:text-sm p-2 md:p-3">
                <span className="hidden sm:inline">AI & LLM Systems ({aiProjects.length})</span>
                <span className="sm:hidden">AI ({aiProjects.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-12">
                {systemsProjects.length > 0 && (
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <DecodeText as="h3" text="Backend & Infrastructure" className="text-xl font-display text-primary" />
                      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-8">
                      {systemsProjects.map((project, i) => (
                        <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} delay={i * 80} />
                      ))}
                    </div>
                  </div>
                )}
                {aiProjects.length > 0 && (
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <DecodeText as="h3" text="AI & LLM Systems" className="text-xl font-display text-secondary" />
                      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-8">
                      {aiProjects.map((project, i) => (
                        <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} delay={i * 80} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="systems">
              <div className="space-y-12">
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <DecodeText as="h3" text="Backend & Infrastructure" className="text-xl font-display text-primary" />
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {systemsProjects.map((project, i) => (
                      <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} delay={i * 80} />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai">
              <div className="space-y-12">
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <DecodeText as="h3" text="AI & LLM Systems" className="text-xl font-display text-secondary" />
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {aiProjects.map((project, i) => (
                      <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} delay={i * 80} />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Engineering Notes Section */}
          <Reveal as={Card as any} className="mt-20 bg-surface border-border/60">
            <CardHeader>
              <DecodeText as={CardTitle as any} text="Engineering Notes" className="text-lg font-display text-primary" />
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <Reveal as={Card as any} delay={0} className="bg-background border-border/60">
                  <CardHeader className="pb-3">
                    <DecodeText as={CardTitle as any} text="TRADE-OFFS" className="text-xs font-mono text-secondary" />
                  </CardHeader>
                  <CardContent className="text-sm text-text-secondary leading-relaxed">
                    Redis Pub/Sub vs Kafka: Chosen Redis for sub-100ms latency requirements in threat processing,
                    accepting trade-off in total ordering guarantees for real-time performance.
                  </CardContent>
                </Reveal>

                <Reveal as={Card as any} delay={80} className="bg-background border-border/60">
                  <CardHeader className="pb-3">
                    <DecodeText as={CardTitle as any} text="SCALE PATTERNS" className="text-xs font-mono text-secondary" />
                  </CardHeader>
                  <CardContent className="text-sm text-text-secondary leading-relaxed">
                    Event-driven architecture with circuit breakers enables 10K+ req/sec while maintaining
                    system stability during downstream service degradation.
                  </CardContent>
                </Reveal>

                <Reveal as={Card as any} delay={160} className="bg-background border-border/60">
                  <CardHeader className="pb-3">
                    <DecodeText as={CardTitle as any} text="LESSONS LEARNED" className="text-xs font-mono text-secondary" />
                  </CardHeader>
                  <CardContent className="text-sm text-text-secondary leading-relaxed">
                    Serverless cost optimization: 40% savings achieved by right-sizing function memory and
                    implementing intelligent cold-start warming strategies.
                  </CardContent>
                </Reveal>
              </div>
            </CardContent>
          </Reveal>

          {/* CTA */}
          <div className="text-center mt-16">
            <p className="text-text-secondary mb-6 font-mono text-sm">
              // More systems and architectural decisions on GitHub
            </p>
            <Button
              asChild
              href="https://github.com/fahad-md-kamal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono"
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View Repository
              </span>
            </Button>
          </div>
        </div>
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  )
}
