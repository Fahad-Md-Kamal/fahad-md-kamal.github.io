import { useState } from 'react'
import type { Profile } from '../types'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { IconMail, IconGithub, IconLinkedin, IconTelegram, IconWhatsapp, IconExternalLink, IconCheckCircle, IconAlertCircle } from '@/components/icons'
import { whatsappLink, whatsappGreeting } from '@/lib/whatsapp'
import RevealText from './RevealText'
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
      wide: true,
      href: `mailto:${profile.contact?.email || profile.email}`,
      description: 'Direct technical communication'
    },
    {
      Icon: IconGithub,
      label: 'GitHub',
      value: 'Code & projects',
      href: profile.social.github,
      description: 'Code samples and project architecture'
    },
    {
      Icon: IconLinkedin,
      label: 'LinkedIn',
      value: 'Connect with me',
      href: profile.social.linkedin,
      description: 'Career timeline and recommendations'
    },
    {
      Icon: IconWhatsapp,
      label: 'WhatsApp',
      value: 'Say hello',
      href: whatsappLink(profile.contact?.phone || profile.phone, whatsappGreeting(profile.name)),
      description: 'Opens a chat with a hello already written'
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
              <RevealText text="Get in Touch" />
            </div>
            <RevealText as="h2" text="Contact" className="section-title mb-4" />
            <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
              Open to full-stack engineering roles, contract work, and technical conversations.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Methods */}
            <Reveal className="space-y-8 min-w-0">
              <Card>
                <CardContent className="flex items-center gap-4 px-4 pb-4 pt-4">
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
                    <RevealText text="Communication Channels" />
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2.5">
                  {contactMethods.map((method, index) => (
                    <Reveal
                      as="a"
                      key={method.label}
                      delay={index * 60}
                      href={method.href}
                      target={method.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      title={method.description}
                      className={`group flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-background/30 px-3 py-2.5 hover:border-primary/40 hover:bg-background/50 active:bg-background/60 ${
                        method.wide ? 'col-span-2' : ''
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-surface text-primary">
                        <method.Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-text-primary leading-tight">{method.label}</span>
                        <span className={`truncate text-xs text-text-secondary ${method.wide ? 'block' : 'hidden sm:block'}`}>{method.value}</span>
                      </span>
                      <IconExternalLink className={`h-3.5 w-3.5 shrink-0 text-text-secondary transition-colors group-hover:text-primary ${method.wide ? '' : 'hidden sm:block'}`} />
                    </Reveal>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Response */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="text-xs font-mono uppercase tracking-wider text-primary flex items-center gap-2">
                    <RevealText text="Response Metrics" />
                    <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                      <RevealText text="24h" className="text-lg font-display font-bold text-primary block" />
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
                  <RevealText text="Send a Message" />
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
