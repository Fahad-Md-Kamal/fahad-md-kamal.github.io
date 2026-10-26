import { useSyncExternalStore } from 'react'

// Small UI sounds synthesized with the Web Audio API, so there are no audio files to download.
// Everything is kept quiet and short. Browsers only allow audio after the visitor has interacted
// with the page, and nothing plays at all until they switch sound on.

const STORAGE_KEY = 'sound'
const VOLUME_KEY = 'soundVolume'
const DEFAULT_VOLUME = 0.2 // a soft start; visitors can raise it with the slider

const listeners = new Set<() => void>()

// Sound is off until a visitor turns it on with the speaker button, and the choice is remembered.
const readEnabled = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

const readVolume = (): number => {
  try {
    const stored = parseFloat(localStorage.getItem(VOLUME_KEY) ?? '')
    if (Number.isFinite(stored)) return Math.min(1, Math.max(0, stored))
  } catch {
    // fall through to the default
  }
  return DEFAULT_VOLUME
}

// A straight line from silent to a little above the level the sounds were tuned at, so the
// slider percentage is easy to reason about: 20% is a fifth of the way up.
const gainFor = (v: number) => 1.5 * v

let enabled = readEnabled()
let volume = readVolume()

export const setSoundEnabled = (next: boolean) => {
  enabled = next
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
  } catch {
    // Not being able to remember the choice is fine.
  }
  listeners.forEach(listener => listener())
}

export const setSoundVolume = (next: number) => {
  volume = Math.min(1, Math.max(0, next))
  try {
    localStorage.setItem(VOLUME_KEY, String(volume))
  } catch {
    // Not being able to remember the choice is fine.
  }
  if (ctx && master) master.gain.setTargetAtTime(gainFor(volume), ctx.currentTime, 0.02)
  listeners.forEach(listener => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useSoundEnabled() {
  const value = useSyncExternalStore(subscribe, () => enabled)
  return { enabled: value, setEnabled: setSoundEnabled }
}

export function useSoundVolume() {
  const value = useSyncExternalStore(subscribe, () => volume)
  return { volume: value, setVolume: setSoundVolume }
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null

// A recorded firework (rising whistle, then a bang with a short tail), loaded after the first tap.
// If it cannot be loaded or decoded, the synthesized fireworks below are used instead.
const FIREWORK_URL = `${import.meta.env.BASE_URL}sounds/firework.m4a`
export const FIREWORK_BANG_AT = 1.45 // seconds into the recording where the bang starts
let firework: AudioBuffer | null = null
let fireworkRequested = false

async function loadFirework() {
  if (fireworkRequested || !ctx) return
  fireworkRequested = true
  try {
    const response = await fetch(FIREWORK_URL)
    if (!response.ok) return
    firework = await ctx.decodeAudioData(await response.arrayBuffer())
  } catch {
    // keep the synthesized sound
  }
}

export const hasFireworkSample = () => firework !== null

// Plays the recording from `from` seconds in, at `volume` (1 = as recorded).
function playFireworkSample(from: number, volume: number) {
  if (!ctx || !master || !firework) return false
  const src = ctx.createBufferSource()
  const gain = ctx.createGain()
  src.buffer = firework
  gain.gain.value = volume
  src.connect(gain).connect(master)
  src.start(0, from)
  return true
}

// Call from a user gesture (pointerdown / keydown) so the browser allows audio.
export function unlockAudio() {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = gainFor(volume)
    // A gentle limiter, so the louder sounds can never clip or crackle on small speakers.
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -14
    limiter.knee.value = 12
    limiter.ratio.value = 6
    limiter.attack.value = 0.003
    limiter.release.value = 0.15
    master.connect(limiter).connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  void loadFirework()
}

const ready = () => enabled && !document.hidden && ctx !== null && master !== null && ctx.state === 'running'

const getNoise = () => {
  if (!noise && ctx) {
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return noise
}

// A tone that starts at `from` Hz, glides to `to` Hz, and fades out.
function tone(type: OscillatorType, from: number, to: number, peak: number, duration: number, delay = 0) {
  if (!ctx || !master) return
  const t = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, t)
  osc.frequency.exponentialRampToValueAtTime(to, t + duration)
  gain.gain.setValueAtTime(peak, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + duration + 0.02)
}

// Filtered noise whose pitch sweeps between two frequencies: a soft "whoosh".
function sweep(from: number, to: number, peak: number, duration: number) {
  const buffer = getNoise()
  if (!ctx || !master || !buffer) return
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  src.buffer = buffer
  filter.type = 'bandpass'
  filter.Q.value = 0.9
  filter.frequency.setValueAtTime(from, t)
  filter.frequency.exponentialRampToValueAtTime(to, t + duration)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(peak, t + duration * 0.35)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  src.connect(filter).connect(gain).connect(master)
  src.start(t)
  src.stop(t + duration + 0.02)
}

let lastTap = 0
export function playTap() {
  if (!ready()) return
  const now = performance.now()
  if (now - lastTap < 60) return
  lastTap = now
  tone('sine', 620, 400, 0.11, 0.08)
  tone('triangle', 1600, 1200, 0.03, 0.03)
}

export const playOpen = () => ready() && sweep(320, 1500, 0.26, 0.26)
export const playClose = () => ready() && sweep(1400, 300, 0.22, 0.22)

export function playChime() {
  if (!ready()) return
  tone('sine', 880, 880, 0.14, 0.55)
  tone('sine', 1318, 1318, 0.115, 0.6, 0.09)
}

// ---- Fireworks: a rising whistle, then a crack and thump, then a scatter of tiny crackles ----

let lastAmbient = 0
// The fireworks that go off by themselves share one slot every couple of seconds, so a busy
// sky never turns into a wall of noise. Returns true when this volley may make sound.
export function claimAmbientSlot(): boolean {
  if (!ready()) return false
  const now = performance.now()
  if (now - lastAmbient < 2200) return false
  lastAmbient = now
  return true
}

// The whole recording (whistle, then bang). Returns false when it isn't available, so the
// caller can fall back to the synthesized version.
export function playFirework(volume = 0.75): boolean {
  if (!ready()) return false
  return playFireworkSample(0, volume)
}

// A thin whistle that climbs while the rocket rises (`duration` is its flight time).
export function playLaunch(duration = 0.95) {
  if (!ready() || !ctx || !master) return
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(420, t)
  osc.frequency.exponentialRampToValueAtTime(1900, t + duration)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.07, t + duration * 0.4)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration + 0.05)
  osc.connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + duration + 0.08)
}

// Tiny pops like sparks crackling as they fall.
function crackle(power: number, delay: number) {
  const buffer = getNoise()
  if (!ctx || !master || !buffer) return
  const count = 9 + Math.floor(Math.random() * 6)
  let at = delay
  for (let i = 0; i < count; i++) {
    at += 0.03 + Math.random() * 0.085
    const t = ctx.currentTime + at
    const src = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    src.buffer = buffer
    filter.type = 'highpass'
    filter.frequency.value = 2400 + Math.random() * 2200
    const peak = 0.11 * power * (1 - i / (count + 2))
    gain.gain.setValueAtTime(peak, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02)
    src.connect(filter).connect(gain).connect(master)
    src.start(t, Math.random() * 0.6, 0.03)
  }
}

let lastBang = 0
// The burst itself. `power` scales it; ambient fireworks are a little quieter than a tap's.
export function playBang(power = 1, ambient = false) {
  if (!ready() || !ctx || !master) return
  const now = performance.now()
  if (now - lastBang < 200) return
  lastBang = now
  const p = Math.min(1.4, power) * (ambient ? 0.6 : 1)
  if (playFireworkSample(Math.max(0, FIREWORK_BANG_AT - 0.04), 0.9 * Math.min(1, p))) return
  const buffer = getNoise()
  const t = ctx.currentTime

  // the crack: a short bright burst of noise
  if (buffer) {
    const src = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    src.buffer = buffer
    filter.type = 'bandpass'
    filter.frequency.value = 1800
    filter.Q.value = 0.6
    gain.gain.setValueAtTime(0.3 * p, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
    src.connect(filter).connect(gain).connect(master)
    src.start(t)
    src.stop(t + 0.15)
  }
  tone('sine', 190, 50, 0.32 * p, 0.55) // the low thump
  tone('triangle', 340, 110, 0.16 * p, 0.35) // body that laptop and phone speakers can reproduce
  sweep(1300, 220, 0.16 * p, 0.55) // the air rolling away
  crackle(p, 0.12)
}
