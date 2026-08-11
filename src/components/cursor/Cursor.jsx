import { useRef, useEffect } from 'react'
import pointerSvg from '../../assets/images/pointer.svg?raw'
import './Cursor.css'

const POINTER_SELECTOR =
  'a, button, [role="button"], [data-cursor="pointer"], input, select, textarea, label, summary, [href], [tabindex]:not([tabindex="-1"])'

// Inline the SVG so fills and strokes render faithfully. Strip the embedded
// stylesheet (hardcoded black) so CSS currentColor can drive hover color.
const POINTER_MARKUP = pointerSvg
  .replace(/<defs>[\s\S]*?<\/defs>\s*/, '')
  .replace(/\sclass="cls-1"/, '')
  .replace(/<svg\b/, '<svg class="cursor-pointer"')

const DARK_THRESHOLD = 0.5

const HAS_HOVER =
  typeof window === 'undefined' ||
  !window.matchMedia ||
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

function isPointerTarget(el) {
  if (!el) return false
  const target = el.closest(POINTER_SELECTOR)
  return Boolean(target && !target.classList.contains('cursor-ring'))
}

// Perceived luminance (0–1) from 0–255 sRGB channels.
function luminance(r, g, b) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function parseColor(value) {
  if (!value) return null
  const match = value.match(/rgba?\(([^)]+)\)/)
  if (!match) return null
  const parts = match[1].split(',').map((p) => parseFloat(p.trim()))
  const [r, g, b, a = 1] = parts
  if (a === 0) return null // fully transparent → keep looking up the tree
  return { r, g, b }
}

// Walk up the DOM until we hit an element with a non-transparent background
// color. Returns its luminance, or null if nothing opaque is found.
function backgroundLuminance(el) {
  let node = el
  while (node && node !== document.documentElement) {
    const color = parseColor(getComputedStyle(node).backgroundColor)
    if (color) return luminance(color.r, color.g, color.b)
    node = node.parentElement
  }
  const bodyColor = parseColor(getComputedStyle(document.body).backgroundColor)
  return bodyColor ? luminance(bodyColor.r, bodyColor.g, bodyColor.b) : null
}

// Cache one small offscreen canvas per <img> so we don't redraw on every move.
// Sampling canvases are downscaled — we only need coarse luminance, not detail.
const SAMPLE_MAX = 96
const imageCanvases = new WeakMap()

function buildSampleCanvas(source, natW, natH) {
  const scale = Math.min(1, SAMPLE_MAX / Math.max(natW, natH))
  const w = Math.max(1, Math.round(natW * scale))
  const h = Math.max(1, Math.round(natH * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(source, 0, 0, w, h)
  // Reading a pixel throws on cross-origin images without CORS ("tainted"
  // canvas) — probe once here so callers know this canvas is unusable.
  ctx.getImageData(0, 0, 1, 1)
  return { ctx, w, h }
}

// Returns a ready-to-sample entry, or null while unavailable. Cross-origin
// images (e.g. the Are.na CDN) taint the canvas, so on failure we reload the
// same URL with crossOrigin="anonymous" in the background and sample that
// copy once it arrives (it comes from the browser cache in most cases).
function getImageCanvas(img) {
  const src = img.currentSrc || img.src
  let entry = imageCanvases.get(img)
  if (entry && entry.src === src) return entry.ready ? entry : null

  entry = { src, ready: false, ctx: null, w: 0, h: 0 }
  imageCanvases.set(img, entry)

  try {
    const sample = buildSampleCanvas(img, img.naturalWidth, img.naturalHeight)
    Object.assign(entry, sample, { ready: true })
    return entry
  } catch {
    // Tainted — fall through to the CORS reload below.
  }

  const clone = new Image()
  clone.crossOrigin = 'anonymous'
  clone.onload = () => {
    try {
      const sample = buildSampleCanvas(clone, clone.naturalWidth, clone.naturalHeight)
      Object.assign(entry, sample, { ready: true })
    } catch {
      // Server doesn't allow CORS reads; leave entry unusable.
    }
  }
  clone.src = src
  return null
}

// Map a client point over an <img> to its natural pixel, honoring object-fit
// and object-position, then read that pixel's luminance.
function imageLuminance(img, clientX, clientY) {
  if (!img.naturalWidth || !img.naturalHeight) return null
  if (!img.complete) return null

  const rect = img.getBoundingClientRect()
  const boxW = rect.width
  const boxH = rect.height
  const natW = img.naturalWidth
  const natH = img.naturalHeight
  if (!boxW || !boxH) return null

  const style = getComputedStyle(img)
  const fit = style.objectFit || 'fill'

  // Determine drawn size of the image inside its box.
  let drawW = boxW
  let drawH = boxH
  const boxRatio = boxW / boxH
  const imgRatio = natW / natH

  if (fit === 'contain' || fit === 'scale-down') {
    if (imgRatio > boxRatio) {
      drawW = boxW
      drawH = boxW / imgRatio
    } else {
      drawH = boxH
      drawW = boxH * imgRatio
    }
  } else if (fit === 'cover') {
    if (imgRatio > boxRatio) {
      drawH = boxH
      drawW = boxH * imgRatio
    } else {
      drawW = boxW
      drawH = boxW / imgRatio
    }
  } else if (fit === 'none') {
    drawW = natW
    drawH = natH
  }

  // object-position offsets (default center).
  const [posX = '50%', posY = '50%'] = style.objectPosition.split(' ')
  const resolvePos = (pos, box, draw) => {
    if (pos.endsWith('%')) return ((box - draw) * parseFloat(pos)) / 100
    return parseFloat(pos) || (box - draw) / 2
  }
  const offsetX = resolvePos(posX, boxW, drawW)
  const offsetY = resolvePos(posY, boxH, drawH)

  // Point relative to the drawn image, then scaled to natural pixels.
  const localX = clientX - rect.left - offsetX
  const localY = clientY - rect.top - offsetY
  if (localX < 0 || localY < 0 || localX > drawW || localY > drawH) return null

  const entry = getImageCanvas(img)
  if (!entry) return null

  const px = Math.min(entry.w - 1, Math.floor((localX / drawW) * entry.w))
  const py = Math.min(entry.h - 1, Math.floor((localY / drawH) * entry.h))
  const [r, g, b, a] = entry.ctx.getImageData(px, py, 1, 1).data
  if (a === 0) return null
  return luminance(r, g, b)
}

// Best-effort luminance of whatever is under the cursor. Walks the whole
// element stack at the point (not just the topmost element) so images that
// sit beneath transparent wrappers/overlays are still sampled. Takes a
// precomputed stack so the caller can reuse it for the pointer-target test.
function luminanceFromStack(stack, clientX, clientY) {
  for (const el of stack) {
    if (el.classList.contains('cursor-ring')) continue
    if (el.tagName === 'IMG') {
      const lum = imageLuminance(el, clientX, clientY)
      if (lum != null) return lum
      continue // image not sampleable yet — keep looking below it
    }
    const color = parseColor(getComputedStyle(el).backgroundColor)
    if (color) return luminance(color.r, color.g, color.b)
  }
  return backgroundLuminance(document.body)
}

function Cursor() {
  const ringRef = useRef(null)

  useEffect(() => {
    const el = ringRef.current
    if (!el || !HAS_HOVER) return

    // The wrapper is positioned at the raw pointer coordinate; the SVG child
    // offsets itself so its drawn tip lands exactly on that point.
    el.style.transform = `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px)`

    // Keep the ring glued to the pointer every event (cheap), but coalesce the
    // expensive hit-test + luminance sampling to at most once per frame so fast
    // mice (120–240Hz) don't spam getComputedStyle/getImageData or thrash layout
    // against the label physics loops. Class toggles at 60fps look identical.
    let px = 0
    let py = 0
    let rafId = 0
    let lastX = null
    let lastY = null

    const process = () => {
      rafId = 0
      if (px === lastX && py === lastY) return
      lastX = px
      lastY = py
      // One hit-test serves both the pointer-target check (topmost = stack[0],
      // same as elementFromPoint) and the luminance walk.
      const stack = document.elementsFromPoint(px, py)
      el.classList.toggle('is-pointer', isPointerTarget(stack[0]))
      const lum = luminanceFromStack(stack, px, py)
      if (lum != null) el.classList.toggle('is-on-dark', lum < DARK_THRESHOLD)
    }

    const move = (e) => {
      px = e.clientX
      py = e.clientY
      el.style.transform = `translate(${px}px, ${py}px)`
      if (!rafId) rafId = requestAnimationFrame(process)
    }

    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      className="cursor-ring"
      ref={ringRef}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: POINTER_MARKUP }}
    />
  )
}

export default Cursor
