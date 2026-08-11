import { useRef, useEffect, useState } from 'react'
import { useSwing } from '../../motion/swingContext.js'
import { deviceTilt, subscribeTilt, initDeviceTilt } from '../../motion/deviceTilt.js'
import './Label.css'

const GRAVITY = 18
const DAMPING = 0.8
const START_ANGLE_MIN = 0.4
const START_ANGLE_MAX = 0.9
const START_VEL_MAX = 3
const RESTITUTION = 0.45
const MAX_OMEGA = 25

const LABEL_W = 280
const LABEL_H = 410
const CURSOR_RADIUS = 20
const PIN_X = LABEL_W / 2 // top center of front label; drives --pin-x

const BACK_MASS = 5
const BACK_COUPLING = 12

const STACK_BASE_MASS = 25
const STACK_MASS_STEP = 3
const STACK_COUPLING = BACK_COUPLING

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

// Touch devices have no hover: the "cursor" the labels would react to is a
// scrolling finger, and every swipe through the (full-width) label column
// whacked the labels at collision speed — flipping them over their pins and
// piling the sheets onto their neighbors. There the labels swing from
// gravity/device tilt only; the pointer is ignored entirely.
const HAS_HOVER =
  typeof window === 'undefined' ||
  !window.matchMedia ||
  window.matchMedia('(hover: hover)').matches

const VIDEO_RE = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?.*)?$/i
const isVideoSrc = (src, type) =>
  type === 'video' || (typeof src === 'string' && VIDEO_RE.test(src))

// Attach a node to both our local ref and the caller's ref (object or fn).
const assignRef = (ref, node) => {
  if (typeof ref === 'function') ref(node)
  else if (ref) ref.current = node
}

// Are.na attachments are raw uploads (5–30MB each); loading every label's
// video at mount was the main cause of slow page loads. Show the poster
// still immediately and only attach the video src once the label is near
// the viewport.
function LazyVideo({ src, poster, className, refProp, style, onMeasure }) {
  const elRef = useRef(null)
  // No IntersectionObserver (ancient browser) → just load eagerly.
  const [load, setLoad] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    if (load) return
    const el = elRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setLoad(true)
      },
      { rootMargin: '25%' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [load])

  // autoplay set before src is attached doesn't always kick in — nudge it.
  useEffect(() => {
    if (load) elRef.current?.play?.().catch(() => {})
  }, [load])

  return (
    <video
      className={className}
      ref={(node) => {
        elRef.current = node
        assignRef(refProp, node)
      }}
      style={style}
      src={load ? src : undefined}
      poster={poster ?? undefined}
      autoPlay
      loop
      muted
      playsInline
      preload={load ? 'auto' : 'none'}
      onLoadedMetadata={onMeasure}
    />
  )
}

function BackMedia({ src, type, poster, className, refProp, style, onMeasure }) {
  if (isVideoSrc(src, type)) {
    return (
      <LazyVideo
        src={src}
        poster={poster}
        className={className}
        refProp={refProp}
        style={style}
        onMeasure={onMeasure}
      />
    )
  }
  return (
    <img
      className={className}
      ref={refProp}
      style={style}
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onLoad={onMeasure}
    />
  )
}

// Ghost copy of a back sheet shown inside the glass blur. Images are plain
// <img> duplicates; videos become a <canvas> that mirrors the real (already
// decoding) video element frame-by-frame — see syncVideoGhost.
function GhostMedia({ src, type, refProp, style }) {
  if (!src) return null
  if (isVideoSrc(src, type)) {
    return (
      <canvas
        className="label-ghost-media"
        ref={refProp}
        style={style}
        aria-hidden="true"
      />
    )
  }
  return (
    <img
      className="label-ghost-media"
      ref={refProp}
      style={style}
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  )
}

// The ghost canvas renders at reduced resolution — the glass blurs it at 6px
// anyway, so extra pixels are wasted copy bandwidth.
const GHOST_MAX_W = 360

// Mirror a live <video> onto its ghost canvas. Frames are copied with
// drawImage (the video is decoded once, by the real element) using
// requestVideoFrameCallback, so copies happen only when the video actually
// produces a new frame; rAF is the fallback. Until the lazy video attaches
// its src and starts producing frames, the poster still fills the ghost.
function syncVideoGhost(video, canvas) {
  const ctx = canvas.getContext('2d')
  let stopped = false
  let handle = 0
  let frameDrawn = false
  const useRvfc = typeof video.requestVideoFrameCallback === 'function'

  const resizeTo = (w, h) => {
    if (!w || !h) return false
    const scale = Math.min(1, GHOST_MAX_W / w)
    const cw = Math.max(1, Math.round(w * scale))
    const ch = Math.max(1, Math.round(h * scale))
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw
      canvas.height = ch
    }
    return true
  }

  if (video.poster) {
    const img = new Image()
    img.onload = () => {
      if (stopped || frameDrawn) return
      if (resizeTo(img.naturalWidth, img.naturalHeight)) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
    }
    img.src = video.poster
  }

  const draw = () => {
    if (stopped) return
    if (
      video.readyState >= 2 &&
      resizeTo(video.videoWidth, video.videoHeight)
    ) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      frameDrawn = true
    }
    schedule()
  }

  const schedule = () => {
    if (stopped) return
    handle = useRvfc
      ? video.requestVideoFrameCallback(draw)
      : requestAnimationFrame(draw)
  }

  schedule()

  return () => {
    stopped = true
    if (useRvfc) video.cancelVideoFrameCallback?.(handle)
    else cancelAnimationFrame(handle)
  }
}

const randomSigned = (min, max) => {
  const mag = min + Math.random() * (max - min)
  return Math.random() < 0.5 ? -mag : mag
}

// Prevents looping over the top: 
// 1/2 * ω² ≤ g(1 + cos θ) 
// (This makes so much sense, but ai helped me with it, 
// it is a circular motion equation for a pendulum)
// The budget must use the label's *actual* gravity: computing it from the
// full GRAVITY constant while the label ran weaker gravity (gJitter and the
// device-tilt magnitude scale it down) under-braked and let hard knocks loop
// labels clean over the pin.
const TOP_MARGIN_FRAC = 0.04
const maxVel = (a, g) => {
  const budget = g * (1 + Math.cos(a)) - g * TOP_MARGIN_FRAC
  return budget > 0 ? Math.sqrt(2 * budget) : 0
}

// Cap speed only while moving toward the top (world angle ±π). This prevents
// looping over the pin without braking motion that is falling back toward
// rest — a symmetric clamp would freeze a label knocked near inverted.
const capTowardTop = (vel, worldAngle, g) => {
  const phi = Math.atan2(Math.sin(worldAngle), Math.cos(worldAngle))
  if (vel * phi <= 0) return vel
  const cap = maxVel(phi, g)
  return clamp(vel, -cap, cap)
}

// Below this speed/displacement every body counts as at rest and the rAF
// loop sleeps; it restarts on pointer movement or a new panel swing.
const SLEEP_EPS = 0.002

const displaced = (theta) => Math.abs(Math.sin(theta / 2))

function Label({
  backgroundImage,
  backgroundPoster,
  backWidth = 350,
  backStack = [],
  frontOnly = false,
  standalone = false,
  ignoreCursor = false,
  startAtRest = false,
  onClick,
  onFootprint,
  children,
}) {
  const wrapperRef = useRef(null)
  const swingElRef = useRef(null)
  const backRef = useRef(null)
  const layerRefs = useRef([])
  const footprintRef = useRef(LABEL_H)

  // Ghost copies of everything behind the glass (stage grid + back sheets),
  // blurred with a regular CSS filter instead of backdrop-filter. The physics
  // loop counter-rotates them so they always align with the real elements;
  // see the .label-glass comment in Label.css for why.
  const ghostGridRef = useRef(null)
  const ghostBackRef = useRef(null)
  const ghostLayerRefs = useRef([])

  // The hanging back sheet is height:auto and absolutely positioned, so it
  // doesn't contribute to layout height. Measure its resting footprint from
  // the loaded media (natural ratio × the element's unrotated computed width)
  // and report max(LABEL_H, tallest sheet) so the parent can reserve exact,
  // equal spacing for variable-height labels.
  const measureEl = (el) => {
    if (!onFootprint || !el) return
    const natW = el.naturalWidth || el.videoWidth || 0
    const natH = el.naturalHeight || el.videoHeight || 0
    if (!natW || !natH) return
    const w = parseFloat(getComputedStyle(el).width) || backWidth
    const dispH = (w * natH) / natW
    if (dispH > footprintRef.current) {
      footprintRef.current = dispH
      onFootprint(dispH)
    }
  }
  const measure = (e) => measureEl(e.currentTarget)

  const { swingRef: panelSwing, cursorRef, subscribeSwing } = useSwing()

  // Identity of the stack contents (not just its length) so the physics
  // effect rebinds when layers are replaced and never drives detached nodes.
  const stackKey = backStack
    .map((layer) => (typeof layer === 'string' ? layer : layer?.src ?? ''))
    .join('|')

  // Cached media can finish loading before React attaches the load handlers,
  // so the load event never fires. Sweep already-complete elements on mount.
  useEffect(() => {
    if (!onFootprint || frontOnly) return
    ;[backRef.current, ...layerRefs.current].forEach((el) => measureEl(el))
  })

  // Pair every real <video> back sheet with its ghost <canvas> and keep the
  // canvas mirroring the video's frames, so the glass blur shows live motion.
  useEffect(() => {
    if (frontOnly) return
    const pairs = []
    const backEl = backRef.current
    const backGhost = ghostBackRef.current
    if (backEl?.tagName === 'VIDEO' && backGhost?.tagName === 'CANVAS') {
      pairs.push([backEl, backGhost])
    }
    layerRefs.current.forEach((el, i) => {
      const ghost = ghostLayerRefs.current[i]
      if (el?.tagName === 'VIDEO' && ghost?.tagName === 'CANVAS') {
        pairs.push([el, ghost])
      }
    })
    const stops = pairs.map(([video, canvas]) => syncVideoGhost(video, canvas))
    return () => stops.forEach((stop) => stop())
  }, [stackKey, frontOnly])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const el = swingElRef.current
    const backEl = backRef.current
    if (!wrapper || !el || (!frontOnly && !backEl)) return

    let angle = startAtRest ? 0 : randomSigned(START_ANGLE_MIN, START_ANGLE_MAX)
    let velocity = startAtRest ? 0 : randomSigned(0, START_VEL_MAX)
    // Per-label jitter on pendulum frequency and damping so labels don't all
    // swing in lockstep. The over-the-top caps (maxVel) are fed the label's
    // actual jittered gravity so they stay valid for any gJitter.
    const gJitter = 0.7 + Math.random() * 0.3
    const damping = DAMPING * (0.85 + Math.random() * 0.3)
    let backAngle = angle
    let backVel = 0
    let last = performance.now()
    let raf = 0

    const ghostGrid = ghostGridRef.current
    const ghostBack = ghostBackRef.current

    // Keep ghosts index-aligned with their real layers (a video layer without
    // a poster has no ghost, so a plain filter would misalign the arrays).
    const layers = []
    const layerGhosts = []
    layerRefs.current.forEach((node, i) => {
      if (!node) return
      layers.push(node)
      layerGhosts.push(ghostLayerRefs.current[i] ?? null)
    })
    const layerAngle = layers.map(() => angle)
    const layerVel = layers.map(() => 0)

    let prevCursorX = 0
    let prevCursorY = 0
    let hasPrevCursor = false

    // ignoreCursor labels never listen for the pointer, so cursor.active stays
    // false and the collision branch below is never entered — the label swings
    // under gravity only and can't be pushed by the mouse.
    const cursor = { x: 0, y: 0, active: false }
    const onPointerMove = (e) => {
      // Frozen (e.g. project panel open): ignore the cursor so the grid behind
      // doesn't react to a pointer that's interacting with the panel on top.
      if (!standalone && cursorRef?.current?.enabled === false) return
      cursor.x = e.clientX
      cursor.y = e.clientY
      cursor.active = true
      startLoop()
    }
    if (!ignoreCursor && HAS_HOVER) {
      window.addEventListener('pointermove', onPointerMove)
    }

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      // Labels inside the swing panel couple to its rotation; standalone labels
      // (e.g. on the project detail back layer) use local physics only.
      const Th = standalone ? 0 : panelSwing.current.angle
      const moving = standalone ? false : panelSwing.current.moving

      // Total frame offset = panel swing + physical device tilt (gyroscope).
      // Tilting the phone rotates gravity in the screen plane; lying flat
      // shrinks its in-plane magnitude toward zero so labels float.
      const frame = Th + deviceTilt.angle
      const g = GRAVITY * deviceTilt.mag * gJitter

      const acceleration = -g * Math.sin(angle + frame) - damping * velocity
      velocity += acceleration * dt
      velocity = capTowardTop(velocity, angle + frame, g)
      let next = angle + velocity * dt

      // Cursor collision when standalone, or when the panel is closed and at
      // rest (getBoundingClientRect assumes an un-rotated frame). Grid labels
      // also require the cursor to be enabled (frozen while a panel is open).
      const cursorEnabled = cursorRef?.current?.enabled !== false
      if (
        cursor.active &&
        (standalone || (cursorEnabled && !moving && Math.abs(Th) < 0.05))
      ) {
        // The stage may be CSS-scaled by its grid cell (transform-origin is
        // the pin, which the stage rect tracks). Work in unscaled label space:
        // measure the scale from the stage rect and divide screen-space
        // cursor values by it. cursorOmega is scale-invariant.
        const stageRect = el.parentElement.getBoundingClientRect()
        const scale = stageRect.width / LABEL_W || 1
        const pivotX = stageRect.left + PIN_X * scale
        const pivotY = stageRect.top
        const dx = (cursor.x - pivotX) / scale
        const dy = (cursor.y - pivotY) / scale

        let cursorOmega = 0
        const r2 = dx * dx + dy * dy
        if (hasPrevCursor && dt > 0 && r2 > 1) {
          const cvx = (cursor.x - prevCursorX) / (dt * scale)
          const cvy = (cursor.y - prevCursorY) / (dt * scale)
          cursorOmega = (dx * cvy - dy * cvx) / r2
        }
        prevCursorX = cursor.x
        prevCursorY = cursor.y
        hasPrevCursor = true

        const gapAt = (theta) => {
          const cos = Math.cos(theta)
          const sin = Math.sin(theta)
          const localX = cos * dx + sin * dy
          const localY = -sin * dx + cos * dy
          const nearestX = clamp(localX, -PIN_X, LABEL_W - PIN_X)
          const nearestY = clamp(localY, 0, LABEL_H)
          // Cursor ring is screen-sized; convert its radius into label space.
          return Math.hypot(localX - nearestX, localY - nearestY) - CURSOR_RADIUS / scale
        }

        if (gapAt(next) < 0) {
          if (gapAt(angle) >= 0) {
            let lo = angle
            let hi = next
            for (let i = 0; i < 24; i++) {
              const mid = (lo + hi) / 2
              if (gapAt(mid) >= 0) lo = mid
              else hi = mid
            }
            next = lo
          } else {
            const STEP = 0.01
            let resolved = angle
            for (let d = STEP; d <= Math.PI; d += STEP) {
              if (gapAt(angle + d) >= 0) {
                resolved = angle + d
                break
              }
              if (gapAt(angle - d) >= 0) {
                resolved = angle - d
                break
              }
            }
            next = resolved
          }
          velocity = (1 + RESTITUTION) * cursorOmega - RESTITUTION * velocity
          velocity = clamp(velocity, -MAX_OMEGA, MAX_OMEGA)
          velocity = capTowardTop(velocity, next + frame, g)
        }
      } else if (!standalone && (moving || Math.abs(Th) >= 0.05)) {
        hasPrevCursor = false
      }

      angle = next
      el.style.transform = `rotate(${angle}rad)`
      // The stage grid is fixed, so its ghost counter-rotates by the front
      // angle; sheet ghosts rotate by their angle relative to the front.
      if (ghostGrid) ghostGrid.style.transform = `rotate(${-angle}rad)`

      if (!frontOnly && backEl) {
        const drag = (BACK_COUPLING / BACK_MASS) * (velocity - backVel)
        const backAccel = -g * Math.sin(backAngle + frame) - damping * backVel + drag
        backVel += backAccel * dt
        backVel = capTowardTop(backVel, backAngle + frame, g)
        backAngle += backVel * dt
        backEl.style.transform = `rotate(${backAngle}rad)`
        if (ghostBack) {
          ghostBack.style.transform = `rotate(${backAngle - angle}rad)`
        }

        for (let i = 0; i < layers.length; i++) {
          const mass = STACK_BASE_MASS + i * STACK_MASS_STEP
          const layerDrag = (STACK_COUPLING / mass) * (velocity - layerVel[i])
          const layerAccel =
            -g * Math.sin(layerAngle[i] + frame) - damping * layerVel[i] + layerDrag
          layerVel[i] += layerAccel * dt
          layerVel[i] = capTowardTop(layerVel[i], layerAngle[i] + frame, g)
          layerAngle[i] += layerVel[i] * dt
          layers[i].style.transform = `rotate(${layerAngle[i]}rad)`
          const ghost = layerGhosts[i]
          if (ghost) ghost.style.transform = `rotate(${layerAngle[i] - angle}rad)`
        }
      }

      // Sleep once every body is at rest and the panel isn't swinging; the
      // loop restarts on pointer movement, a new panel swing, or a device
      // tilt change. Displacement (sin(θ/2), see `displaced`) is measured
      // from the stable hanging-down equilibrium only, so a label balanced
      // upside-down keeps simulating until gravity rights it.
      const mag = deviceTilt.mag
      let atRest =
        (standalone || !moving) &&
        Math.abs(velocity) < SLEEP_EPS &&
        mag * displaced(angle + frame) < SLEEP_EPS
      if (atRest && !frontOnly && backEl) {
        atRest =
          Math.abs(backVel) < SLEEP_EPS &&
          mag * displaced(backAngle + frame) < SLEEP_EPS
        for (let i = 0; atRest && i < layers.length; i++) {
          atRest =
            Math.abs(layerVel[i]) < SLEEP_EPS &&
            mag * displaced(layerAngle[i] + frame) < SLEEP_EPS
        }
      }
      if (atRest) {
        raf = 0
        hasPrevCursor = false
        return
      }

      raf = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    const unsubscribeSwing = standalone ? null : subscribeSwing(startLoop)

    initDeviceTilt()
    const unsubscribeTilt = subscribeTilt(startLoop)

    startLoop()

    return () => {
      cancelAnimationFrame(raf)
      raf = 0
      unsubscribeSwing?.()
      unsubscribeTilt()
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [stackKey, frontOnly, standalone, ignoreCursor, startAtRest, panelSwing, cursorRef, subscribeSwing])

  return (
    <div
      className="label-wrapper"
      ref={wrapperRef}
      onClick={onClick}
      data-cursor={onClick ? 'pointer' : undefined}
    >
      <div
        className="label-stage"
        style={{ '--pin-x': `${PIN_X}px`, '--back-width': `${backWidth}px` }}
      >
        {!frontOnly && (
          <div className="label-back">
            {backStack.map((layer, i) => {
              const src = typeof layer === 'string' ? layer : layer.src
              const type = typeof layer === 'object' ? layer.type : undefined
              const poster = typeof layer === 'object' ? layer.poster : undefined
              const width = typeof layer === 'object' && layer.width
              return (
                <BackMedia
                  key={src ?? i}
                  src={src}
                  type={type}
                  poster={poster}
                  className="label-back-layer"
                  refProp={(node) => {
                    layerRefs.current[i] = node
                  }}
                  style={width ? { width: `${width}px` } : undefined}
                  onMeasure={measure}
                />
              )
            })}
            <BackMedia
              src={backgroundImage}
              poster={backgroundPoster}
              className="label-back-panel"
              refProp={backRef}
              onMeasure={measure}
            />
          </div>
        )}
        <div className="label-swing" ref={swingElRef}>
          <div className="label-pin" />
          <div className="label-box">
            <div className="label-glass">
              <div className="label-glass-blur">
                <div className="label-ghost-grid" ref={ghostGridRef} />
                {!frontOnly &&
                  backStack.map((layer, i) => {
                    const src = typeof layer === 'string' ? layer : layer.src
                    const type = typeof layer === 'object' ? layer.type : undefined
                    const width = typeof layer === 'object' && layer.width
                    return (
                      <GhostMedia
                        key={src ?? i}
                        src={src}
                        type={type}
                        refProp={(node) => {
                          ghostLayerRefs.current[i] = node
                        }}
                        style={width ? { width: `${width}px` } : undefined}
                      />
                    )
                  })}
                {!frontOnly && (
                  <GhostMedia src={backgroundImage} refProp={ghostBackRef} />
                )}
              </div>
            </div>
            <div className="label-front">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Label
