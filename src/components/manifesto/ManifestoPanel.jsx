import { useEffect } from 'react'
import styled from 'styled-components'
import ManifestoArticle from './ManifestoArticle.jsx'

// Dimmed layer behind the sheet. Sits below the corner mark (z 1000) so the
// close X stays tappable, and clicking it (the strip above the sheet) closes.
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 900;
  background: rgba(0, 0, 0, 0.25);
  opacity: ${(p) => (p.$open ? 1 : 0)};
  visibility: ${(p) => (p.$open ? 'visible' : 'hidden')};
  transition: opacity 0.35s ease, visibility 0.35s ease;
`

// The manifesto reads in a sheet that slides up from the bottom, leaving a
// short strip of backdrop at the top to tap off. Scrolls internally.
const Sheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 8vh;
  bottom: 0;
  z-index: 901;
  background: #fff;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  overflow-y: auto;
  overscroll-behavior: contain;
  transform: translateY(${(p) => (p.$open ? '0' : '100%')});
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
  pointer-events: ${(p) => (p.$open ? 'auto' : 'none')};
`

export default function ManifestoPanel({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <Backdrop $open={open} onClick={onClose} aria-hidden={!open} />
      <Sheet
        $open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Manifesto"
        aria-hidden={!open}
      >
        <ManifestoArticle />
      </Sheet>
    </>
  )
}
