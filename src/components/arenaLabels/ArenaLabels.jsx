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

const observeCell = (node) => {
  if (!node) return undefined
  node.style.setProperty('--label-scale', labelScale(node.clientWidth))
  cellObserver?.observe(node)
  return () => cellObserver?.unobserve(node)
}

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
            const contents = await fetchAllChannelContents(ch.slug, { skipCache })
            const thumb = contents.find(
              (it) =>
                it.type !== 'Channel' &&
                it.title?.toLowerCase() === THUMBNAIL_TITLE.toLowerCase(),
            )

            const thumbIdx = contents.findIndex((it) => it.id === thumb?.id)
            const after = thumbIdx >= 0 ? contents.slice(thumbIdx + 1) : contents
            const stackBlock = after.find(
              (it) => it.type !== 'Channel' && mediaSrc(it),
            )
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
          onReadyRef.current?.()
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

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
