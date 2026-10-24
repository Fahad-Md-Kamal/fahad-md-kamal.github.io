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

export const IconSun = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
)

export const IconMoon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
)

export const IconMonitor = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
)

export const IconChevronLeft = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m15 5-7 7 7 7" />
  </svg>
)

export const IconChevronDown = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const IconWhatsapp = (props: IconProps) => (
  <svg {...base(props)} strokeWidth={1.6}>
    <path d="M3.5 20.5 5 16A8.5 8.5 0 1 1 8 19l-4.5 1.5Z" />
    <path d="M9.3 8.6c.2-.4.6-.4.8 0l.7 1.4c.1.3 0 .5-.2.7l-.5.5c.6 1.2 1.5 2.1 2.7 2.7l.5-.6c.2-.2.5-.3.7-.1l1.4.7c.4.2.4.6 0 1-.6.7-1.5.9-2.3.6-2.3-.8-4-2.5-4.8-4.8-.2-.8 0-1.6.5-2.1Z" />
  </svg>
)

export const IconSparkles = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M10 3.5 11.6 8 16 9.5 11.6 11 10 15.5 8.4 11 4 9.5 8.4 8 10 3.5Z" />
    <path d="M18 13.5 18.8 16 21 16.8 18.8 17.6 18 20 17.2 17.6 15 16.8 17.2 16 18 13.5Z" />
  </svg>
)

export const IconShield = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
    <path d="m9.2 12 2 2 3.8-4" />
  </svg>
)

export const IconZap = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H13L13 2Z" />
  </svg>
)

export const IconCpu = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </svg>
)

export const IconWorkflow = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <path d="M10 6.5h4a3 3 0 0 1 3 3V14" />
  </svg>
)

export const IconActivity = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 12h4l2.5-7 5 14 2.5-7H21" />
  </svg>
)

export const IconDollar = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2-.4-2.5-1.2M12 6.5V8m0 8v1.5" />
  </svg>
)

export const IconHeartPulse = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.5 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20Z" />
  </svg>
)

export const IconSmartphone = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </svg>
)

export const IconEye = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const IconTarget = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
)

export const IconCheck = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const IconCalendar = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
)

export const IconLock = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
)

export const IconFlag = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M5 3.5V21M5 4h12l-2.5 4 2.5 4H5" />
  </svg>
)

export const IconCode = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />
  </svg>
)

export const IconTrendingUp = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m3 17 6-6 4 4 8-8M15 7h6v6" />
  </svg>
)

export const IconLightbulb = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
  </svg>
)

export const IconServer = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="7" rx="2" />
    <rect x="3" y="13" width="18" height="7" rx="2" />
    <path d="M7 7.5h.01M7 16.5h.01" />
  </svg>
)

export const IconMessage = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 5h16v11H9l-5 4V5Z" />
  </svg>
)

export const IconGlobe = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
)

export const IconPlay = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M7 4.5v15l12-7.5-12-7.5Z" />
  </svg>
)

export const IconVolume = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
)

export const IconVolumeOff = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Z" />
    <path d="m16 9.5 5 5M21 9.5l-5 5" />
  </svg>
)
