import { useRef, useEffect } from 'react'
import pointerSvg from '../../assets/images/pointer.svg?raw'
import './Cursor.css'

const POINTER_SELECTOR =
  'a, button, [role="button"], [data-cursor="pointer"], input, select, textarea, label, summary, [href], [tabindex]:not([tabindex="-1"])'

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

function luminance(r, g, b) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function parseColor(value) {
  if (!value) return null
  const match = value.match(/rgba?\(([^)]+)\)/)
  if (!match) return null
  const parts = match[1].split(',').map((p) => parseFloat(p.trim()))
  const [r, g, b, a = 1] = parts
  if (a === 0) return null 
  return { r, g, b }
}

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
  ctx.getImageData(0, 0, 1, 1)
  return { ctx, w, h }
}

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
  }

  const clone = new Image()
  clone.crossOrigin = 'anonymous'
  clone.onload = () => {
    try {
      const sample = buildSampleCanvas(clone, clone.naturalWidth, clone.naturalHeight)
      Object.assign(entry, sample, { ready: true })
    } catch {
    }
  }
  clone.src = src
  return null
}

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

  const [posX = '50%', posY = '50%'] = style.objectPosition.split(' ')
  const resolvePos = (pos, box, draw) => {
    if (pos.endsWith('%')) return ((box - draw) * parseFloat(pos)) / 100
    return parseFloat(pos) || (box - draw) / 2
  }
  const offsetX = resolvePos(posX, boxW, drawW)
  const offsetY = resolvePos(posY, boxH, drawH)

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

function luminanceFromStack(stack, clientX, clientY) {
  for (const el of stack) {
    if (el.classList.contains('cursor-ring')) continue
    if (el.tagName === 'IMG') {
      const lum = imageLuminance(el, clientX, clientY)
      if (lum != null) return lum
      continue
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

    el.style.transform = `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px)`

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
