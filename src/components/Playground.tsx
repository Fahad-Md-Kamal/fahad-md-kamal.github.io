import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DecodeText from './DecodeText'
import Reveal from './Reveal'
import { NotesContext, inputClass } from './playground/shared'
import { ALL_TOOLS, GROUPS } from './playground/registry'

const readToolFromUrl = (): string | undefined => {
  try {
    const id = new URLSearchParams(window.location.search).get('tool')
    return ALL_TOOLS.find(t => t.id === id)?.id
  } catch {
    return undefined
  }
}

export default function Playground() {
  const [toolId, setToolId] = useState(() => readToolFromUrl() ?? ALL_TOOLS[0].id)
  const [copied, setCopied] = useState(false)
  const [notesEl, setNotesEl] = useState<HTMLElement | null>(null)

  const tool = ALL_TOOLS.find(t => t.id === toolId) ?? ALL_TOOLS[0]
  const group = GROUPS.find(g => g.tools.some(t => t.id === tool.id))!
  const ActiveTool = tool.component

  // Only one category is open at a time; it starts on the active tool's category.
  const [openGroup, setOpenGroup] = useState<string | null>(group.id)

  // A shared link like /?tool=jwt should land on the Playground.
  useEffect(() => {
    if (readToolFromUrl()) {
      const timer = setTimeout(() => document.getElementById('playground')?.scrollIntoView(), 150)
      return () => clearTimeout(timer)
    }
  }, [])

  const choose = (id: string) => {
    setToolId(id)
    const owner = GROUPS.find(g => g.tools.some(t => t.id === id))
    if (owner) setOpenGroup(owner.id)
    setCopied(false)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('tool', id)
      window.history.replaceState(null, '', url)
    } catch {
      // Updating the address bar is a nicety, so ignore failures.
    }
  }

  const copyLink = async () => {
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('tool', tool.id)
      url.hash = 'playground'
      await navigator.clipboard.writeText(url.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section id="playground" className="py-20 md:py-28 section-workbench">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="w-full">
          <Reveal className="mb-10">
            <div className="section-eyebrow">
              <DecodeText text="Playground" />
            </div>
            <DecodeText as="h2" text="Try it yourself" className="section-title mb-4" />
            <p className="text-lg text-text-secondary max-w-3xl leading-relaxed">
              {ALL_TOOLS.length} tools that run in your browser. Nothing you type ever leaves it.
            </p>
          </Reveal>

          <Reveal className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
            {/* Sidebar */}
            <aside className="lg:col-start-1 lg:row-start-1 lg:row-span-2 xl:row-span-1">
              {/* Small screens: a compact picker */}
              <div className="lg:hidden">
                <label htmlFor="tool-select" className="sr-only">Choose a tool</label>
                <select
                  id="tool-select"
                  value={tool.id}
                  onChange={e => choose(e.target.value)}
                  className={`${inputClass} font-sans`}
                >
                  {GROUPS.map(g => (
                    <optgroup key={g.id} label={g.label}>
                      {g.tools.map(t => (
                        <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Large screens: collapsible categories, one open at a time */}
              <nav className="hidden lg:block space-y-2" aria-label="Playground tools">
                {GROUPS.map(g => {
                  const open = openGroup === g.id
                  const hasActive = g.tools.some(t => t.id === tool.id)
                  return (
                    <div key={g.id} className="rounded-xl border border-border/60 bg-background/30 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenGroup(open ? null : g.id)}
                        aria-expanded={open}
                        aria-controls={`group-${g.id}`}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className={`text-xs font-mono uppercase tracking-wider ${hasActive ? 'text-primary' : 'text-text-secondary'}`}
                          >
                            {g.label}
                          </span>
                          <span className="text-[11px] font-mono text-text-secondary/70">{g.tools.length}</span>
                        </span>
                        <span
                          className={`text-text-secondary transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
                          aria-hidden="true"
                        >
                          ›
                        </span>
                      </button>
                      {open && (
                        <ul id={`group-${g.id}`} className="px-1.5 pb-1.5 space-y-0.5 animate-fade-in">
                          {g.tools.map(t => {
                            const active = t.id === tool.id
                            return (
                              <li key={t.id}>
                                <button
                                  type="button"
                                  onClick={() => choose(t.id)}
                                  aria-current={active ? 'true' : undefined}
                                  className={`w-full flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-left text-sm transition-colors ${
                                    active
                                      ? 'border-primary bg-primary/10 text-text-primary'
                                      : 'border-transparent text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
                                  }`}
                                >
                                  <span className="text-base w-5 text-center" aria-hidden="true">{t.icon}</span>
                                  <span className="truncate">{t.label}</span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </nav>
            </aside>

            {/* Tool panel */}
            <div className="lg:col-start-2 lg:row-start-1 rounded-2xl border border-border/60 bg-card/60 shadow-soft overflow-hidden min-w-0">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 p-5 sm:p-6">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 shrink-0 rounded-xl border border-border/60 bg-background/50 flex items-center justify-center text-2xl" aria-hidden="true">
                    {tool.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-display font-semibold text-text-primary">{tool.label}</h3>
                    <p className="text-sm text-text-secondary mt-0.5">{tool.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="text-xs font-mono">{group.label}</Badge>
                      <Badge variant="outline" className="text-xs font-mono border-green-500/30 text-green-400">
                        runs in your browser
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={copyLink}>
                  {copied ? 'Link copied' : 'Copy link'}
                </Button>
              </header>

              <div key={tool.id} className="p-5 sm:p-6 animate-fade-in">
                <NotesContext.Provider value={{ target: notesEl }}>
                  <ActiveTool />
                </NotesContext.Provider>
              </div>
            </div>

            {/* Notes column: each tool's note appears here */}
            <aside
              aria-label={`Notes about ${tool.label}`}
              className="lg:col-start-2 lg:row-start-2 xl:col-start-3 xl:row-start-1 min-w-0"
            >
              <div className="px-1 mb-2 text-[11px] font-mono uppercase tracking-wider text-text-secondary">
                Notes · {tool.label}
              </div>
              <div ref={setNotesEl} />
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
