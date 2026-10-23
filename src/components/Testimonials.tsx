import type { TestimonialsData } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import DecodeText from './DecodeText'
import Reveal from './Reveal'

interface TestimonialsProps {
  testimonials: TestimonialsData
}

// Renders nothing until real testimonials are added to src/data/testimonials.json.
export default function Testimonials({ testimonials }: TestimonialsProps) {
  const items = testimonials.testimonials
  if (!items.length) return null

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-surface/90 section-glow [--glow:340_82%_60%] [--glow-x:100%] [--glow-y:0%]">
      <div className="section-container">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-12">
            <div className="section-eyebrow">
              <DecodeText text="Kind Words" />
            </div>
            <DecodeText as="h2" text="What people I've worked with say" className="section-title" />
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={i * 80} className="flex">
                <Card className="w-full">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <p className="text-text-primary leading-relaxed mb-6">“{item.quote}”</p>
                    <div className="mt-auto">
                      <div className="font-display font-semibold text-text-primary">{item.name}</div>
                      <div className="text-sm text-text-secondary">
                        {item.role}
                        {item.company ? `, ${item.company}` : ''}
                      </div>
                      {item.source && (
                        item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-primary hover:underline"
                          >
                            {item.source}
                          </a>
                        ) : (
                          <span className="text-xs font-mono text-text-secondary">{item.source}</span>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
