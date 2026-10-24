import type { Profile } from '../types'
import { DockGroup, DockLink } from './SideDock'
import { IconMail, IconWhatsapp, IconLinkedin, IconGithub } from './icons'
import { whatsappLink, whatsappGreeting } from '@/lib/whatsapp'

// Quick ways to reach me, available from anywhere on the page.
export function ContactButtons({ profile }: { profile: Profile }) {
  return (
    <DockGroup label="Contact">
      <DockLink label="Email me" Icon={IconMail} href={`mailto:${profile.contact?.email || profile.email}`} />
      <DockLink
        label="Message on WhatsApp"
        Icon={IconWhatsapp}
        href={whatsappLink(profile.contact?.phone || profile.phone, whatsappGreeting(profile.name))}
      />
      <DockLink label="LinkedIn" Icon={IconLinkedin} href={profile.social.linkedin} />
      <DockLink label="GitHub" Icon={IconGithub} href={profile.social.github} />
    </DockGroup>
  )
}
