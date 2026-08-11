import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { deviceTilt } from '../../motion/deviceTilt.js'

// Temporary diagnostic overlay, shown when the URL contains `?tilt`.
// Listens to raw `deviceorientation` itself (independent of the physics
// pipeline) so we can compare what the device reports against what the
// labels are being told.
const Box = styled.div`
  position: fixed;
  top: 60px;
  left: 10px;
  z-index: 99999;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.82);
  color: #7CFC00;
  font: 10px/1.6 monospace;
  white-space: pre;
  pointer-events: none;
`

const fmt = (v, digits = 1) =>
  typeof v === 'number' && Number.isFinite(v) ? v.toFixed(digits) : '—'

export default function TiltDebug() {
  const [, force] = useState(0)
  const raw = useRef({ count: 0, alpha: null, beta: null, gamma: null })

  useEffect(() => {
    const onOrientation = (e) => {
      raw.current = {
        count: raw.current.count + 1,
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma,
      }
    }
    window.addEventListener('deviceorientation', onOrientation)
    const timer = setInterval(() => force((n) => n + 1), 150)
    return () => {
      window.removeEventListener('deviceorientation', onOrientation)
      clearInterval(timer)
    }
  }, [])

  const r = raw.current
  const toDeg = (rad) => (rad * 180) / Math.PI
  const so = window.screen?.orientation

  const lines = [
    `raw events   ${r.count}`,
    `beta ${fmt(r.beta)}  gamma ${fmt(r.gamma)}  alpha ${fmt(r.alpha)}`,
    `tilt.angle   ${fmt(toDeg(deviceTilt.angle))}deg   mag ${fmt(deviceTilt.mag, 2)}`,
    `screen.orientation ${so?.angle ?? '—'} (${so?.type ?? 'n/a'})`,
    `window.orientation ${window.orientation ?? '—'}`,
    `viewport ${window.innerWidth}x${window.innerHeight}  touch ${navigator.maxTouchPoints}`,
    `hover:hover ${window.matchMedia('(hover: hover)').matches}`,
    `secureContext ${window.isSecureContext}`,
    `DOE.requestPermission ${typeof window.DeviceOrientationEvent?.requestPermission}`,
  ]

  return <Box aria-hidden="true">{lines.join('\n')}</Box>
}
