import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  setValue: (v: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

interface TabsProps {
  children: React.ReactNode
  className?: string
  defaultValue: string
}

export const Tabs = ({ children, className, defaultValue }: TabsProps) => {
  const [value, setValue] = React.useState(defaultValue)
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div role="tablist" className={cn("flex gap-1.5 p-1.5 rounded-2xl bg-surface/60 border border-border/60", className)}>
    {children}
  </div>
)

export const TabsTrigger = ({
  children,
  className,
  value,
}: {
  children: React.ReactNode
  className?: string
  value: string
}) => {
  const ctx = React.useContext(TabsContext)
  if (!ctx) {
    return <button className={cn("px-3 py-1 rounded border", className)}>{children}</button>
  }

  const active = ctx.value === value
  return (
    <button
      role="tab"
      aria-selected={active}
      aria-controls={`tab-${value}`}
      onClick={() => ctx.setValue(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          ctx.setValue(value)
        }
      }}
      className={cn(
        "px-3 py-1.5 rounded-xl border border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60",
        active ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-glow" : "text-text-secondary hover:text-text-primary hover:bg-text-primary/[0.05]",
        className
      )}
      aria-pressed={active}
      type="button"
    >
      {children}
    </button>
  )
}

export const TabsContent = ({
  children,
  className,
  value,
}: {
  children: React.ReactNode
  className?: string
  value: string
}) => {
  const ctx = React.useContext(TabsContext)
  const hidden = ctx ? ctx.value !== value : false
  return (
    <div
      role="tabpanel"
      id={`tab-${value}`}
      aria-hidden={hidden}
      className={cn(hidden && "hidden", className)}
    >
      {children}
    </div>
  )
}
