import { useTheme, type ThemePreference } from '@/lib/theme'
import { DockGroup, DockButton } from './SideDock'
import { IconSun, IconMoon, IconMonitor } from './icons'

const OPTIONS: { id: ThemePreference; label: string; Icon: typeof IconSun }[] = [
  { id: 'light', label: 'Light theme', Icon: IconSun },
  { id: 'dark', label: 'Dark theme', Icon: IconMoon },
  { id: 'system', label: 'Match system theme', Icon: IconMonitor },
]

// The theme choices as a group of buttons for the side dock.
export function ThemeButtons() {
  const { preference, setTheme } = useTheme()
  return (
    <DockGroup label="Theme">
      {OPTIONS.map(({ id, label, Icon }) => (
        <DockButton key={id} label={label} Icon={Icon} active={preference === id} onClick={() => setTheme(id)} />
      ))}
    </DockGroup>
  )
}
