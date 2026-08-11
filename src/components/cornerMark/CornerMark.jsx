import styled from 'styled-components'

const Mark = styled.button`
  appearance: none;
  border: none;
  padding: 0;
  background: transparent;
  position: fixed;
  top: 20px;
  right: 20px;
  width: 18px;
  height: 18px;
  z-index: 1000;
  cursor: pointer;

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

export default function CornerMark({ isOpen, onClick, onPeek, onPeekEnd }) {
  return (
    <Mark
      type="button"
      onClick={onClick}
      onPointerEnter={onPeek}
      onPointerLeave={onPeekEnd}
      onBlur={onPeekEnd}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    />
  )
}
