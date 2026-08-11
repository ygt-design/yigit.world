import { useCallback, useSyncExternalStore } from "react";

/**
 * useMediaQuery — subscribe to a CSS media query in JS.
 *
 * Uses useSyncExternalStore so React can read the current value
 * without synchronous setState inside an effect.
 *
 * @param {string} query  A media query string, e.g. GRID.MEDIA_MOBILE
 * @returns {boolean} true when the query currently matches
 *
 * Example:
 *   const isMobile = useMediaQuery(GRID.MEDIA_MOBILE)
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = () => window.matchMedia(query).matches;

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useMediaQuery;
