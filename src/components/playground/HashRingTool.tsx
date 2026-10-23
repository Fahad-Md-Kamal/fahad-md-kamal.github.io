import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FieldLabel, Note, Segmented } from './shared'

const NODE_COLORS = ['#38bdf8', '#f59e0b', '#22c55e', '#f472b6', '#fb923c', '#a78bfa']
const NODE_NAMES = ['node-A', 'node-B', 'node-C', 'node-D', 'node-E', 'node-F']
const KEY_COUNT = 40

// 32-bit string hash with an avalanche step so similar names spread around the ring.
function hash32(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

const KEYS = Array.from({ length: KEY_COUNT }, (_, i) => `key-${i + 1}`)
const KEY_HASHES = KEYS.map(hash32)

interface RingPoint {
  hash: number
  node: string
}

function buildRing(nodes: string[], vnodes: number): RingPoint[] {
  const points: RingPoint[] = []
  for (const node of nodes) {
    for (let v = 0; v < vnodes; v++) points.push({ hash: hash32(`${node}#${v}`), node })
  }
  return points.sort((a, b) => a.hash - b.hash)
}

// A key belongs to the first ring point clockwise from its position.
function assignConsistent(nodes: string[], vnodes: number): string[] {
  const ring = buildRing(nodes, vnodes)
  if (ring.length === 0) return KEYS.map(() => '')
  return KEY_HASHES.map(h => (ring.find(p => p.hash >= h) ?? ring[0]).node)
}

function assignModulo(nodes: string[]): string[] {
  if (nodes.length === 0) return KEYS.map(() => '')
  return KEY_HASHES.map(h => nodes[h % nodes.length])
}

const SIZE = 300
const CENTER = SIZE / 2
const RADIUS = 105

const point = (hash: number, radius: number) => {
  const angle = (hash / 2 ** 32) * Math.PI * 2 - Math.PI / 2
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) }
}

interface Change {
  consistentMoved: number
  moduloMoved: number
  description: string
}

export default function HashRingTool() {
  const [nodes, setNodes] = useState<string[]>(NODE_NAMES.slice(0, 3))
  const [vnodes, setVnodes] = useState(5)
  const [change, setChange] = useState<Change | null>(null)

  const assignment = useMemo(() => assignConsistent(nodes, vnodes), [nodes, vnodes])
  const ring = useMemo(() => buildRing(nodes, vnodes), [nodes, vnodes])
  const colorOf = (node: string) => NODE_COLORS[NODE_NAMES.indexOf(node)] ?? '#888'

  const counts = nodes.map(n => ({ node: n, count: assignment.filter(a => a === n).length }))

  const applyChange = (next: string[], description: string) => {
    const beforeC = assignConsistent(nodes, vnodes)
    const afterC = assignConsistent(next, vnodes)
    const beforeM = assignModulo(nodes)
    const afterM = assignModulo(next)
    setChange({
      description,
      consistentMoved: beforeC.filter((n, i) => n !== afterC[i]).length,
      moduloMoved: beforeM.filter((n, i) => n !== afterM[i]).length,
    })
    setNodes(next)
  }

  const addNode = () => {
    const name = NODE_NAMES.find(n => !nodes.includes(n))
    if (name) applyChange([...nodes, name], `Added ${name}`)
  }

  const removeNode = (name: string) => {
    if (nodes.length > 1) applyChange(nodes.filter(n => n !== name), `Removed ${name}`)
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-sm mx-auto" role="img" aria-label="Hash ring with servers and keys">
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="currentColor" className="text-border" strokeWidth="2" />
          {ring.map((p, i) => {
            const pos = point(p.hash, RADIUS)
            return <circle key={`${p.node}-${i}`} cx={pos.x} cy={pos.y} r="4" fill={colorOf(p.node)} stroke="#0b0f14" strokeWidth="1" />
          })}
          {KEYS.map((k, i) => {
            const pos = point(KEY_HASHES[i], RADIUS - 18)
            return <circle key={k} cx={pos.x} cy={pos.y} r="3" fill={colorOf(assignment[i])} opacity="0.9" />
          })}
          <text x={CENTER} y={CENTER - 4} textAnchor="middle" className="fill-text-secondary" fontSize="11" fontFamily="monospace">hash ring</text>
          <text x={CENTER} y={CENTER + 12} textAnchor="middle" className="fill-text-secondary" fontSize="10" fontFamily="monospace">{KEY_COUNT} keys</text>
        </svg>

        <div className="space-y-4">
          <div>
            <FieldLabel>Servers</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {nodes.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => removeNode(n)}
                  disabled={nodes.length === 1}
                  title={nodes.length === 1 ? 'Keep at least one server' : `Remove ${n}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/60 px-3 py-1.5 text-xs font-mono text-text-primary hover:border-red-400/60 disabled:opacity-60"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: colorOf(n) }} />
                  {n} <span aria-hidden="true">×</span>
                  <span className="sr-only">remove</span>
                </button>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={addNode} disabled={nodes.length >= NODE_NAMES.length}>
                + Add server
              </Button>
            </div>
          </div>

          <div>
            <FieldLabel>Virtual nodes per server</FieldLabel>
            <Segmented
              label="Virtual nodes per server"
              value={String(vnodes)}
              options={[{ id: '1' }, { id: '5' }, { id: '20' }, { id: '60' }]}
              onChange={v => { setVnodes(Number(v)); setChange(null) }}
              size="sm"
            />
          </div>

          <ul className="space-y-1.5 text-sm font-mono">
            {counts.map(c => (
              <li key={c.node} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: colorOf(c.node) }} />
                <span className="w-16 text-text-secondary">{c.node}</span>
                <span className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <span className="block h-full" style={{ width: `${(c.count / KEY_COUNT) * 100}%`, background: colorOf(c.node) }} />
                </span>
                <span className="w-8 text-right text-text-primary">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {change && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm" aria-live="polite">
          <div className="text-text-primary font-medium mb-1">{change.description}</div>
          <div className="font-mono text-text-secondary">
            Consistent hashing moved <span className="text-green-400">{change.consistentMoved}</span> of {KEY_COUNT} keys.
          </div>
          <div className="font-mono text-text-secondary">
            Plain <span className="text-text-primary">hash % servers</span> would have moved{' '}
            <span className="text-red-400">{change.moduloMoved}</span> of {KEY_COUNT}.
          </div>
        </div>
      )}

      <Note title="The idea.">
        Servers and keys are both hashed onto a circle, and each key belongs to the next server clockwise. When a server joins
        or leaves, only the keys next to it move, whereas with <span className="font-mono">hash % N</span> almost every key
        changes server, which empties caches and triggers a stampede. Virtual nodes (many points per server) even out the load.
        Try 1 virtual node and then 60 and compare the bars.
      </Note>
    </div>
  )
}
