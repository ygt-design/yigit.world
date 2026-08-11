import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { GRID } from '../grid'
import { useMediaQuery } from '../grid/useMediaQuery'

const GridContainer = styled.div`
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 100vw;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
`

const GridInner = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: min(${GRID.MAX_WIDTH}, 100%);
  height: 100%;
  margin: 0 auto;
  display: ${props => (props.$isVisible ? 'grid' : 'none')};
  grid-template-columns: repeat(${GRID.COLUMNS}, 1fr);
  column-gap: ${GRID.GAP};
  row-gap: 0;
  padding: 0 ${GRID.PADDING};
  overflow: hidden;

  @media ${GRID.MEDIA_TABLET} {
    grid-template-columns: repeat(${GRID.COLUMNS_TABLET}, 1fr);
    padding: 0 ${GRID.PADDING_TABLET};
    column-gap: ${GRID.GAP_TABLET};
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-template-columns: repeat(${GRID.COLUMNS_MOBILE}, 1fr);
    padding: 0 ${GRID.PADDING_MOBILE};
    column-gap: ${GRID.GAP_MOBILE};
  }
`

const GridColumn = styled.div`
  box-sizing: border-box;
  min-width: 0;
  background-color: #f5f5f5;
  min-height: 100vh;
`

function GridOverlay() {
  const [isVisible, setIsVisible] = useState(false)
  const isMobile = useMediaQuery(GRID.MEDIA_MOBILE)
  const isTablet = useMediaQuery(GRID.MEDIA_TABLET)

  // Render the correct number of columns for the active breakpoint
  const columnCount = isMobile
    ? GRID.COLUMNS_MOBILE
    : isTablet
      ? GRID.COLUMNS_TABLET
      : GRID.COLUMNS

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore key repeats so holding G doesn't flicker the overlay
      if ((e.key === 'g' || e.key === 'G') && !e.repeat) {
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  return (
    <GridContainer>
      <GridInner $isVisible={isVisible}>
        {Array.from({ length: columnCount }).map((_, index) => (
          <GridColumn key={index} />
        ))}
      </GridInner>
    </GridContainer>
  )
}

export default GridOverlay
