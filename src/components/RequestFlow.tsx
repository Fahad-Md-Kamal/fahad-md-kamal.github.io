// A small, decorative picture of how a backend request travels: client → API → queue → database.
// Motion is CSS-only and is disabled for visitors who prefer reduced motion.
const NODES = ['Client', 'API', 'Queue', 'Database']

export default function RequestFlow() {
  return (
    <div
      className="flex items-center justify-center max-w-xl mx-auto px-4 mb-6 sm:mb-8"
      role="img"
      aria-label="A request flowing from client to API to queue to database"
    >
      {NODES.map((node, i) => (
        <div key={node} className="flex items-center flex-1 last:flex-none">
          <span className="rounded-lg border border-border/70 bg-surface/60 px-2.5 py-1 text-[10px] sm:text-xs font-mono text-text-secondary">
            {node}
          </span>
          {i < NODES.length - 1 && (
            <span className="relative flex-1 h-px mx-1.5 sm:mx-2 bg-border/70" aria-hidden="true">
              <span
                className="flow-dot absolute -top-[2px] h-[5px] w-[5px] rounded-full bg-primary shadow-glow"
                style={{ animationDelay: `${i * 0.8}s` }}
              />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
