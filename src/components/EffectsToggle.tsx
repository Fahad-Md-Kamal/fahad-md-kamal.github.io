import { useEffectsEnabled } from '@/lib/effects'
import { DockGroup, DockButton } from './SideDock'
import { IconSparkles } from './icons'

// Turns the animated background on or off.
export function EffectsButtons() {
  const { enabled, setEnabled } = useEffectsEnabled()
  return (
    <DockGroup label="Effects">
      <DockButton
        label={enabled ? 'Turn background effects off' : 'Turn background effects on'}
        Icon={IconSparkles}
        active={enabled}
        onClick={() => setEnabled(!enabled)}
      />
    </DockGroup>
  )
}
