import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Profile } from '../types'
import DecodeText from './DecodeText'
import Reveal from './Reveal'

interface GithubActivityProps {
  profile: Profile
}

interface GithubStats {
  publicRepos: number
  followers: number
  totalStars: number
  topLanguages: string[]
}

function extractUsername(githubUrl?: string) {
  if (!githubUrl) return null
  const match = githubUrl.match(/github\.com\/([^/]+)/i)
  return match ? match[1] : null
}

export default function GithubActivity({ profile }: GithubActivityProps) {
  const username = extractUsername(profile.social?.github)
  const [stats, setStats] = useState<GithubStats | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!username) return
    let cancelled = false

    async function load() {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
        ])
        if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API request failed')

        const user = await userRes.json()
        const repos = await reposRes.json()

        const totalStars = Array.isArray(repos)
          ? repos.reduce((sum: number, repo: { stargazers_count?: number }) => sum + (repo.stargazers_count || 0), 0)
          : 0

        const languageCounts: Record<string, number> = {}
        if (Array.isArray(repos)) {
          for (const repo of repos) {
            if (repo.language) {
              languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
            }
          }
        }
        const topLanguages = Object.entries(languageCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([lang]) => lang)

        if (!cancelled) {
          setStats({
            publicRepos: user.public_repos ?? 0,
            followers: user.followers ?? 0,
            totalStars,
            topLanguages,
          })
        }
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [username])

  if (!username || failed) return null

  return (
    <section id="github" className="py-20 md:py-28 bg-surface/90 section-glow [--glow:38_92%_50%] [--glow-x:0%] [--glow-y:0%]">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <Reveal className="mb-16">
            <div className="section-eyebrow">
              <DecodeText text="Open Source" />
            </div>
            <DecodeText as="h2" text="GitHub Activity" className="section-title mb-4" />
            <p className="text-xl text-muted-foreground max-w-2xl">
              Live stats, pulled directly from the GitHub API.
            </p>
          </Reveal>

          <Reveal as={Card as any} className="shadow-soft">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {[
                  { label: 'Public Repos', value: stats?.publicRepos },
                  { label: 'Followers', value: stats?.followers },
                  { label: 'Total Stars', value: stats?.totalStars },
                  { label: 'Top Languages', value: stats?.topLanguages.length },
                ].map((stat, index) => (
                  <Reveal key={index} delay={index * 80} className="text-center h-24 flex flex-col rounded-xl border border-border/60 bg-background/40">
                    <div className="flex-1 flex items-center justify-center p-4">
                      <DecodeText text={String(stat.value ?? '—')} className="text-2xl font-display font-bold text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground py-2 px-4 border-t border-border/60">
                      {stat.label}
                    </div>
                  </Reveal>
                ))}
              </div>

              {stats?.topLanguages && stats.topLanguages.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {stats.topLanguages.map((lang, i) => (
                    <Reveal key={lang} delay={i * 50} as="span">
                      <Badge variant="secondary" className="font-mono text-xs">
                        <DecodeText text={lang} />
                      </Badge>
                    </Reveal>
                  ))}
                </div>
              )}

              <div className="text-center">
                <Button variant="outline" asChild href={profile.social.github} target="_blank" rel="noopener noreferrer">
                  View Full Profile on GitHub ↗
                </Button>
              </div>
            </CardContent>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
