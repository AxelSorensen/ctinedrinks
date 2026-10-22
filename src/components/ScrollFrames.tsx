import { useEffect, useRef, useState } from "react";
import { useLite } from "../context/ReadyContext";

const FRAME_COUNT = 48;
const FRAME_PATH = (idx: number) =>
  `/scroll-frames/${String(idx + 1).padStart(4, "0")}.webp`;

// Module-level so every instance (mobile + desktop), re-render and strict-mode
// remount shares one set of Image objects. Nothing is dropped or re-requested,
// so the browser never cancels an in-flight frame.
const frames: HTMLImageElement[] = [];
let preloadStarted = false;
let preloadAborted = false;
let loadedCount = 0;
// If all frames are not in by then, the connection is too slow for the animation
const FRAMES_TIMEOUT_MS = 15000;

function startFramePreload(onTooSlow: () => void) {
  if (preloadStarted) return;
  preloadStarted = true;
  let i = 0;
  const timer = setTimeout(() => {
    if (loadedCount < FRAME_COUNT) {
      preloadAborted = true;
      onTooSlow();
    }
  }, FRAMES_TIMEOUT_MS);
  const next = () => {
    if (preloadAborted || i >= FRAME_COUNT) return;
    const img = new window.Image();
    img.decoding = "async";
    img.onload = img.onerror = () => {
      if (++loadedCount >= FRAME_COUNT) clearTimeout(timer);
      // Re-run our handler (not the page-wide scroll listeners) so a frame that just arrived can be shown
      window.dispatchEvent(new Event("ctine-frame-loaded"));
      next();
    };
    if (i === 0) img.fetchPriority = "high";
    img.src = FRAME_PATH(i++);
    frames.push(img);
  };
  // Two parallel lanes, in scroll order
  next();
  next();
}

export default function ScrollFrames({ start = true }: { start?: boolean }) {
  const [frame, setFrame] = useState(0);
  const [overlayAlpha, setOverlayAlpha] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const lastIdx = useRef(0);
  const { liteFrames, setLiteFrames, minimal, detected } = useLite();
  useEffect(() => {
    if (start && !liteFrames) startFramePreload(() => setLiteFrames(true));
  }, [start, liteFrames, setLiteFrames]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          ticking = false;
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          // Animation runs as the bottle rises into view and finishes exactly
          // when it sits fully on screen just under the 72px navbar, so the
          // finished bottle is never cropped by the top or bottom of the screen
          const NAV = 72;
          const scrollProgress = Math.min(
            1,
            Math.max(0, 1 - (rect.top - NAV) / (windowHeight * 0.7 - NAV)),
          );
          const idx = Math.floor(scrollProgress * (FRAME_COUNT - 1));
          // Only swap to frames already loaded (nearest earlier one otherwise);
          // changing <img src> to an in-flight frame cancels its request
          // Lite mode: one static bottle, no frame swapping
          let show = liteFrames ? 0 : idx;
          while (show > 0 && !frames[show]?.complete) show--;
          if (show !== lastIdx.current) {
            lastIdx.current = show;
            setFrame(show);
          }
          // Fade to black halfway through the first slide (frame 0 to frame 1)
          let alpha = 0;
          if (idx === 0) {
            // Fade in black overlay as scrollProgress goes from 0 to halfway to frame 1
            const frameProgress = (scrollProgress * (FRAME_COUNT - 1)) % 1;
            alpha = Math.min(1, Math.max(0, frameProgress * 2)); // 0 to 1 as frameProgress goes 0 to 0.5
          } else {
            alpha = 1;
          }
          setOverlayAlpha((prev) => (prev === alpha ? prev : alpha));
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("ctine-frame-loaded", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("ctine-frame-loaded", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [liteFrames]);

  return (
    <div
      ref={containerRef}
      style={{
        // visible height = viewport minus the 72px fixed navbar
        ["--frame-h" as string]: "calc(100svh - 72px)",
        width: "100vw",
        height: "var(--frame-h)",
        position: "relative",
        overflow: "hidden",
        zIndex: 1,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {detected && minimal && (
        // Small cropped bottle placed exactly where it sits in the full frame
        // (same box maths as object-fit: cover on a 16:9 frame)
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "calc(var(--frame-h) * 1.7778)",
            height: "var(--frame-h)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          <img
            src="/scroll-frames/bottle-static.webp"
            alt="CTINE Bottle"
            draggable={false}
            style={{
              position: "absolute",
              left: "41.563%",
              top: "13.426%",
              width: "14.271%",
              height: "84.352%",
            }}
          />
        </div>
      )}
      {detected && !minimal && (
        <img
          src={FRAME_PATH(frame)}
          alt={`Frame ${frame + 1}`}
          style={{
            // Always fit by height so the top and bottom of the bottle are
            // never cropped; extra width is clipped by the container
            width: "calc(var(--frame-h) * 1.7778)",
            height: "var(--frame-h)",
            maxWidth: "none",
            flexShrink: 0,
            objectFit: "fill",
            pointerEvents: "none",
            userSelect: "none",
          }}
          draggable={false}
        />
      )}
    </div>
  );
}
