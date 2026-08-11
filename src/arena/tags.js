// Pool of placeholder tags. Tags are intentionally random for now; they're
// seeded by channel id so a given channel keeps the same tags across re-renders.
const TAG_POOL = [
  'TYPEFACE DESIGN',
  'EDITORIAL',
  'PROGRAMMING',
  'HARDWARE',
  'BRANDING',
  'IDENTITY',
  'WEB',
  'ART DIRECTION',
  'RESEARCH',
  'TYPE DESIGN',
]

/** Deterministic 2–3 random tags from TAG_POOL, seeded by a number. */
export function seededTags(seed) {
  let s = (Math.abs(seed) || 1) % 2147483647
  const rand = () => (s = (s * 48271) % 2147483647) / 2147483647
  const count = 2 + Math.floor(rand() * 2)
  const pool = [...TAG_POOL]
  const out = []
  for (let i = 0; i < count && pool.length; i++) {
    out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  }
  return out
}
