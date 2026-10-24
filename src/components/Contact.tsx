import { useState } from 'react'
import type { Profile } from '../types'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { IconMail, IconGithub, IconLinkedin, IconTelegram, IconExternalLink, IconCheckCircle, IconAlertCircle } from '@/components/icons'
import DecodeText from './DecodeText'
import Reveal from './Reveal'

interface ContactProps {
  profile: Profile
}

export default function Contact({ profile }: ContactProps) {
  const resolveAsset = (path: string) => {
    if (!path) return path
    if (path.startsWith('http')) return path
    const base = import.meta.env.BASE_URL || '/'
    return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  }

  const [avatarError, setAvatarError] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setStatusMessage('')

    const emailBody = `Name: ${formData.name}\\nEmail: ${formData.email}\\n\\nMessage:\\n${formData.message}`
    const mailtoLink = `mailto:${profile.contact?.email || profile.email}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`

    // Open the user's email client with a pre-filled message
    window.location.href = mailtoLink

    setSubmitStatus('success')
    setStatusMessage('Opening your email client with the message pre-filled.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)

    setTimeout(() => {
      setSubmitStatus('idle')
      setStatusMessage('')
    }, 5000)
  }

  const contactMethods = [
    {
      Icon: IconMail,
      label: 'Email',
      value: profile.contact?.email || profile.email,
      href: `mailto:${profile.contact?.email || profile.email}`,
      description: 'Direct technical communication'
    },
    {
      Icon: IconGithub,
      label: 'GitHub',
      value: 'Technical portfolio & repositories',
      href: profile.social.github,
      description: 'Code samples and project architecture'
    },
    {
      Icon: IconLinkedin,
      label: 'LinkedIn',
      value: 'Professional networking',
      href: profile.social.linkedin,
      description: 'Career timeline and recommendations'
    },
    ...(profile.social.telegram ? [{
      Icon: IconTelegram,
      label: 'Telegram',
      value: '@fahadmdkamal',
      href: profile.social.telegram,
      description: 'Quick chat for time-sensitive discussions'
    }] : [])
  ]

  return (
    <section id="contact" className="py-20 md:py-28 bg-surface/90 section-glow [--glow-x:50%] [--glow-y:100%]">
      <div className="section-container">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <Reveal className="mb-16">
            <div className="section-eyebrow">
              <DecodeText text="Get in Touch" />
            </div>
            <DecodeText as="h2" text="Contact" className="section-title mb-4" />
            <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
              Open to full-stack engineering roles, contract work, and technical conversations.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Methods */}
            <Reveal className="space-y-8 min-w-0">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-border/60 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    {!avatarError ? (
                      <img
                        src={resolveAsset(profile.avatar)}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="text-primary font-display font-bold">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-display text-text-primary">{profile.name}</p>
                    <p className="text-xs font-mono text-text-secondary">{profile.role}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-primary flex items-center gap-2">
                    <DecodeText text="Communication Channels" />
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactMethods.map((method, index) => (
                    <Reveal
                      key={index}
                      delay={index * 80}
                      className="group rounded-xl border border-border/60 bg-background/30 hover:border-primary/40 hover:bg-background/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                      onClick={() => window.open(method.href, '_blank')}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-surface border border-border/60 rounded-xl flex items-center justify-center text-primary group-hover:text-primary/80 flex-shrink-0">
                            <method.Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-text-primary">
                                {method.label}
                              </h3>
                            </div>
                            <DecodeText text={method.value} className="text-sm text-text-secondary mb-2 block break-all" />
                            <p className="text-xs text-text-secondary">
                              {method.description}
                            </p>
                          </div>
                          <IconExternalLink className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Response */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-primary flex items-center gap-2">
                    <DecodeText text="Response Metrics" />
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                      <DecodeText text="24h" className="text-lg font-display font-bold text-primary block" />
                      <div className="text-xs text-text-secondary">Email Response</div>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                      <Badge variant="secondary" className="text-sm font-semibold bg-green-500/15 text-green-400 border-green-500/25">Available</Badge>
                      <div className="text-xs text-text-secondary mt-1">New Projects</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            {/* Contact Form */}
            <Reveal delay={120} as={Card as any} className="min-w-0">
              <CardHeader className="pb-4">
                <div className="text-xs font-mono uppercase tracking-wider text-primary flex items-center gap-2">
                  <DecodeText text="Send a Message" />
                  <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-mono text-text-secondary">
                        Name *
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="font-mono"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-mono text-text-secondary">
                        Email *
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="font-mono"
                        placeholder="your.email@domain.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-mono text-text-secondary">
                      Subject *
                    </Label>
                    <Input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="font-mono"
                      placeholder="Project discussion / Technical consultation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-mono text-text-secondary">
                      Technical Requirements *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="font-mono resize-none"
                      placeholder="Describe your system architecture needs, scale requirements, tech stack preferences, timeline, and any specific challenges..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Preparing email...
                      </>
                    ) : (
                      <>
                        Send Message
                      </>
                    )}
                  </Button>

                  {/* Status Messages */}
                  {submitStatus !== 'idle' && (
                    <div className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
                      submitStatus === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {submitStatus === 'success' ? (
                        <IconCheckCircle className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span>{statusMessage}</span>
                    </div>
                  )}

                  <p className="text-xs text-text-secondary text-center mt-4">
                    Opens your default email client with all fields filled in.
                  </p>
                </form>
              </CardContent>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
