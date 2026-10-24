import { useRef } from 'react'
import { useEffectsEnabled } from '@/lib/effects'
import { playTap, useSoundEnabled, useSoundVolume } from '@/lib/sound'
import { DockGroup, DockButton } from './SideDock'
import { IconSparkles, IconVolume, IconVolumeOff } from './icons'

// A volume slider. Moving it plays a soft tick so you can hear the new level.
function VolumeSlider({ className = '' }: { className?: string }) {
  const { volume, setVolume } = useSoundVolume()
  const lastPreview = useRef(0)

  const change = (value: number) => {
    setVolume(value / 100)
    const now = performance.now()
    if (now - lastPreview.current > 160) {
      lastPreview.current = now
      playTap()
    }
  }

  return (
    <label className={`flex items-center gap-3 ${className}`}>
      <span className="sr-only">Volume</span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(volume * 100)}
        onChange={e => change(Number(e.target.value))}
        data-sound="none"
        className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[hsl(var(--primary))]"
      />
      <span className="w-9 shrink-0 text-right font-mono text-xs text-text-secondary">{Math.round(volume * 100)}%</span>
    </label>
  )
}

// Turns the animated background and the UI sounds on or off, and sets the volume.
export function EffectsButtons() {
  const { enabled: effects, setEnabled: setEffects } = useEffectsEnabled()
  const { enabled: sound, setEnabled: setSound } = useSoundEnabled()
  const { volume } = useSoundVolume()
  const audible = sound && volume > 0

  return (
    <>
      <DockGroup label="Effects">
        <DockButton
          label={effects ? 'Turn background effects off' : 'Turn background effects on'}
          Icon={IconSparkles}
          active={effects}
          onClick={() => setEffects(!effects)}
        />
        {/* With a mouse, hovering (or focusing) the speaker slides the volume slider out beside it */}
        <div className="group relative">
          <DockButton
            label={sound ? 'Turn sound off' : 'Turn sound on'}
            Icon={audible ? IconVolume : IconVolumeOff}
            active={sound}
            onClick={() => setSound(!sound)}
          />
          <div className="absolute right-full top-1/2 hidden -translate-y-1/2 pr-3 sm:[@media(hover:hover)]:group-has-[:focus-visible]:block sm:[@media(hover:hover)]:group-hover:block">
            <div className="w-48 rounded-xl border border-border/70 bg-card/95 px-3.5 py-2.5 shadow-soft backdrop-blur animate-fade-in">
              <VolumeSlider />
            </div>
          </div>
        </div>
      </DockGroup>

      {/* Touch screens have no hover, so the slider stays in view there */}
      <VolumeSlider className={`sm:[@media(hover:hover)]:hidden ${sound ? '' : 'opacity-50'}`} />
    </>
  )
}
