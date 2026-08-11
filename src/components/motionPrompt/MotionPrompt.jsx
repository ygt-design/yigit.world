import { useState } from 'react'
import styled, { css, keyframes } from 'styled-components'
import {
  tiltNeedsPermission,
  requestTiltPermission,
} from '../../motion/deviceTilt.js'

// Swings in around its pin like the labels: drop with overshoot, settle.
const swingIn = keyframes`
  0% {
    transform: translateX(-50%) rotate(10deg);
    opacity: 0;
  }
  18% {
    opacity: 1;
  }
  45% {
    transform: translateX(-50%) rotate(-4deg);
  }
  70% {
    transform: translateX(-50%) rotate(1.8deg);
  }
  88% {
    transform: translateX(-50%) rotate(-0.7deg);
  }
  100% {
    transform: translateX(-50%) rotate(0deg);
  }
`

const Card = styled.div`
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
  z-index: 9999; 
  width: min(340px, calc(100vw - 40px));
  padding: 15px;
  background: #fff;
  border: 0.5px solid rgba(123, 123, 123, 0.5);
  box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.1);
  color: #000;
  transform-origin: 50% 0; /* the pin */
  transform: translateX(-50%);
  animation: ${swingIn} 1.1s cubic-bezier(0.23, 1, 0.32, 1) both;
  transition:
    transform 0.45s ease,
    opacity 0.45s ease;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0.06;
  }

  ${(p) =>
    p.$leaving &&
    css`
      animation: none;
      transform: translateX(-50%) rotate(-14deg);
      opacity: 0;
      pointer-events: none;
    `}
`

// Crossed hairlines marking the pin the card hangs from — same mark as the
// label pins and the corner cross.
const Pin = styled.span`
  position: absolute;
  top: 0;
  left: 50%;
  width: 18px;
  height: 18px;
  transform: translate(-50%, -50%);
  z-index: 2;

  &::before,
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #131313;
    transform-origin: center;
  }

  &::before {
    transform: rotate(45deg);
  }

  &::after {
    transform: rotate(-45deg);
  }
`

const Content = styled.div`
  position: relative;
  z-index: 2;
`

const Title = styled.div`
  font-family: var(--font-display);
  font-optical-sizing: auto;
  font-stretch: var(--font-title-stretch);
  font-size: 26px;
  line-height: 1;
  text-transform: uppercase;
`

const Copy = styled.p`
  margin-top: 1em;
  margin-bottom: 2rem;
  font-family: var(--font-mono);
  font-size: calc(0.95rem * 0.8);
  line-height: 1.35;
  font-weight: 350;
  text-transform: uppercase;
  letter-spacing: -0.025em;
`

const Actions = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 1.5em;
  font-family: var(--font-mono);
  font-size: calc(0.95rem * 0.8);
  line-height: 1.35;
  font-weight: 350;
  text-transform: uppercase;
  letter-spacing: -0.025em;
`

const TextButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  text-decoration: ${(p) => (p.$primary ? 'underline' : 'none')};
  opacity: ${(p) => (p.$primary ? 1 : 0.35)};
`

const LEAVE_MS = 450

// Designed stand-in for the browser's motion-permission flow. iOS only shows
// its native dialog when requestPermission is called from a tap, so this card
// supplies that tap ("Allow motion") in the site's own voice. It asks on every
// visit by design — once iOS has granted, the request resolves silently, so
// re-asking only costs the returning visitor a single tap. Declining just
// leaves the labels to gravity — there's no hover to lose on touch anyway.
export default function MotionPrompt({ show }) {
  // Whether the platform gates motion behind a permission call never changes
  // within a page load, so sample it once.
  const [needsPermission] = useState(() => tiltNeedsPermission())
  const [dismissed, setDismissed] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const close = () => {
    setLeaving(true)
    setTimeout(() => setDismissed(true), LEAVE_MS)
  }

  const allow = async () => {
    await requestTiltPermission()
    close()
  }

  const dismiss = () => {
    close()
  }

  if (!show || !needsPermission || dismissed) return null

  return (
    <Card role="dialog" aria-label="Motion access" $leaving={leaving}>
      <Pin aria-hidden="true" />
      <Content>
        <Title>Enable Gyroscope (?)</Title>
        <Copy>
          You can swing the labels by tilting your phone for funziess!! This will not track data or anything don't worry or is not a cookie message. 
        </Copy>
        <Actions>
          <TextButton type="button" $primary onClick={allow} disabled={leaving}>
            Allow motion
          </TextButton>
          <TextButton type="button" onClick={dismiss} disabled={leaving}>
            Not now
          </TextButton>
        </Actions>
      </Content>
    </Card>
  )
}
