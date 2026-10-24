import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DecodeText from './DecodeText'
import Reveal from './Reveal'
import { NotesContext } from './playground/shared'
import { IconClose } from './icons'
import { ALL_TOOLS, GROUPS } from './playground/registry'

const readToolFromUrl = (): string | undefined => {
  try {
    const id = new URLSearchParams(window.location.search).get('tool')
    return ALL_TOOLS.find(t => t.id === id)?.id
  } catch {
    return undefined
  }
}

const DESKTOP_QUERY = '(min-width: 1024px)'

// Phones and tablets get a tool list that opens each tool in a bottom sheet; wide screens get the workbench.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => setIsDesktop(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return isDesktop
}

export default function Playground() {
  const isDesktop = useIsDesktop()
  const [toolId, setToolId] = useState(() => readToolFromUrl() ?? ALL_TOOLS[0].id)
  const [copied, setCopied] = useState(false)
  const [notesEl, setNotesEl] = useState<HTMLElement | null>(null)
  // A shared link like /?tool=jwt opens straight into that tool's sheet on small screens.
  const [sheetOpen, setSheetOpen] = useState(() => !window.matchMedia(DESKTOP_QUERY).matches && !!readToolFromUrl())

  const tool = ALL_TOOLS.find(t => t.id === toolId) ?? ALL_TOOLS[0]
  const group = GROUPS.find(g => g.tools.some(t => t.id === tool.id))!
  const ActiveTool = tool.component
  const sheetShown = sheetOpen && !isDesktop

  // Only one category is open at a time; it starts on the active tool's category.
  const [openGroup, setOpenGroup] = useState<string | null>(group.id)

  // A shared link like /?tool=jwt should land on the Playground.
  useEffect(() => {
    if (readToolFromUrl()) {
      const timer = setTimeout(() => document.getElementById('playground')?.scrollIntoView(), 150)
      return () => clearTimeout(timer)
    }
  }, [])

  const setToolParam = (id: string | null) => {
    try {
      const url = new URL(window.location.href)
      if (id) url.searchParams.set('tool', id)
      else url.searchParams.delete('tool')
      window.history.replaceState(null, '', url)
    } catch {
      // Updating the address bar is a nicety, so ignore failures.
    }
  }

  const choose = (id: string) => {
    setToolId(id)
    const owner = GROUPS.find(g => g.tools.some(t => t.id === id))
    if (owner) setOpenGroup(owner.id)
    setCopied(false)
    setToolParam(id)
  }

  const openInSheet = (id: string) => {
    choose(id)
    setSheetOpen(true)
  }

  const closeSheet = () => {
    setSheetOpen(false)
    setToolParam(null)
  }

  // Bottom sheet: lock page scroll behind it and let Escape close it.
  useEffect(() => {
    if (!sheetShown) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSheetOpen(false)
        setToolParam(null)
      }
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [sheetShown])

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

  const toolBadges = (
    <div className="flex flex-wrap gap-2 mt-3">
      <Badge variant="outline" className="text-xs font-mono">{group.label}</Badge>
      <Badge variant="outline" className="text-xs font-mono border-green-500/30 text-green-400">
        runs in your browser
      </Badge>
    </div>
  )

  const toolBody = (
    <div key={tool.id} className="p-4 sm:p-6 animate-fade-in">
      <NotesContext.Provider value={{ target: notesEl }}>
        <ActiveTool />
      </NotesContext.Provider>
    </div>
  )

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

          {isDesktop ? (
            <Reveal className="grid grid-cols-[minmax(0,1fr)_minmax(0,3fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
              {/* Sidebar: collapsible categories, one open at a time */}
              <aside className="col-start-1 row-start-1 row-span-2 xl:row-span-1">
              <nav className="space-y-2" aria-label="Playground tools">
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
              <div className="col-start-2 row-start-1 rounded-2xl border border-border/60 bg-card/60 shadow-soft overflow-hidden min-w-0">
                <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 p-5 sm:p-6">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 shrink-0 rounded-xl border border-border/60 bg-background/50 flex items-center justify-center text-2xl" aria-hidden="true">
                      {tool.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-display font-semibold text-text-primary">{tool.label}</h3>
                      <p className="text-sm text-text-secondary mt-0.5">{tool.description}</p>
                      {toolBadges}
                    </div>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={copyLink}>
                    {copied ? 'Link copied' : 'Copy link'}
                  </Button>
                </header>
                {toolBody}
              </div>

              {/* Notes column: each tool's note appears here */}
              <aside aria-label={`Notes about ${tool.label}`} className="col-start-2 row-start-2 xl:col-start-3 xl:row-start-1 min-w-0">
                <div className="px-1 mb-2 text-[11px] font-mono uppercase tracking-wider text-text-secondary">
                  Notes · {tool.label}
                </div>
                <div ref={setNotesEl} />
              </aside>
            </Reveal>
          ) : (
            <>
              {/* Small screens: the list of tools; tapping one opens it in a bottom sheet */}
              <div className="space-y-7">
                {GROUPS.map(g => (
                  <Reveal key={g.id}>
                    <div className="mb-2.5 px-1 text-[11px] font-mono uppercase tracking-wider text-text-secondary">
                      {g.label}
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-2.5">
                      {g.tools.map(t => (
                        <li key={t.id}>
                          <button
                            type="button"
                            onClick={() => openInSheet(t.id)}
                            aria-haspopup="dialog"
                            className="w-full flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card/50 px-3.5 py-3 text-left transition-colors active:bg-white/[0.06] hover:border-primary/40"
                          >
                            <span className="w-11 h-11 shrink-0 rounded-xl border border-border/60 bg-background/50 flex items-center justify-center text-xl" aria-hidden="true">
                              {t.icon}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-text-primary">{t.label}</span>
                              <span className="block text-xs text-text-secondary leading-snug mt-0.5 line-clamp-2">{t.description}</span>
                            </span>
                            <span className="text-text-secondary text-lg" aria-hidden="true">›</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </div>

              {sheetShown &&
                createPortal(
                  <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={tool.label}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeSheet} />
                    <div className="absolute inset-x-0 bottom-0 max-h-[70dvh] flex flex-col rounded-t-3xl border-t border-border/60 bg-card shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.6)] animate-sheet-up">
                      <div className="shrink-0 pt-2.5 pb-1 flex justify-center" aria-hidden="true">
                        <span className="h-1 w-10 rounded-full bg-border" />
                      </div>
                      <header className="shrink-0 flex items-center gap-3 border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 pl-4 pr-2 pb-2 pt-0.5">
                        <div className="w-9 h-9 shrink-0 rounded-lg border border-border/60 bg-background/50 flex items-center justify-center text-lg" aria-hidden="true">
                          {tool.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-display font-semibold text-text-primary leading-tight truncate">{tool.label}</h3>
                          <p className="text-[11px] font-mono text-text-secondary truncate">
                            {group.label} · <span className="text-green-400">runs in your browser</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={closeSheet}
                          aria-label="Close"
                          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-text-secondary hover:bg-white/[0.06]"
                        >
                          <IconClose />
                        </button>
                      </header>
                      <div className="overflow-y-auto overscroll-contain pb-[calc(1rem+env(safe-area-inset-bottom))]">
                        <p className="px-4 pt-3 -mb-1 text-[13px] text-text-secondary">{tool.description}</p>
                        {toolBody}
                        <div className="px-4 pb-2">
                          <div className="mb-2 px-1 text-[11px] font-mono uppercase tracking-wider text-text-secondary">
                            Notes · {tool.label}
                          </div>
                          <div ref={setNotesEl} />
                          <Button type="button" size="sm" variant="outline" onClick={copyLink} className="mt-4 w-full">
                            {copied ? 'Link copied' : 'Copy link to this tool'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
