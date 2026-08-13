import { mediaSrc } from './media.js'

export const THUMBNAIL_TITLE = 'Thumbnail'
export const INFO_TITLE = 'Info'

const TAG_TITLES = new Set(['tag', 'tags'])

export function isThumbnailBlock(block) {
  return (block.title ?? '').toLowerCase() === THUMBNAIL_TITLE.toLowerCase()
}

export function isInfoBlock(block) {
  return (block.title ?? '').toLowerCase() === INFO_TITLE.toLowerCase()
}

export function isTagBlock(block) {
  return TAG_TITLES.has((block.title ?? '').toLowerCase())
}

function blockPlainText(block) {
  if (!block) return null
  if (typeof block.content === 'string') return block.content
  return block.content?.plain ?? block.content?.markdown ?? null
}

/** Parse a Tag/Tags text block into a list of tag strings. */
export function tagsFromBlock(block) {
  const text = blockPlainText(block)
  if (!text) return []
  return text
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function tagsFromContents(contents) {
  const tagBlock = contents.find(isTagBlock)
  const tags = tagBlock ? tagsFromBlock(tagBlock) : []
  // Alphabetical (case-insensitive) so tags read top-to-bottom in the same
  // order everywhere they're rendered: the label cards and the project panel.
  return tags.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}

export function blockText(block) {
  const html =
    block.content_html ??
    (typeof block.content === 'object' ? block.content?.html : null)
  if (html) return { html }

  const text = blockPlainText(block) ?? block.description
  if (text) return { text }

  return null
}

export function infoBlocksFromContents(contents) {
  return contents.filter((b) => isInfoBlock(b) && blockText(b))
}

export function mediaBlocksFromContents(contents) {
  return contents.filter(
    (b) => !isThumbnailBlock(b) && !isTagBlock(b) && !isInfoBlock(b) && mediaSrc(b),
  )
}
