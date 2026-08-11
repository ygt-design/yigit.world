import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import styled from 'styled-components'
import { GRID } from '../../grid/index.js'
import {
  fetchAllChannelContents,
  blockText,
  infoBlocksFromContents,
  tagsFromContents,
  mediaBlocksFromContents,
  isThumbnailBlock,
  mediaSrc,
  posterSrc,
  isVideoSrc,
} from '../../arena/index.js'

// Same spring the label SwingPanel uses (see SwingProvider): the panel hinges
// on the top-right pin and swings between flat (0, covering the grid) and open
// (OPEN_ANGLE, swung off to reveal the grid), fading out near the open end.
const OPEN_ANGLE = -137 * (Math.PI / 180)
const STIFFNESS = 19
const SPRING_DAMP = 4.8
const SETTLE_ANGLE = 0.001
const SETTLE_VEL = 0.001
const FADE_START = 0.88
const panelOpacity = (angle) => {
  const progress = angle / OPEN_ANGLE
  const t = (progress - FADE_START) / (1 - FADE_START)
  return 1 - Math.min(Math.max(t, 0), 1)
}

// Fixed panel matching the label grid panel's width/position exactly, so it
// lands directly on top of it. Same band math and pin as SwingPanel; the
// transform/opacity are driven imperatively by the spring loop below.
const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 20;
  background: #fff;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.06);
  transform-origin: calc(100% - 20px) 20px;
  will-change: transform, opacity;
  backface-visibility: hidden;

  --grid-w: min(${GRID.MAX_WIDTH}, 100vw);
  --grid-margin: calc((100vw - var(--grid-w)) / 2);
  --col: calc((var(--grid-w) - ${GRID.PADDING} * 2 - ${GRID.GAP} * 11) / 12);
  --band-left: calc(
    var(--grid-margin) + ${GRID.PADDING} + var(--col) * 4 + ${GRID.GAP} * 4
  );
  width: calc(100vw - var(--band-left));

  @media ${GRID.MEDIA_TABLET} {
    --col: calc((100vw - ${GRID.PADDING_TABLET} * 2 - ${GRID.GAP_TABLET} * 7) / 8);
    --band-left: calc(${GRID.PADDING_TABLET} + var(--col) * 2 + ${GRID.GAP_TABLET} * 2);
    width: calc(100vw - var(--band-left));
  }

  @media ${GRID.MEDIA_MOBILE} {
    width: 100vw;
  }
`

// Two-column structure: the text (tags + info) stacks in the left column; the
// right column is left open (for media later). Collapses to one column on mobile.
const Layout = styled.div`
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: ${GRID.GAP};
  align-content: start;
  padding: 120px ${GRID.PADDING} ${GRID.ROW_GAP};

  @media ${GRID.MEDIA_TABLET} {
    column-gap: ${GRID.GAP_TABLET};
    padding: 100px ${GRID.PADDING_TABLET} ${GRID.ROW_GAP_TABLET};
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-template-columns: 1fr;
    padding: 80px ${GRID.PADDING_MOBILE} ${GRID.ROW_GAP_MOBILE};
  }
`

// Right column: tags stacked at the top, info below with a generous gap.
const ContentColumn = styled.div`
  grid-column: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;

  /* On the smaller breakpoints the layout is a single column, so the tags
     stack directly under the title with no grid row-gap. Add breathing room
     above the tags block so it isn't flush against the title. */
  @media ${GRID.MEDIA_TABLET} {
    gap: 2.5rem;
    margin-top: 2.5rem;
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-column: 1;
    gap: 2rem;
    margin-top: 2rem;
  }
`

const MediaSection = styled.div`
  grid-column: 1 / -1;
  margin-top: 5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;

  @media ${GRID.MEDIA_MOBILE} {
    grid-template-columns: 1fr;
  }
`

const Media = styled.div`
  grid-column: span ${(p) => p.$span ?? 1};

  img,
  video {
    display: block;
    width: 100%;
    height: auto;
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-column: auto;
  }
`

// Matches the card title (.label-front-bottom): GT Canon display, condensed.
// Cards render at scale(0.8), so the on-screen size is 32px * 0.8.
const CARD_SCALE = 0.8

const ProjectTitle = styled.h1`
  grid-column: 1;
  margin: 0;
  font-family: var(--font-display);
  font-size: calc(32px * ${CARD_SCALE});
  line-height: 1;
  font-weight: 400;
  font-stretch: var(--font-title-stretch);
  font-optical-sizing: auto;
  text-transform: uppercase;
  color: #000;
`

// Stacked one per line, like the card's .label-front-top list.
const TagList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: var(--font-mono);
  font-size: calc(0.95rem * ${CARD_SCALE});
  line-height: 1.35;
  font-weight: 350;
  text-transform: uppercase;
  letter-spacing: -0.025em;
  color: #131313;

  li {
    display: block;
  }
`

// GT Canon (variable display face) rendered italic, sized to match the tags.
const InfoBlock = styled.div`
  font-family: var(--font-display);
  /* font-style: italic; */
  color: #131313;
  font-size: calc(0.95rem * ${CARD_SCALE});
  line-height: 1.45;
  font-weight: 400;
  font-style: italic;
  font-optical-sizing: auto;

  a {
    color: var(--link-color);
  }

  p + p {
    margin-top: 1.25em;
  }
`

function InfoText({ block }) {
  const content = blockText(block)
  if (!content) return null

  if (content.html) {
    return <InfoBlock dangerouslySetInnerHTML={{ __html: content.html }} />
  }

  return (
    <InfoBlock>
      <p>{content.text}</p>
    </InfoBlock>
  )
}

// Reports its measured orientation up (via onOrientation); the parent packs
// Panel videos only play while on screen. Metadata still preloads so the
// orientation measurement (which drives column packing) resolves immediately
// with no layout shift; the heavy video data buffers on first play, once the
// clip scrolls near the viewport, and pauses again when it leaves. Poster
// covers the gap so the frame never looks empty — visually identical to the
// old always-playing version, minus the cost of every clip decoding at once.
function PanelVideo({ src, poster, onMeasure }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      el.play?.().catch(() => {})
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) el.play?.().catch(() => {})
          else el.pause?.()
        })
      },
      { rootMargin: '25%' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster ?? undefined}
      loop
      muted
      playsInline
      preload="metadata"
      onLoadedMetadata={(e) =>
        onMeasure?.(e.currentTarget.videoWidth, e.currentTarget.videoHeight)
      }
    />
  )
}

// the columns and hands back the span to render at.
function MediaBlock({ block, src: srcProp, poster, span = 1, onOrientation }) {
  const src = srcProp ?? mediaSrc(block)
  if (!src) return null

  const measure = (w, h) => {
    if (w && h) onOrientation?.(w > h)
  }

  if (isVideoSrc(src)) {
    return (
      <Media $span={span}>
        <PanelVideo src={src} poster={poster} onMeasure={measure} />
      </Media>
    )
  }

  return (
    <Media $span={span}>
      <img
        src={src}
        alt={block?.title ?? ''}
        loading="lazy"
        decoding="async"
        // Cached images can be complete before onLoad binds, so also measure
        // via the ref when the node mounts already loaded.
        ref={(el) => {
          if (el?.complete && el.naturalWidth) {
            measure(el.naturalWidth, el.naturalHeight)
          }
        }}
        onLoad={(e) => measure(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
      />
    </Media>
  )
}

export default function ProjectPanel({ project, closing = false, onClosed }) {
  // Track which project the loaded data belongs to so a stale fetch never
  // paints under a newly selected project — the panel shows just the title
  // until the matching contents resolve.
  const [loaded, setLoaded] = useState({ slug: null, blocks: [], status: 'loading' })

  // Measured orientation per media block id ('landscape' | 'portrait'), used to
  // pack the two columns. Guarded so a repeat report is a no-op (no re-render).
  const [orientations, setOrientations] = useState({})
  const handleOrientation = useCallback((id, isLandscape) => {
    setOrientations((prev) => {
      const next = isLandscape ? 'landscape' : 'portrait'
      return prev[id] === next ? prev : { ...prev, [id]: next }
    })
  }, [])

  const panelRef = useRef(null)
  const springRef = useRef({ angle: OPEN_ANGLE, omega: 0 })
  const rafRef = useRef(0)
  const onClosedRef = useRef(onClosed)
  useEffect(() => {
    onClosedRef.current = onClosed
  })

  // Paint the off-position before the first frame so it swings in from there
  // (rather than flashing flat for a frame).
  useLayoutEffect(() => {
    const el = panelRef.current
    if (!el) return
    el.style.transform = `rotate(${springRef.current.angle}rad)`
    el.style.opacity = String(panelOpacity(springRef.current.angle))
  }, [])

  // Spring toward flat (0) on open, toward OPEN_ANGLE on close — identical
  // constants to the SwingPanel. Continues from the current angle/velocity so
  // reversing mid-swing is smooth. Unmounts (onClosed) once settled closed.
  useEffect(() => {
    const target = closing ? OPEN_ANGLE : 0
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const s = springRef.current
      const a = -STIFFNESS * (s.angle - target) - SPRING_DAMP * s.omega
      s.omega += a * dt
      s.angle += s.omega * dt

      const el = panelRef.current
      if (el) {
        el.style.transform = `rotate(${s.angle}rad)`
        el.style.opacity = String(panelOpacity(s.angle))
      }

      const settled =
        Math.abs(s.angle - target) < SETTLE_ANGLE && Math.abs(s.omega) < SETTLE_VEL
      if (settled) {
        s.angle = target
        s.omega = 0
        if (el) {
          el.style.transform = `rotate(${target}rad)`
          el.style.opacity = String(panelOpacity(target))
        }
        rafRef.current = 0
        if (closing) onClosedRef.current?.()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }
  }, [closing])

  useEffect(() => {
    if (!project?.slug) return
    let cancelled = false

    ;(async () => {
      try {
        const contents = await fetchAllChannelContents(project.slug)
        if (!cancelled) {
          setLoaded({
            slug: project.slug,
            blocks: contents.filter((it) => it.type !== 'Channel'),
            status: 'ready',
          })
        }
      } catch {
        if (!cancelled) setLoaded({ slug: project.slug, blocks: [], status: 'error' })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [project?.slug])

  const isCurrent = loaded.slug === project?.slug
  const blocks = isCurrent ? loaded.blocks : []
  const status = isCurrent ? loaded.status : 'loading'

  const infoBlocks = infoBlocksFromContents(blocks)
  const derivedTags = tagsFromContents(blocks)
  const tags = derivedTags.length ? derivedTags : project?.tags ?? []

  const thumbnailBlock = blocks.find(isThumbnailBlock)
  const thumbnailSrc = mediaSrc(thumbnailBlock) ?? project?.image
  const mediaBlocks = mediaBlocksFromContents(blocks)

  // Ordered media list (thumbnail first, then the rest).
  const mediaItems = []
  if (thumbnailSrc) {
    mediaItems.push({
      id: thumbnailBlock?.id ?? 'thumbnail',
      block: thumbnailBlock,
      src: thumbnailSrc,
      poster: posterSrc(thumbnailBlock),
    })
  }
  mediaBlocks.forEach((block) => {
    mediaItems.push({ id: block.id, block, src: undefined, poster: posterSrc(block) })
  })

  // Pack the two columns in order: a landscape image at the start of a row
  // spans both columns; otherwise the image takes one column. Whenever a row
  // has an open second slot, the next image fills it as a single column —
  // even if it's landscape — so it sits beside the preceding one.
  let pendingSecondSlot = false
  const spans = mediaItems.map((item) => {
    if (pendingSecondSlot) {
      pendingSecondSlot = false
      return 1
    }
    if (orientations[item.id] === 'landscape') {
      return 2
    }
    pendingSecondSlot = true
    return 1
  })

  return (
    <Panel ref={panelRef} aria-label={project?.title ?? 'Project'}>
      <Layout>
        <ProjectTitle>{project?.title}</ProjectTitle>

        <ContentColumn>
          {tags.length > 0 && (
            <TagList aria-label="Tags">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </TagList>
          )}

          {status === 'error' && <InfoBlock>Couldn’t load this project.</InfoBlock>}
          {infoBlocks.map((block) => (
            <InfoText key={block.id} block={block} />
          ))}
        </ContentColumn>

        {mediaItems.length > 0 && (
          <MediaSection>
            {mediaItems.map((item, i) => (
              <MediaBlock
                key={item.id}
                block={item.block}
                src={item.src}
                poster={item.poster}
                span={spans[i]}
                onOrientation={(isLandscape) => handleOrientation(item.id, isLandscape)}
              />
            ))}
          </MediaSection>
        )}
      </Layout>
    </Panel>
  )
}
