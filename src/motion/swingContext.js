import { createContext, useContext } from 'react'

export const SwingContext = createContext(null)

export function useSwing() {
  return useContext(SwingContext)
}
