import { useState } from 'react'
import type { CertificationsData, Certification } from '../types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DecodeText from './DecodeText'
import Reveal from './Reveal'

interface CertificationsProps {
  certifications: CertificationsData
}

function resolveAsset(path: string) {
  if (!path) return path
  if (path.startsWith('http')) return path
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

function CertificationCard({ certification }: { certification: Certification }) {
  const [logoError, setLogoError] = useState(false)

  return (
    <Reveal as={Card as any} className="card-hover">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center overflow-hidden border p-1.5">
            {certification.logo && !logoError ? (
              <img
                src={resolveAsset(certification.logo)}
                alt={`${certification.name} logo`}
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-primary font-bold">
                {certification.name[0]}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {certification.credentialUrl ? (
                <a
                  href={certification.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline inline-flex items-center gap-1"
                >
                  <DecodeText text={certification.name} /> ↗
                </a>
              ) : (
                <DecodeText text={certification.name} />
              )}
            </h3>
            {certification.issuer && (
              <p className="text-sm text-muted-foreground mt-1">{certification.issuer}</p>
            )}
          </div>
          {certification.date && (
            <Badge variant="secondary" className="whitespace-nowrap">
              <DecodeText text={certification.date} />
            </Badge>
          )}
        </div>
      </CardHeader>
      {certification.score && (
        <CardContent className="pt-0">
          <Badge variant="outline" className="font-mono text-xs">
            <DecodeText text={certification.score} />
          </Badge>
        </CardContent>
      )}
    </Reveal>
  )
}

export default function Certifications({ certifications }: CertificationsProps) {
  if (!certifications.certifications.length) return null

  return (
    <section id="certifications" className="py-20 md:py-28 bg-background/85 section-glow [--glow:38_92%_50%] [--glow-x:50%] [--glow-y:0%]">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <Reveal className="mb-16">
            <div className="section-eyebrow">
              <DecodeText text="Credentials" />
            </div>
            <DecodeText as="h2" text="Certifications" className="section-title mb-4" />
            <p className="text-xl text-muted-foreground max-w-2xl">
              Credentials that support the profile above.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {certifications.certifications.map(cert => (
              <CertificationCard key={cert.id} certification={cert} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
