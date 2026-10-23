import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DecodeText from './DecodeText'
import Reveal from './Reveal'

interface BlogPost {
  slug: string
  title: string
  date: string
  formattedDate: string
  excerpt: string
  html: string
}

// Lightweight front-matter parser (key: value per line between --- blocks)
const parseFrontMatter = (raw: string) => {
  if (!raw.startsWith('---')) return { data: {} as Record<string, string>, content: raw.trim() }

  const end = raw.indexOf('---', 3)
  if (end === -1) return { data: {} as Record<string, string>, content: raw.trim() }

  const fmText = raw.slice(3, end).trim()
  const body = raw.slice(end + 3).trim()

  const data: Record<string, string> = {}
  fmText.split('\n').forEach(line => {
    const [key, ...rest] = line.split(':')
    if (!key || rest.length === 0) return
    data[key.trim()] = rest.join(':').trim().replace(/^['"]|['"]$/g, '')
  })

  return { data, content: body }
}

// Minimal markdown → HTML renderer (headings, lists, bold/italic, code, links)
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const formatInline = (text: string) => {
  let t = escapeHtml(text)
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>')
  t = t.replace(/`(.+?)`/g, '<code>$1</code>')
  t = t.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>')
  return t
}

const renderMarkdown = (raw: string) => {
  const lines = raw.split('\n')
  const html: string[] = []
  let inList = false
  let inCode = false
  let codeBuffer = ''

  const flushList = () => {
    if (inList) html.push('</ul>')
    inList = false
  }

  const flushCode = () => {
    if (!inCode) return
    html.push(`<pre><code>${escapeHtml(codeBuffer.replace(/\n$/,''))}</code></pre>`)
    codeBuffer = ''
    inCode = false
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        flushCode()
      } else {
        flushList()
        inCode = true
        codeBuffer = ''
      }
      continue
    }

    if (inCode) {
      codeBuffer += line + '\n'
      continue
    }

    if (/^\s*$/.test(line)) {
      flushList()
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      flushList()
      const level = headingMatch[1].length
      const content = formatInline(headingMatch[2].trim())
      html.push(`<h${level}>${content}</h${level}>`)
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      const item = line.replace(/^[-*]\s+/, '')
      html.push(`<li>${formatInline(item)}</li>`)
      continue
    }

    flushList()
    html.push(`<p>${formatInline(line)}</p>`)
  }

  flushList()
  flushCode()
  return html.join('\n')
}

const blogFiles = import.meta.glob('/src/blogs/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

export default function Blogs() {
  const posts = useMemo<BlogPost[]>(() => {
    return Object.entries(blogFiles)
      .map(([path, raw]) => {
        const { data, content } = parseFrontMatter(raw)
        const slug = path.split('/').pop()?.replace('.md', '') || 'post'
        const title = data.title || slug
        const date = data.date || ''
        const parsedDate = date ? new Date(date) : null
        const formattedDate = parsedDate ? parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Undated'
        const excerpt = (data.excerpt || content.split('\n').find(l => l.trim())?.slice(0, 140) || '').trim() + (data.excerpt || content.split('\n').find(l => l.trim()) ? '...' : '')
        return {
          slug,
          title,
          date,
          formattedDate,
          excerpt,
          html: renderMarkdown(content)
        }
      })
      .sort((a, b) => (new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()))
  }, [])

  const [modalPost, setModalPost] = useState<BlogPost | null>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalPost(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Lock background scroll when modal is open
  useEffect(() => {
    const previous = document.body.style.overflow
    if (modalPost) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = previous
    }
    return () => {
      document.body.style.overflow = previous
    }
  }, [modalPost])

  if (!posts.length) return null

  return (
    <section id="blogs" className="py-20 md:py-28 bg-background/85 section-glow [--glow:340_82%_60%] [--glow-x:50%] [--glow-y:100%]">
      <div className="section-container">
        <div className="max-w-6xl mx-auto">
          <Reveal className="mb-12">
            <div className="section-eyebrow">
              <DecodeText text="Writing" />
            </div>
            <DecodeText as="h2" text="Technical Notes" className="section-title mb-4" />
            <p className="text-text-secondary">Occasional write-ups on architecture, lessons learned, and experiments.</p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={i * 80} as={Card as any} className="card-hover h-full">
                <div className="p-5 flex flex-col gap-3 h-full">
                  <div>
                    <DecodeText text={post.title} className="text-lg text-text-primary font-display font-semibold block" />
                    <div className="text-xs text-text-secondary font-mono mt-1">{post.formattedDate}</div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed flex-1">{post.excerpt}</p>
                  <div>
                    <Button size="sm" variant="outline" onClick={() => setModalPost(post)}>
                      Read
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {modalPost && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 overflow-y-auto overscroll-contain"
              onClick={() => setModalPost(null)}
            >
              <div
                className="max-w-3xl w-full max-h-[85vh] overflow-y-auto bg-surface rounded-2xl border border-border/60 shadow-glow-lg"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-start justify-between p-4 border-b border-border/60">
                  <div>
                    <DecodeText as="h3" text={modalPost.title} className="text-2xl text-text-primary font-display" />
                    <p className="text-xs text-text-secondary font-mono">{modalPost.formattedDate}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setModalPost(null)}>
                    Close
                  </Button>
                </div>
                <div className="p-6">
                  <article id={`blogs-${modalPost.slug}`} className="markdown-content" dangerouslySetInnerHTML={{ __html: modalPost.html }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
