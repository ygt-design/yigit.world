import { useEffect, useState } from "react";
import {
  getGroupChannels,
  getLayoutChannelOrder,
  fetchAllChannelContents,
  useArenaRefresh,
  mediaSrc,
  posterSrc,
  tagsFromContents,
  THUMBNAIL_TITLE,
} from "./index.js";

const CHANNEL_PREFIX = "‡";

const cleanTitle = (title) => (title ?? "").replace(/^‡\s*/, "").trim();

// Fetches the ‡-flagged group channels and builds the project list the labels
// render, ordered by the Are.na "Layout" channel. Extracted from ArenaLabels so
// alternate layouts (the /test reel) can share the same data + build logic.
// Returns { items, status } where items[] = { id, slug, title, image, poster,
// backStack, tags }.
export default function useArenaProjects() {
  const refreshKey = useArenaRefresh();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    const skipCache = refreshKey > 0;

    (async () => {
      try {
        const [channels, layoutOrder] = await Promise.all([
          getGroupChannels(undefined, { skipCache }),
          getLayoutChannelOrder({ skipCache }).catch(() => []),
        ]);
        const orderIndex = new Map(layoutOrder.map((id, i) => [id, i]));
        const flagged = channels
          .filter((ch) => (ch.title ?? "").startsWith(CHANNEL_PREFIX))
          .sort(
            (a, b) =>
              (orderIndex.get(a.id) ?? Infinity) -
              (orderIndex.get(b.id) ?? Infinity),
          );

        const built = await Promise.all(
          flagged.map(async (ch) => {
            const contents = await fetchAllChannelContents(ch.slug, {
              skipCache,
            });
            const thumb = contents.find(
              (it) =>
                it.type !== "Channel" &&
                it.title?.toLowerCase() === THUMBNAIL_TITLE.toLowerCase(),
            );

            const thumbIdx = contents.findIndex((it) => it.id === thumb?.id);
            const after =
              thumbIdx >= 0 ? contents.slice(thumbIdx + 1) : contents;
            const stackBlock = after.find(
              (it) => it.type !== "Channel" && mediaSrc(it),
            );
            const stackSrc = mediaSrc(stackBlock, { size: "medium" });

            return {
              id: ch.id,
              slug: ch.slug,
              title: cleanTitle(ch.title),
              image: mediaSrc(thumb, { size: "medium" }),
              poster: posterSrc(thumb, { size: "medium" }),
              backStack: stackSrc
                ? [
                    {
                      src: stackSrc,
                      poster: posterSrc(stackBlock, { size: "medium" }),
                    },
                  ]
                : [],
              tags: tagsFromContents(contents),
            };
          }),
        );

        if (!cancelled) {
          setItems(built);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { items, status };
}
