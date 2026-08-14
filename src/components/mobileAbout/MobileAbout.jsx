import styled from 'styled-components'
import { GRID } from '../../grid/index.js'
import CopyEmail from '../menu/CopyEmail.jsx'

const Wrap = styled.div`
  display: none;

  @media ${GRID.MEDIA_MOBILE} {
    display: block;
    width: 100%;
  }
`

const Bio = styled.div`
  color: #000;
  font-family: var(--font-mono);
  font-size: calc(0.95rem * 0.8);
  line-height: 1.35;
  font-weight: 350;
  text-transform: uppercase;
  letter-spacing: -0.025em;

  p {
    margin: 0;
  }
  p + p {
    margin-top: 1.25em;
  }
`

const ManifestoLink = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Section = styled.div`
  margin-top: 3rem;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: ${GRID.GAP_MOBILE};
  color: #000;
  font-family: var(--font-mono);
  font-size: calc(0.95rem * 0.8);
  line-height: 1.35;
  font-weight: 350;
  text-transform: uppercase;
  letter-spacing: -0.025em;

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

const Label = styled.span`
  opacity: 0.2;
`

const List = styled.ul`
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
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) {
    &:hover {
      text-decoration: underline;
    }
  }
`

export default function MobileAbout({
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
    <Wrap>
      <Bio>
        <p>
          Yİğİt (yee-eet) Toprak is a graphic designer and programmer based in
          Toronto. His work explores graphic systems built through reimagined
          tools, interfaces, and processes.
        </p>
        <p>
          His practice spans digital and print design, including UI/UX,
          typography, brand development, creative direction, editorial work, and
          custom tools.
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

      <Section>
        <Label>Contact</Label>
        <List aria-label="Contact">
          <li>
            <CopyEmail />
          </li>
          <li>
            <a href="https://www.instagram.com/yigit.world/" target="_blank" rel="noreferrer">
              @yigit.world
            </a>
          </li>
          <li>
            <a
              href="https://www.are.na/yigit-toprak-ceo0kj3p55g/index"
              target="_blank"
              rel="noreferrer"
            >
              are.na/yigit-toprak
            </a>
          </li>
        </List>
      </Section>

      {tags.length > 0 && (
        <Section>
          <Label>Tags</Label>
          <List aria-label="Tags">
            {hasFilter && (
              <li key="__all">
                <TagButton type="button" onClick={() => onClearTags?.()}>
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
          </List>
        </Section>
      )}
    </Wrap>
  )
}
