// One-shot: bakes soft grayscale fractal grain into a tiling PNG so it survives
// Chrome's SVG-filter-on-composited-layer drop (grain vanished on peek/swing
// when backdrop-filter was stripped). Run once: `node scripts/gen-grain.mjs`.
//
// The original feTurbulence (baseFrequency .65, viewBox 600 scaled into 250px)
// was FINE grain — near per-pixel — but grayscale and low-contrast. So: fine
// per-pixel grayscale noise with a gaussian (averaged-uniform) distribution so
// values cluster around mid-gray instead of harsh full-range black/white.
// Grayscale = colour type 0. Per-pixel random tiles seamlessly (no structure).
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const SIZE = 250 // matches --label-grain-size

// CRC32
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[n] = c >>> 0
}
const crc32 = (buf) => {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

// Deterministic PRNG
let seed = 0x9e3779b9
const rnd = () => {
  seed ^= seed << 13
  seed ^= seed >>> 17
  seed ^= seed << 5
  return (seed >>> 0) / 0xffffffff
}
// Gaussian-ish value in 0..1 via averaged uniforms (central limit). More
// samples = tighter around 0.5 = softer/lower-contrast grain.
const GAUSS_SAMPLES = 4
const gauss = () => {
  let s = 0
  for (let i = 0; i < GAUSS_SAMPLES; i++) s += rnd()
  return s / GAUSS_SAMPLES
}

// CONTRAST scales spread around mid-gray (1 = raw gaussian). Lower = softer.
const CONTRAST = 1.0

const raw = Buffer.alloc(SIZE * (SIZE + 1)) // 1 gray byte/px + filter byte/row
let p = 0
for (let y = 0; y < SIZE; y++) {
  raw[p++] = 0 // filter: none
  for (let x = 0; x < SIZE; x++) {
    const v = 0.5 + (gauss() - 0.5) * CONTRAST
    raw[p++] = Math.max(0, Math.min(255, Math.round(v * 255)))
  }
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 0 // colour type: grayscale
const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

const out = new URL('../src/components/label/grain.png', import.meta.url)
writeFileSync(out, png)
console.log('wrote', out.pathname, png.length, 'bytes')
