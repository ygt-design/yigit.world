import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

const CopyEmailWrap = styled.span`
  position: relative;
  display: inline-block;
`

const CopyEmailButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
`

const CopyTooltip = styled.span`
  position: fixed;
  top: 0;
  left: 0;
  padding: 0.35rem;
  background: #000;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  line-height: 1.2;
  font-weight: 350;
  text-transform: uppercase;
  letter-spacing: -0.025em;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  will-change: transform;
`

export const EMAIL = 'designer.ygt@gmail.com'

export default function CopyEmail() {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  // Position imperatively with a compositor-only transform: no React re-render
  // and no layout/paint work per mousemove, so the rest of the page never
  // re-rasterizes while the tooltip tracks the cursor.
  const moveTooltip = e => {
    const el = tooltipRef.current
    if (!el) return
    el.style.transform =
      `translate(${e.clientX + 80}px, ${e.clientY - 10}px) ` +
      'translate(-50%, calc(-100% - 0.6em))'
  }

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — leave tooltip unchanged.
    }
  }

  return (
    <CopyEmailWrap
      onMouseEnter={e => {
        moveTooltip(e)
        setHovered(true)
      }}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={moveTooltip}
    >
      <CopyEmailButton type="button" onClick={handleClick}>
        {EMAIL}
      </CopyEmailButton>
      {createPortal(
        <CopyTooltip
          ref={tooltipRef}
          style={{ visibility: hovered ? 'visible' : 'hidden' }}
          aria-live="polite"
        >
          {copied ? 'copied!' : 'copy to clipboard'}
        </CopyTooltip>,
        document.body
      )}
    </CopyEmailWrap>
  )
}
