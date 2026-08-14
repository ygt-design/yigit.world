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
const PIN_X = LABEL_W / 2

const BACK_MASS = 5
const BACK_COUPLING = 12

const STACK_BASE_MASS = 25
const STACK_MASS_STEP = 3
const STACK_COUPLING = BACK_COUPLING

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

const HAS_HOVER =
  typeof window === 'undefined' ||
  !window.matchMedia ||
  window.matchMedia('(hover: hover)').matches

const VIDEO_RE = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?.*)?$/i
const isVideoSrc = (src, type) =>
  type === 'video' || (typeof src === 'string' && VIDEO_RE.test(src))

const visibilityCallbacks =
  typeof WeakMap === 'undefined' ? null : new WeakMap()
const visibilityObserver =
  typeof IntersectionObserver === 'undefined' || !visibilityCallbacks
    ? null
    : new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const cb = visibilityCallbacks.get(entry.target)
            if (cb) cb(entry.isIntersecting)
          })
        },
        { rootMargin: '25%' },
      )

const assignRef = (ref, node) => {
  if (typeof ref === 'function') ref(node)
  else if (ref) ref.current = node
}

function LazyVideo({ src, poster, className, refProp, style, onMeasure }) {
  const elRef = useRef(null)
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

const GHOST_MAX_W = 360

function syncVideoGhost(video, canvas) {
  const ctx = canvas.getContext('2d')
  let stopped = false
  let handle = 0
  let scheduled = false
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
    scheduled = false
    if (stopped) return
    if (
      video.readyState >= 2 &&
      resizeTo(video.videoWidth, video.videoHeight)
    ) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      frameDrawn = true
    }
    if (!useRvfc && video.paused) return
    schedule()
  }

  const schedule = () => {
    if (stopped || scheduled) return
    scheduled = true
    handle = useRvfc
      ? video.requestVideoFrameCallback(draw)
      : requestAnimationFrame(draw)
  }

  const onPlay = () => {
    if (!useRvfc) schedule()
  }
  video.addEventListener('play', onPlay)

  schedule()

  return () => {
    stopped = true
    video.removeEventListener('play', onPlay)
    if (useRvfc) video.cancelVideoFrameCallback?.(handle)
    else cancelAnimationFrame(handle)
  }
}

const randomSigned = (min, max) => {
  const mag = min + Math.random() * (max - min)
  return Math.random() < 0.5 ? -mag : mag
}

const TOP_MARGIN_FRAC = 0.04
const maxVel = (a, g) => {
  const budget = g * (1 + Math.cos(a)) - g * TOP_MARGIN_FRAC
  return budget > 0 ? Math.sqrt(2 * budget) : 0
}

const capTowardTop = (vel, worldAngle, g) => {
  const phi = Math.atan2(Math.sin(worldAngle), Math.cos(worldAngle))
  if (vel * phi <= 0) return vel
  const cap = maxVel(phi, g)
  return clamp(vel, -cap, cap)
}

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

  const ghostGridRef = useRef(null)
  const ghostBackRef = useRef(null)
  const ghostLayerRefs = useRef([])

  const visibleRef = useRef(true)
  const resumeRef = useRef(null)

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

  const stackKey = backStack
    .map((layer) => (typeof layer === 'string' ? layer : layer?.src ?? ''))
    .join('|')

  useEffect(() => {
    if (!onFootprint || frontOnly) return
    ;[backRef.current, ...layerRefs.current].forEach((el) => measureEl(el))
  })

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
    const gJitter = 0.7 + Math.random() * 0.3
    const damping = DAMPING * (0.85 + Math.random() * 0.3)
    let backAngle = angle
    let backVel = 0
    let last = performance.now()
    let raf = 0

    const ghostGrid = ghostGridRef.current
    const ghostBack = ghostBackRef.current

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

    const cursor = { x: 0, y: 0, active: false }
    const onPointerMove = (e) => {
      if (!visibleRef.current) return
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
      if (!visibleRef.current) {
        raf = 0
        return
      }
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const Th = standalone ? 0 : panelSwing.current.angle
      const moving = standalone ? false : panelSwing.current.moving

      const frame = Th + deviceTilt.angle
      const g = GRAVITY * deviceTilt.mag * gJitter

      const acceleration = -g * Math.sin(angle + frame) - damping * velocity
      velocity += acceleration * dt
      velocity = capTowardTop(velocity, angle + frame, g)
      let next = angle + velocity * dt

      const cursorEnabled = cursorRef?.current?.enabled !== false
      if (
        cursor.active &&
        (standalone || (cursorEnabled && !moving && Math.abs(Th) < 0.05))
      ) {
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
      if (raf || !visibleRef.current) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
    resumeRef.current = startLoop

    const unsubscribeSwing = standalone ? null : subscribeSwing(startLoop)

    initDeviceTilt()
    const unsubscribeTilt = subscribeTilt(startLoop)

    startLoop()

    return () => {
      cancelAnimationFrame(raf)
      raf = 0
      resumeRef.current = null
      unsubscribeSwing?.()
      unsubscribeTilt()
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [stackKey, frontOnly, standalone, ignoreCursor, startAtRest, panelSwing, cursorRef, subscribeSwing])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || !visibilityObserver) return

    const onVisibility = (isVisible) => {
      if (isVisible === visibleRef.current) return
      visibleRef.current = isVisible
      const videos = [backRef.current, ...layerRefs.current].filter(
        (node) => node?.tagName === 'VIDEO',
      )
      if (isVisible) {
        videos.forEach((v) => v.play?.().catch(() => {}))
        resumeRef.current?.()
      } else {
        videos.forEach((v) => v.pause?.())
      }
    }

    visibilityCallbacks.set(wrapper, onVisibility)
    visibilityObserver.observe(wrapper)
    return () => {
      visibilityObserver.unobserve(wrapper)
      visibilityCallbacks.delete(wrapper)
    }
  }, [stackKey, frontOnly])

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
