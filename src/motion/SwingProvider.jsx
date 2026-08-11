import { useRef, useEffect, useCallback, useMemo } from 'react'
import { SwingContext } from './swingContext.js'

const OPEN_ANGLE = -137 * (Math.PI / 180) // -137° in radians
const PEEK_ANGLE = -9 * (Math.PI / 180) // small tilt to reveal the background on hover

// Tuned for a slightly slower, natural swing (~1.8s settle) while keeping the
// same mild overshoot (damping ratio ≈ 0.55). Lower stiffness = slower swing;
// SPRING_DAMP is scaled with √STIFFNESS to preserve the bounce character.
const STIFFNESS = 19
const SPRING_DAMP = 4.8

const SETTLE_ANGLE = 0.001
const SETTLE_VEL = 0.001

const FADE_START = 0.88 // fraction of the open swing before fading begins
const panelOpacity = (angle) => {
  const progress = angle / OPEN_ANGLE // 0 = closed, 1 = open
  const t = (progress - FADE_START) / (1 - FADE_START)
  return 1 - Math.min(Math.max(t, 0), 1)
}

export function SwingProvider({ children }) {
  const swingRef = useRef({ angle: 0, omega: 0, moving: false })
  // When disabled (e.g. the project panel is open on top of the grid), labels
  // stop reacting to the cursor. A ref so toggling it never rebinds the label
  // physics effects — which would re-randomize their resting swing.
  const cursorRef = useRef({ enabled: true })
  const targetRef = useRef(0)
  const openRef = useRef(false)
  const panelRef = useRef(null)
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const restCbRef = useRef(null)
  const swingListenersRef = useRef(new Set())

  const startLoop = useCallback(() => {
    if (rafRef.current) return
    lastRef.current = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05)
      lastRef.current = now

      const state = swingRef.current
      const target = targetRef.current

      const a = -STIFFNESS * (state.angle - target) - SPRING_DAMP * state.omega
      state.omega += a * dt
      state.angle += state.omega * dt

      const panelEl = panelRef.current
      if (panelEl) {
        panelEl.style.transform = `rotate(${state.angle}rad)`
        panelEl.style.opacity = panelOpacity(state.angle)
      }

      const settled =
        Math.abs(state.angle - target) < SETTLE_ANGLE &&
        Math.abs(state.omega) < SETTLE_VEL

      if (settled) {
        state.angle = target
        state.omega = 0
        state.moving = false
        if (panelEl) {
          panelEl.style.transform = `rotate(${target}rad)`
          panelEl.style.opacity = panelOpacity(target)
        }
        rafRef.current = 0
        if (target === 0 && restCbRef.current) {
          const cb = restCbRef.current
          restCbRef.current = null
          cb()
        }
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const setOpen = useCallback(
    (open, onRest) => {
      openRef.current = open
      targetRef.current = open ? OPEN_ANGLE : 0
      swingRef.current.moving = true
      // onRest fires once when the panel settles closed (used to swap the
      // revealed back-layer content only after the animation finishes).
      restCbRef.current = open ? null : onRest ?? null

      // Let the spring continue from the panel's current angle/velocity. Peek
      // and open swing in the same direction, so opening straight from a peek
      // tilt is smooth — snapping back to 0 first caused a visible reset.
      startLoop()
      swingListenersRef.current.forEach((fn) => fn())
    },
    [startLoop],
  )

  // Small tilt on hover that reveals the background behind the panel. Ignored
  // while the panel is open, or while a close animation is still in progress
  // (restCbRef set), so a hover near the X can't hijack the close swing.
  const setPeek = useCallback(
    (on) => {
      if (openRef.current || restCbRef.current) return
      targetRef.current = on ? PEEK_ANGLE : 0
      swingRef.current.moving = true

      startLoop()
      swingListenersRef.current.forEach((fn) => fn())
    },
    [startLoop],
  )

  // Lets sleeping label physics loops wake when a panel swing starts.
  const subscribeSwing = useCallback((fn) => {
    swingListenersRef.current.add(fn)
    return () => swingListenersRef.current.delete(fn)
  }, [])

  const registerPanel = useCallback((el) => {
    panelRef.current = el
  }, [])

  const setCursorEnabled = useCallback((on) => {
    cursorRef.current.enabled = on
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }
  }, [])

  const ctx = useMemo(
    () => ({
      swingRef,
      cursorRef,
      setOpen,
      setPeek,
      registerPanel,
      subscribeSwing,
      setCursorEnabled,
    }),
    [setOpen, setPeek, registerPanel, subscribeSwing, setCursorEnabled],
  )

  return <SwingContext.Provider value={ctx}>{children}</SwingContext.Provider>
}
