import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import Label from '../label/Label.jsx'

const OPEN_ANGLE = -137 * (Math.PI / 180)
const STIFFNESS = 19
const SPRING_DAMP = 4.8
const SETTLE = 0.001
const FADE_START = 0.88

const MIN_SHOW_MS = 900

const Layer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: calc(100% - 20px) 20px;
  will-change: transform;

  .label-stage {
    transform: scale(0.8);
    transform-origin: center;
  }
`

export default function LoadingScreen({ done, onGone }) {
  const layerRef = useRef(null)
  const springRef = useRef({ angle: 0, omega: 0 })
  const mountedAtRef = useRef(0)
  const onGoneRef = useRef(onGone)

  useEffect(() => {
    if (!mountedAtRef.current) mountedAtRef.current = performance.now()
  }, [])

  useEffect(() => {
    onGoneRef.current = onGone
  })

  useEffect(() => {
    if (!done) return
    const el = layerRef.current
    if (!el) return

    let raf = 0
    let timeout = 0
    let last = 0

    const start = () => {
      el.style.pointerEvents = 'none'
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const st = springRef.current
      const a = -STIFFNESS * (st.angle - OPEN_ANGLE) - SPRING_DAMP * st.omega
      st.omega += a * dt
      st.angle += st.omega * dt

      const progress = st.angle / OPEN_ANGLE
      const t = (progress - FADE_START) / (1 - FADE_START)
      el.style.transform = `rotate(${st.angle}rad)`
      el.style.opacity = 1 - Math.min(Math.max(t, 0), 1)

      if (
        Math.abs(st.angle - OPEN_ANGLE) < SETTLE &&
        Math.abs(st.omega) < SETTLE
      ) {
        onGoneRef.current?.()
        return
      }
      raf = requestAnimationFrame(tick)
    }

    const elapsed = performance.now() - mountedAtRef.current
    if (elapsed >= MIN_SHOW_MS) start()
    else timeout = setTimeout(start, MIN_SHOW_MS - elapsed)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(raf)
    }
  }, [done])

  return (
    <Layer ref={layerRef} aria-hidden={done || undefined} aria-label="Loading">
      <Label frontOnly standalone>
        <ul className="label-front-top">
          <li>Designer</li>
          <li>Programmer</li>
          <li>Maker</li>
        </ul>
        <div className="label-front-bottom">
          <span>Yiğit</span>
          <span>Toprak</span>
        </div>
      </Label>
    </Layer>
  )
}
