import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 48;
const FRAME_PATH = (idx: number) =>
  `/scroll-frames/${String(idx + 1).padStart(4, "0")}.png`;

export default function ScrollFrames() {
  const [frame, setFrame] = useState(0);
  const [overlayAlpha, setOverlayAlpha] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload images
  useEffect(() => {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new window.Image();
      img.src = FRAME_PATH(i);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // Animation triggers when the component is in view
      const scrollProgress = Math.min(
        1,
        Math.max(0, 1 - rect.top / (windowHeight * 0.7)),
      );
      const idx = Math.floor(scrollProgress * (FRAME_COUNT - 1));
      setFrame(idx);
      // Fade to black halfway through the first slide (frame 0 to frame 1)
      let alpha = 0;
      if (idx === 0) {
        // Fade in black overlay as scrollProgress goes from 0 to halfway to frame 1
        const frameProgress = (scrollProgress * (FRAME_COUNT - 1)) % 1;
        alpha = Math.min(1, Math.max(0, frameProgress * 2)); // 0 to 1 as frameProgress goes 0 to 0.5
      } else {
        alpha = 1;
      }
      setOverlayAlpha(alpha);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        zIndex: 1,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={FRAME_PATH(frame)}
        alt={`Frame ${frame + 1}`}
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          pointerEvents: "none",
          userSelect: "none",
        }}
        draggable={false}
      />
      {/* No overlay to prevent black glitch at start */}
    </div>
  );
}
