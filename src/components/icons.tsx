import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

export const IconLayers = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m12 3 8.5 5-8.5 5-8.5-5L12 3Z" />
    <path d="m3.5 13 8.5 5 8.5-5" />
    <path d="m3.5 17.5 8.5 5 8.5-5" />
  </svg>
)

export const IconMail = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    <path d="m3.5 6.5 8 6 8-6" />
  </svg>
)

export const IconMapPin = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
)

export const IconGithub = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={1.6}>
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.6 2.6 5.5 2.9 5.5 2.9a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.1 9.3c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  </svg>
)

export const IconTelegram = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={1.6}>
    <path d="M21 4 3 11.5l6 2M21 4l-3.5 16-7.5-6.5M21 4 9.5 13.5m0 0L9 19l1.5-3" />
  </svg>
)

export const IconLinkedin = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={1.6}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    <path d="M8 10.5V16M8 8v.01M12 16v-3.3c0-1.5.9-2.4 2.1-2.4 1.2 0 1.9.8 1.9 2.4V16" />
  </svg>
)

export const IconX = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
)

export const IconExternalLink = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M14 5h5v5M18.5 5.5 10 14M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
  </svg>
)

export const IconArrowRight = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 12h16M13 5l7 7-7 7" />
  </svg>
)

export const IconArrowDown = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 4v16M5 13l7 7 7-7" />
  </svg>
)

export const IconCheckCircle = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.3 2.3L15.5 10" />
  </svg>
)

export const IconAlertCircle = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16v.01" />
  </svg>
)

export const IconMenu = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
)

export const IconClose = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m6 6 12 12" />
    <path d="m18 6-12 12" />
  </svg>
)

export const IconHome = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m3 11 9-7.5 9 7.5" />
    <path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9.5" />
  </svg>
)

export const IconFolder = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-12Z" />
  </svg>
)

export const IconBriefcase = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M3 13h18" />
  </svg>
)

export const IconTerminal = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <path d="m7.5 10 3 2.5-3 2.5" />
    <path d="M13 15h3.5" />
  </svg>
)

export const IconGrid = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </svg>
)
