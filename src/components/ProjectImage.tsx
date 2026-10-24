import { useState } from 'react'
import type { Project } from '../types'
import { IconLayers } from './icons'

export function resolveAsset(path: string) {
  if (!path) return path
  if (path.startsWith('http')) return path
  const base = import.meta.env.BASE_URL || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

export function ProjectImage({ project, className }: { project: Project; className: string }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className={className}>
      {project.image && !imageError ? (
        <img
          src={resolveAsset(project.image)}
          alt={`${project.title} architecture overview`}
          className="absolute inset-0 w-full h-full object-cover object-top"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-secondary/70">
          <IconLayers className="w-8 h-8" />
          <span className="text-xs font-mono uppercase tracking-wider">{project.category}</span>
        </div>
      )}
    </div>
  )
}
