import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useSwing } from '../../motion/swingContext.js'
import { GRID } from '../../grid/index.js'

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  z-index: 10;
  background: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.035);
  overflow: visible;
  transform-origin: calc(100% - 20px) 20px;
  will-change: transform;
  backface-visibility: hidden;

  /* Desktop: 12 columns, band starts at column 5 (one wider than detail's 6). */
  --grid-w: min(${GRID.MAX_WIDTH}, 100vw);
  --grid-margin: calc((100vw - var(--grid-w)) / 2);
  --col: calc((var(--grid-w) - ${GRID.PADDING} * 2 - ${GRID.GAP} * 11) / 12);
  --band-left: calc(
    var(--grid-margin) + ${GRID.PADDING} + var(--col) * 4 + ${GRID.GAP} * 4
  );
  width: calc(100vw - var(--band-left));

  @media ${GRID.MEDIA_TABLET} {
    /* 8 columns, band starts at column 3 (one wider than detail's 4). */
    --col: calc((100vw - ${GRID.PADDING_TABLET} * 2 - ${GRID.GAP_TABLET} * 7) / 8);
    --band-left: calc(${GRID.PADDING_TABLET} + var(--col) * 2 + ${GRID.GAP_TABLET} * 2);
    width: calc(100vw - var(--band-left));
  }

  @media ${GRID.MEDIA_MOBILE} {
    /* Full width on mobile — no room to reveal a background column. */
    width: 100vw;
  }
`


const Scroller = styled.div`
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding: 0 100vw;
  margin: 0 -100vw;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }

  /* On mobile the panel is full-width and the menu strip doesn't exist, so
     there's no gap to click through — and iOS won't touch-scroll a container
     that isn't itself hit-testable. Restore normal pointer events there. */
  @media ${GRID.MEDIA_MOBILE} {
    pointer-events: auto;
  }
`

export default function SwingPanel({ children }) {
  const { registerPanel } = useSwing()
  const localRef = useRef(null)

  useEffect(() => {
    registerPanel(localRef.current)
    return () => registerPanel(null)
  }, [registerPanel])

  return (
    <Panel ref={localRef}>
      <Scroller>{children}</Scroller>
    </Panel>
  )
}
