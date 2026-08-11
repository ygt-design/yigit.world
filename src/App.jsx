import { useState, useCallback, useEffect, useRef } from "react";
import Cursor from "./components/cursor/Cursor.jsx";
import ArenaLabels from "./components/arenaLabels/ArenaLabels.jsx";
import CornerMark from "./components/cornerMark/CornerMark.jsx";
import SwingPanel from "./components/swingPanel/SwingPanel.jsx";
import Menu from "./components/menu/Menu.jsx";
import ProjectPanel from "./components/projectPanel/ProjectPanel.jsx";
import ManifestoPanel from "./components/manifesto/ManifestoPanel.jsx";
import LoadingScreen from "./components/loadingScreen/LoadingScreen.jsx";
import MotionPrompt from "./components/motionPrompt/MotionPrompt.jsx";
import TiltDebug from "./components/tiltDebug/TiltDebug.jsx";

// Temporary: `?tilt` in the URL shows the sensor diagnostic overlay.
const showTiltDebug = new URLSearchParams(window.location.search).has("tilt");
import { SwingProvider } from "./motion/SwingProvider.jsx";
import { useSwing } from "./motion/swingContext.js";
import { GRID } from "./grid/index.js";
import GlobalStyle from "./styles.js";

// Tracks whether the viewport is at/below the mobile breakpoint. Drives the
// mobile-only behavior (About surfaced in the grid, manifesto panel, corner
// mark = close-only) without duplicating the CSS breakpoint in JS elsewhere.
function useIsMobile() {
  const query = `(max-width: ${GRID.BREAKPOINT})`;
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return isMobile;
}

// Readable URL slug from a project title (strip the ‡ marker + punctuation),
// falling back to the Are.na channel slug.
const projectSlug = (project) => {
  if (!project) return "";
  const fromTitle = project.title
    ?.toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return fromTitle || project.slug || "";
};

// Deep link: capture ?project= at module load, before the URL-sync effect
// (which runs on mount with no project) strips it from the address bar.
const initialProjectSlug = new URLSearchParams(window.location.search).get(
  "project",
);

// Dedupe the tag universe across all loaded projects, case-insensitively with
// the first spelling winning. Derived once here from the label data so the
// About menu and mobile About share it — the menu no longer refetches every
// channel just to rebuild this list.
const dedupeTags = (items = []) => {
  const seen = new Set();
  const out = [];
  items.forEach((item) =>
    (item.tags ?? []).forEach((tag) => {
      const key = tag.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(tag);
      }
    }),
  );
  return out;
};

function Scene() {
  const { setOpen, setPeek, setCursorEnabled } = useSwing();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Mobile only: the manifesto opens in its own panel (a bottom sheet) rather
  // than being revealed behind the swing panel.
  const [manifestoOpen, setManifestoOpen] = useState(false);
  const openManifesto = useCallback(() => setManifestoOpen(true), []);
  const closeManifesto = useCallback(() => setManifestoOpen(false), []);

  // The selected project opens ProjectPanel — a panel that swings in on top of
  // the label grid panel at the same width. Closing swings it back off (rather
  // than unmounting instantly) to reveal the grid behind; the corner mark or
  // Escape start the close.
  const [project, setProject] = useState(null);
  const [closingProject, setClosingProject] = useState(false);

  const closeProject = useCallback(() => setClosingProject(true), []);
  const handleProjectClosed = useCallback(() => {
    setProject(null);
    setClosingProject(false);
  }, []);

  // Tag filter: selecting tags in the About menu narrows the project grid.
  // Empty = show everything. Toggling a selected tag removes it again.
  const [selectedTags, setSelectedTags] = useState([]);
  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);
  const clearTags = useCallback(() => setSelectedTags([]), []);

  // The full tag list, lifted from the label data (see dedupeTags) so both the
  // desktop menu and the mobile About render it without a second fetch.
  const [allTags, setAllTags] = useState([]);

  // Boot sequence: the loading screen covers everything while ArenaLabels
  // fetches. When the data settles (ready or error) it swings off the corner
  // pin to reveal the content, then unmounts.
  const [contentReady, setContentReady] = useState(false);
  const [booting, setBooting] = useState(true);
  // Restore the deep-linked project once the labels data arrives — but only
  // on the first load, not on later refetches (tab refocus etc.).
  const restoredRef = useRef(false);
  const handleReady = useCallback((items) => {
    setContentReady(true);
    if (items) setAllTags(dedupeTags(items));
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (!initialProjectSlug || !items) return;
    const match = items.find(
      (item) =>
        projectSlug(item) === initialProjectSlug ||
        item.slug === initialProjectSlug,
    );
    if (match) setProject(match);
  }, []);
  const handleGone = useCallback(() => setBooting(false), []);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    setOpen(next);
  };

  // "Read his manifesto →" (in the always-visible bio strip) swings the panel
  // open the same way the corner X does, revealing the menu area where the
  // manifesto lives behind the panel.
  const openMenu = useCallback(() => {
    setIsOpen(true);
    setOpen(true);
  }, [setOpen]);

  const openProject = useCallback((p) => {
    setProject(p);
    setClosingProject(false);
  }, []);

  // The corner mark is the universal close/toggle. Priority: close the
  // manifesto sheet, then a project, then (desktop only) toggle the About menu.
  // On mobile there's no swing-revealed menu, so the mark is close-only.
  const handleCornerClick = () => {
    if (manifestoOpen) {
      closeManifesto();
      return;
    }
    if (project) {
      closeProject();
      return;
    }
    if (!isMobile) toggle();
  };

  // Freeze the label grid's cursor reactions while a project panel is open, so
  // the pointer only interacts with the panel, not the grid behind it. Re-enable
  // the moment a close *starts* (closingProject) rather than when the swing-off
  // finally settles — otherwise the revealed grid stays unresponsive for the
  // whole ~1.8s close animation.
  useEffect(() => {
    setCursorEnabled(!project || closingProject);
  }, [project, closingProject, setCursorEnabled]);

  // Reflect the open project in the address bar (?project=<name>) and clear it
  // again on close. replaceState keeps history clean and back-button sane.
  // Keyed off closingProject too, so the URL clears the moment the close
  // starts instead of after the swing-off animation settles.
  useEffect(() => {
    const { pathname } = window.location;
    const shown = closingProject ? null : project;
    const next = shown
      ? `${pathname}?project=${encodeURIComponent(projectSlug(shown))}`
      : pathname;
    window.history.replaceState(null, "", next);
  }, [project, closingProject]);

  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeProject();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [project, closeProject]);

  return (
    <>
      <GlobalStyle />
      <Menu
        tags={allTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onClearTags={clearTags}
        onReadManifesto={openMenu}
      />
      <SwingPanel>
        <ArenaLabels
          onReady={handleReady}
          onSelect={openProject}
          allTags={allTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          onClearTags={clearTags}
          onReadManifesto={openManifesto}
        />
      </SwingPanel>
      {project && (
        <ProjectPanel
          project={project}
          closing={closingProject}
          onClosed={handleProjectClosed}
        />
      )}
      <ManifestoPanel open={manifestoOpen} onClose={closeManifesto} />
      <CornerMark
        isOpen={isOpen || Boolean(project) || manifestoOpen}
        onClick={handleCornerClick}
        onPeek={() => {
          if (!isMobile) setPeek(true);
        }}
        onPeekEnd={() => setPeek(false)}
      />
      {booting && <LoadingScreen done={contentReady} onGone={handleGone} />}
      <MotionPrompt show={!booting} />
      {showTiltDebug && <TiltDebug />}
      <Cursor />
    </>
  );
}

function App() {
  return (
    <SwingProvider>
      <Scene />
    </SwingProvider>
  );
}

export default App;
