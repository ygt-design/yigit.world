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

const ContentColumn = styled.div`
  grid-column: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;

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
    border: 0.5px solid rgba(123, 123, 123, 0.5);
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-column: auto;
  }
`

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

const InfoBlock = styled.div`
  font-family: var(--font-display);
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
  const [loaded, setLoaded] = useState({ slug: null, blocks: [], status: 'loading' })

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

  useLayoutEffect(() => {
    const el = panelRef.current
    if (!el) return
    el.style.transform = `rotate(${springRef.current.angle}rad)`
    el.style.opacity = String(panelOpacity(springRef.current.angle))
  }, [])

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

  // A block whose Are.na title contains "*" is forced to the start of a fresh
  // row and paired with the next block as a two-column row. If reaching it
  // would leave a dangling half-row, the item that opened that row is widened
  // to full width so the starred pair always begins on a clean row.
  const isStarred = (item) => Boolean(item.block?.title?.includes('*'))

  const spans = new Array(mediaItems.length).fill(1)
  let slotOpen = false // a second column is waiting to be filled
  let slotFromStar = false // the open slot belongs to a starred pair
  let openerIndex = -1 // index of the item that opened the current row

  mediaItems.forEach((item, i) => {
    const starred = isStarred(item)

    if (slotOpen) {
      // A starred block must start its own row, so unless this open slot was
      // created by a star expecting this block as its partner, close the row
      // by widening its opener and let the starred block begin a new row.
      if (starred && !slotFromStar) {
        spans[openerIndex] = 2
        slotOpen = false
      } else {
        spans[i] = 1
        slotOpen = false
        slotFromStar = false
        return
      }
    }

    if (starred) {
      spans[i] = 1
      slotOpen = true
      slotFromStar = true
      openerIndex = i
      return
    }

    if (orientations[item.id] === 'landscape') {
      spans[i] = 2
      return
    }

    spans[i] = 1
    slotOpen = true
    slotFromStar = false
    openerIndex = i
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
