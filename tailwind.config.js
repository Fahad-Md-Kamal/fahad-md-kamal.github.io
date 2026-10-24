/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			surface: 'hsl(var(--surface))',
  			primary: {
  				'50': '#f0f9ff',
  				'100': '#e0f2fe',
  				'200': '#bae6fd',
  				'300': '#7dd3fc',
  				'400': '#38bdf8',
  				'500': '#0ea5e9',
  				'600': '#0284c7',
  				'700': '#0369a1',
  				'800': '#075985',
  				'900': '#0c4a6e',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'400': '#c4b5fd',
  				'500': '#a78bfa',
  				'600': '#8b5cf6',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			text: {
  				primary: 'hsl(var(--text-primary))',
  				secondary: 'hsl(var(--text-secondary))'
  			},
  			gray: {
  				'50': 'hsl(var(--muted-foreground) / 0.1)',
  				'100': 'hsl(var(--muted-foreground) / 0.2)', 
  				'200': 'hsl(var(--muted-foreground) / 0.3)',
  				'300': 'hsl(var(--muted-foreground) / 0.4)',
  				'400': 'hsl(var(--muted-foreground) / 0.6)',
  				'500': 'hsl(var(--muted-foreground) / 0.7)',
  				'600': 'hsl(var(--muted-foreground) / 0.8)',
  				'700': 'hsl(var(--muted) / 0.9)',
  				'800': 'hsl(var(--muted))',
  				'900': 'hsl(var(--surface))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			foreground: 'hsl(var(--foreground))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'IBM Plex Sans',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'Fira Code',
  				'Monaco',
  				'Cascadia Code',
  				'Segoe UI Mono',
  				'monospace'
  			],
  			display: [
  				'Space Grotesk',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		boxShadow: {
  			soft: '0 1px 1px 0 rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.45)',
  			glow: '0 1px 1px 0 rgb(0 0 0 / 0.04), 0 12px 32px -12px hsl(var(--primary) / 0.35), 0 0 0 1px hsl(var(--primary) / 0.12)',
  			'glow-lg': '0 20px 50px -15px hsl(var(--primary) / 0.35), 0 0 0 1px hsl(var(--primary) / 0.15)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.6s ease-in-out',
  			'slide-up': 'slideUp 0.6s ease-out',
  			'sheet-up': 'sheetUp 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
  			'bounce-gentle': 'bounceGentle 2s infinite',
  			'float-slow': 'floatSlow 9s ease-in-out infinite',
  			'float-slower': 'floatSlow 13s ease-in-out infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(20px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			sheetUp: {
  				'0%': {
  					transform: 'translateY(100%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			bounceGentle: {
  				'0%, 20%, 50%, 80%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'40%': {
  					transform: 'translateY(-6px)'
  				},
  				'60%': {
  					transform: 'translateY(-3px)'
  				}
  			},
  			floatSlow: {
  				'0%, 100%': {
  					transform: 'translate(0, 0) scale(1)'
  				},
  				'50%': {
  					transform: 'translate(2%, -4%) scale(1.08)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  // Keep plugins list empty to avoid requiring packages that aren't installed in this static build.
  plugins: [],
}
