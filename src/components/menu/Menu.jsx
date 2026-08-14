import styled from 'styled-components'
import { Grid, GridCell, GridSpan4, GRID } from '../../grid/index.js'
import ManifestoArticle from '../manifesto/ManifestoArticle.jsx'
import CopyEmail from './CopyEmail.jsx'

const MenuLayer = styled.nav`
  position: fixed;
  inset: 0;
  z-index: 1;
  background: white;

  overflow: hidden;

  @media ${GRID.MEDIA_TABLET} {
    overflow-y: auto;
  }
  
  @media ${GRID.MEDIA_MOBILE} {
    display: none;
  }
`

const MenuGrid = styled(Grid)`
padding-top: ${GRID.PADDING};
  padding-bottom: ${GRID.ROW_GAP};
`

const Bio = styled.div`
  color: #000;
  font-family: var(--font-mono);
  font-size: calc(0.95rem * 0.8);
  line-height: 1.35;
  font-weight: 350;
  text-transform: uppercase;
  letter-spacing: -0.025em;

  p + p {
    margin-top: 1.25em;
  }
`

const TagsSection = styled.div`
  margin-top: 4rem;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: ${GRID.GAP};
  font-family: var(--font-mono);
  font-size: calc(0.95rem * 0.8);
  line-height: 1.35;
  font-weight: 350;
  text-transform: uppercase;
  letter-spacing: -0.025em;
  color: #000;

  @media ${GRID.MEDIA_TABLET} {
    column-gap: ${GRID.GAP_TABLET};
  }

  @media ${GRID.MEDIA_MOBILE} {
    column-gap: ${GRID.GAP_MOBILE};
  }
`

const TagsLabel = styled.span`
  opacity: 0.2;
`

const TagList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: block;
  }
`

const TagButton = styled.button`
  display: inline;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  text-align: left;
  text-decoration: ${(p) => (p.$active ? 'underline' : 'none')};
  opacity: ${(p) => (p.$dimmed ? 0.35 : 1)};
  transition: opacity 0.15s ease;

  &:hover {
    text-decoration: underline;
  }
`

const ManifestoLink = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const ContactCard = styled.div`
  margin-top: 4rem;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: ${GRID.GAP};
  color: #000;
  font-family: var(--font-mono);
  font-size: calc(0.95rem * 0.8);
  line-height: 1.35;
  font-weight: 350;
  text-transform: uppercase;
  letter-spacing: -0.025em;

  @media ${GRID.MEDIA_TABLET} {
    column-gap: ${GRID.GAP_TABLET};
  }

  @media ${GRID.MEDIA_MOBILE} {
    column-gap: ${GRID.GAP_MOBILE};
  }

  a,
  button {
    color: inherit;
    text-decoration: none;
  }
  a:hover,
  button:hover {
    text-decoration: underline;
  }
`

const ContactList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: block;
  }
`

const MANIFESTO_TILT = -5

const ManifestoFrame = styled.div`
  background: #fff;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.06);
  margin-top: calc(-1 * ${GRID.PADDING});
  margin-right: calc(
    -1 * ((100vw - min(${GRID.MAX_WIDTH}, 100vw)) / 2 + ${GRID.PADDING})
  );
  height: 100vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  transform-origin: 100% 0;
  transform: rotate(${MANIFESTO_TILT}deg);
  will-change: transform;

  @media ${GRID.MEDIA_TABLET} {
    margin-top: 0;
    margin-right: 0;
    height: auto;
    max-height: calc(100vh - ${GRID.PADDING} * 2);
    transform: none;
  }


  @media ${GRID.MEDIA_MOBILE} {
    position: relative;
    margin-top: 0;
    margin-right: 0;
    height: auto;
    max-height: none;
    overflow: visible;
    overscroll-behavior: auto;
    transform: none;
  }
`

export default function Menu({
  tags = [],
  selectedTags = [],
  onToggleTag,
  onClearTags,
  onReadManifesto,
}) {
  const hasFilter = selectedTags.length > 0
  const isSelected = (tag) =>
    selectedTags.some((t) => t.toLowerCase() === tag.toLowerCase())

  return (
    <MenuLayer aria-label="About">
      <MenuGrid as="div">
        <GridSpan4 $start={1} $startMobile={1} $spanMobile={4}>
          <Bio>
            <p>
              Yİğİt (yee-eet) Toprak is a graphic designer and programmer based in
              Toronto. His work explores graphic systems built through reimagined
              tools, interfaces, and processes.
            </p>
            <p>
              His practice spans digital and physical design, hands on making, type design, visual identity systems, creative direction, editorial design, and
              custom tools, software and hardware.
            </p>
            <p>
              He has worked on projects for clients including Google, CIBC, the
              University of Toronto, Projectory, York University, Evergreen, NXNE,
              and SvN Architects.{' '}
              <ManifestoLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onReadManifesto?.()
                }}
              >
                Read his manifesto →
              </ManifestoLink>
            </p>
          </Bio>

          {tags.length > 0 && (
            <TagsSection>
              <TagsLabel>Tags</TagsLabel>
              <TagList aria-label="Tags">
                {hasFilter && (
                  <li key="__all">
                    <TagButton
                      type="button"
                      onClick={() => onClearTags?.()}
                    >
                      All
                    </TagButton>
                  </li>
                )}
                {tags.map((tag) => {
                  const active = isSelected(tag)
                  return (
                    <li key={tag}>
                      <TagButton
                        type="button"
                        $active={active}
                        $dimmed={hasFilter && !active}
                        aria-pressed={active}
                        onClick={() => onToggleTag?.(tag)}
                      >
                        {tag}
                      </TagButton>
                    </li>
                  )
                })}
              </TagList>
            </TagsSection>
          )}

          <ContactCard>
            <TagsLabel>Contact</TagsLabel>
            <ContactList aria-label="Contact">
              <li>
                <CopyEmail />
              </li>
              <li>
                <a href="https://www.instagram.com/yigit.world/" target='blank'>@yigit.world</a>
              </li>
              <li>
                <a href="https://www.are.na/yigit-toprak-ceo0kj3p55g/index" target="_blank">are.na/yigit-toprak</a>
              </li>
            </ContactList>
          </ContactCard>
        </GridSpan4>

        <GridCell
          $start={6}
          $end={-1}
          $startTablet={1}
          $spanTablet={8}
          $startMobile={1}
          $spanMobile={4}
        >
          <ManifestoFrame>
            <ManifestoArticle />
          </ManifestoFrame>
        </GridCell>
      </MenuGrid>
    </MenuLayer>
  )
}
