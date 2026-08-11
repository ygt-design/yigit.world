import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Grid, GridCell, GRID } from '../../grid/index.js'
import Label from '../label/Label.jsx'
import MobileAbout from '../mobileAbout/MobileAbout.jsx'
import {
  getGroupChannels,
  getLayoutChannelOrder,
  fetchAllChannelContents,
  useArenaRefresh,
  mediaSrc,
  posterSrc,
  tagsFromContents,
  THUMBNAIL_TITLE,
} from '../../arena/index.js'

const CHANNEL_PREFIX = '‡'

const LabelArea = styled(Grid)`
  padding-top: 120px;
  padding-bottom: 120px;

  @media ${GRID.MEDIA_TABLET} {
    padding-top: 100px;
    padding-bottom: 100px;
  }

  @media ${GRID.MEDIA_MOBILE} {
    padding-top: 80px;
    padding-bottom: 80px;
  }
`

const LabelColumns = styled(GridCell)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-items: center;
  column-gap: ${GRID.GAP};
  row-gap: 200px;

  @media ${GRID.MEDIA_TABLET} {
    column-gap: ${GRID.GAP_TABLET};
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-template-columns: 1fr;
    row-gap: 150px;
  }
`

const labelScale = (width) => Math.min(0.8, width / 420)

const cellObserver =
  typeof ResizeObserver === 'undefined'
    ? null
    : new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.style.setProperty(
            '--label-scale',
            labelScale(entry.contentRect.width),
          )
        })
      })

// Sets --label-scale synchronously on mount (ResizeObserver's initial callback
// is async — a first paint at the wrong scale would flash), then keeps it in
// sync with the cell's width. React 19 ref cleanup detaches the observer.
const observeCell = (node) => {
  if (!node) return undefined
  node.style.setProperty('--label-scale', labelScale(node.clientWidth))
  cellObserver?.observe(node)
  return () => cellObserver?.unobserve(node)
}

// Height is the label's measured footprint (px, reported by Label via
// onFootprint) multiplied by the same scale applied to the stage. Every cell
// is sized to exactly its own content, so the constant row-gap renders as
// equal spacing between labels regardless of their differing heights.
const LabelCell = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;

  .label-wrapper {
    height: calc(var(--label-footprint, 410px) * var(--label-scale, 0.8));
    align-items: flex-start;
  }

  .label-stage {
    transform: scale(var(--label-scale, 0.8))
      translateX(min(0px, calc((280px - min(350px, 50vw + 100px)) / 2)));
    transform-origin: var(--pin-x) top;
  }
`

const StatusText = styled.p`
  grid-column: 1 / -1;
  font-family: var(--font-display);
  font-optical-sizing: auto;
  text-transform: uppercase;
  text-align: center;
  color: #131313;
`

// Full-width row that carries the mobile About block above the labels. Removed
// from the grid entirely on larger screens so it never adds an empty row/gap.
const MobileAboutCell = styled(GridCell)`
  display: none;

  @media ${GRID.MEDIA_MOBILE} {
    display: block;
    margin-bottom: 2.5rem;
  }
`

const cleanTitle = (title) => (title ?? '').replace(/^‡\s*/, '').trim()

function LabelFront({ title, tags }) {
  return (
    <>
      <ul className="label-front-top" aria-label="Skills">
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <div className="label-front-bottom">
        <span>{title}</span>
      </div>
    </>
  )
}

export default function ArenaLabels({
  onSelect,
  onReady,
  allTags = [],
  selectedTags = [],
  onToggleTag,
  onClearTags,
  onReadManifesto,
}) {
  const refreshKey = useArenaRefresh()
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [footprints, setFootprints] = useState({})

  // Ref so the fetch effect doesn't rebind (and refetch) when the parent
  // passes a new callback identity.
  const onReadyRef = useRef(onReady)
  useEffect(() => {
    onReadyRef.current = onReady
  })

  useEffect(() => {
    let cancelled = false
    const skipCache = refreshKey > 0

    ;(async () => {
      try {
        const [channels, layoutOrder] = await Promise.all([
          getGroupChannels(undefined, { skipCache }),
          // A missing/broken Layout channel shouldn't take the grid down —
          // fall back to the group's own channel order.
          getLayoutChannelOrder({ skipCache }).catch(() => []),
        ])
        const orderIndex = new Map(layoutOrder.map((id, i) => [id, i]))
        const flagged = channels
          .filter((ch) => (ch.title ?? '').startsWith(CHANNEL_PREFIX))
          .sort(
            (a, b) =>
              (orderIndex.get(a.id) ?? Infinity) -
              (orderIndex.get(b.id) ?? Infinity),
          )

        const built = await Promise.all(
          flagged.map(async (ch) => {
            // One contents fetch per channel drives everything below: the
            // thumbnail, the back stack, and the tags. (Previously the
            // thumbnail came from a separate findBlockByTitleInChannel call
            // that fetched the very same contents a second time.)
            const contents = await fetchAllChannelContents(ch.slug, { skipCache })
            const thumb = contents.find(
              (it) =>
                it.type !== 'Channel' &&
                it.title?.toLowerCase() === THUMBNAIL_TITLE.toLowerCase(),
            )

            // First media block after the Thumbnail becomes the back stack.
            const thumbIdx = contents.findIndex((it) => it.id === thumb?.id)
            const after = thumbIdx >= 0 ? contents.slice(thumbIdx + 1) : contents
            const stackBlock = after.find(
              (it) => it.type !== 'Channel' && mediaSrc(it),
            )
            // Labels render at ≤350px wide, so the medium (1200px) rendition
            // is plenty — originals are routinely multi-MB. Posters let video
            // labels paint immediately while the video loads lazily.
            const stackSrc = mediaSrc(stackBlock, { size: 'medium' })

            return {
              id: ch.id,
              slug: ch.slug,
              title: cleanTitle(ch.title),
              image: mediaSrc(thumb, { size: 'medium' }),
              poster: posterSrc(thumb, { size: 'medium' }),
              backStack: stackSrc
                ? [{ src: stackSrc, poster: posterSrc(stackBlock, { size: 'medium' }) }]
                : [],
              tags: tagsFromContents(contents),
            }
          }),
        )

        if (!cancelled) {
          setItems(built)
          setStatus('ready')
          onReadyRef.current?.(built)
        }
      } catch {
        if (!cancelled) {
          setStatus('error')
          // Errors also count as "done" — reveal the error state rather than
          // leaving the loader up forever.
          onReadyRef.current?.()
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  // A project matches the filter if it carries any of the selected tags
  // (union). No selection means show everything. The tag universe itself
  // (allTags) is derived once in App from this same data and passed back down,
  // so the mobile About and the desktop menu stay in sync with one source.
  const selectedLower = selectedTags.map((t) => t.toLowerCase())
  const visibleItems =
    selectedLower.length === 0
      ? items
      : items.filter((item) => {
          const itemTags = (item.tags ?? []).map((t) => t.toLowerCase())
          return selectedLower.some((t) => itemTags.includes(t))
        })

  return (
    <LabelArea as="section">
      <MobileAboutCell>
        <MobileAbout
          tags={allTags}
          selectedTags={selectedTags}
          onToggleTag={onToggleTag}
          onClearTags={onClearTags}
          onReadManifesto={onReadManifesto}
        />
      </MobileAboutCell>
      <LabelColumns>
        {status === 'error' && items.length === 0 && (
          <StatusText>Couldn’t load channels.</StatusText>
        )}
        {status === 'ready' && visibleItems.length === 0 && (
          <StatusText>No projects match the selected tags.</StatusText>
        )}
        {visibleItems.map((item) => (
          <LabelCell
            key={item.id}
            ref={observeCell}
            style={
              footprints[item.id]
                ? { '--label-footprint': `${footprints[item.id]}px` }
                : undefined
            }
          >
            <Label
              backgroundImage={item.image}
              backgroundPoster={item.poster}
              backStack={item.backStack}
              onFootprint={(px) =>
                setFootprints((prev) =>
                  px > (prev[item.id] ?? 0) ? { ...prev, [item.id]: px } : prev,
                )
              }
              onClick={() =>
                onSelect?.({
                  id: item.id,
                  slug: item.slug,
                  title: item.title,
                  tags: item.tags,
                })
              }
            >
              <LabelFront title={item.title} tags={item.tags} />
            </Label>
          </LabelCell>
        ))}
      </LabelColumns>
    </LabelArea>
  )
}
