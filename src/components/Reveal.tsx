import { useEffect, useRef } from "react";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
// Smooth ease so the motion starts and ends gently
const ease = (t: number) => t * t * (3 - 2 * t);

// Scroll-linked: the content fades in and rises as it enters the screen, and
// fades out and drifts up as it leaves, tied to scroll position so you watch
// it happen while scrolling (both directions).
export default function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const h = window.innerHeight;
      const r = el.getBoundingClientRect();
      // 0 -> 1 while the top edge travels from the screen bottom up to 55%
      const enter = ease(clamp((h - r.top) / (h * 0.45)));
      // 1 -> 0 while the bottom edge travels from 45% of the screen up to the top
      const exit = ease(clamp(r.bottom / (h * 0.45)));
      el.style.opacity = String(Math.min(enter, exit).toFixed(3));
      const y = (1 - enter) * 70 - (1 - exit) * 50;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      // Hidden until the first scroll calculation runs (avoids a flash)
      style={{ opacity: 0, willChange: "opacity, transform" }}
    >
      {children}
    </div>
  );
}
