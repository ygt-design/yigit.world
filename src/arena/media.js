export const VIDEO_RE = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?.*)?$/i;

export const isVideoSrc = (src, type) =>
  type === "video" || (typeof src === "string" && VIDEO_RE.test(src));

const rendition = (image, size) => {
  const r = image?.[size];
  return (typeof r === "string" ? r : r?.src) ?? null;
};

export function mediaSrc(block, { size = "large" } = {}) {
  if (!block) return null;
  const attachment = block.attachment?.url;
  if (attachment && VIDEO_RE.test(attachment)) return attachment;
  return rendition(block.image, size) ?? block.image?.src ?? attachment ?? null;
}

export function posterSrc(block, { size = "large" } = {}) {
  if (!block?.image) return null;
  return rendition(block.image, size) ?? block.image.src ?? null;
}
