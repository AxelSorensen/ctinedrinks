"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ReadyState {
  ready: boolean;
  // Slow connection / data saver: show a photo instead of the video
  liteVideo: boolean;
  // Frames too slow: show one static bottle instead of the scroll animation
  liteFrames: boolean;
  // Bad connection detected up front: load no photos/video/frames at all
  minimal: boolean;
  // Connection check has run (render images only after this, so a bad
  // connection never starts an image request)
  detected: boolean;
  setLiteVideo: (v: boolean) => void;
  setLiteFrames: (v: boolean) => void;
}

const ReadyContext = createContext<ReadyState>({
  ready: false,
  liteVideo: false,
  liteFrames: false,
  minimal: false,
  detected: false,
  setLiteVideo: () => {},
  setLiteFrames: () => {},
});

export const useReady = () => useContext(ReadyContext).ready;
export const useLite = () => useContext(ReadyContext);

// Bad connection: data saver, <=3G, low bandwidth/high latency, a slow HTML
// response (works in browsers without the Network Information API), or very
// low memory
const isBadConnection = () => {
  const nav = navigator as Navigator & {
    connection?: {
      saveData?: boolean;
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
    deviceMemory?: number;
  };
  const c = nav.connection;
  if (
    c?.saveData ||
    c?.effectiveType === "slow-2g" ||
    c?.effectiveType === "2g" ||
    c?.effectiveType === "3g" ||
    (c?.downlink !== undefined && c.downlink > 0 && c.downlink < 1.5) ||
    (c?.rtt !== undefined && c.rtt >= 450) ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 1)
  ) {
    return true;
  }
  const t = performance.getEntriesByType("navigation")[0] as
    PerformanceNavigationTiming | undefined;
  // Time to first byte + download of the small HTML
  return !!t && t.responseEnd - t.requestStart > 1500;
};

export const ReadyProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [liteVideo, setLiteVideo] = useState(false);
  const [liteFrames, setLiteFrames] = useState(false);
  const [minimal, setMinimal] = useState(false);
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const bad = isBadConnection();
    if (bad) {
      setLiteVideo(true);
      setLiteFrames(true);
      setMinimal(true);
    }
    setDetected(true);
    const load = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new window.Image();
        img.onload = img.onerror = () => resolve();
        img.src = src;
      });
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 8000));
    Promise.race([
      Promise.all([
        load("/assets/ctine-logo.svg"),
        load("/ctine-logo.svg"),
        // Bad connection: the small cropped bottle, not the full frame
        load(
          bad
            ? "/scroll-frames/bottle-static.webp"
            : "/scroll-frames/0001.webp",
        ),
      ]),
      timeout,
    ]).then(() => setReady(true));
  }, []);

  return (
    <ReadyContext.Provider
      value={{
        ready,
        liteVideo,
        liteFrames,
        minimal,
        detected,
        setLiteVideo,
        setLiteFrames,
      }}
    >
      <div
        aria-hidden={ready}
        className="fixed inset-0 flex items-center justify-center bg-black transition-opacity duration-500"
        style={{
          zIndex: 10000,
          opacity: ready ? 0 : 1,
          pointerEvents: ready ? "none" : "auto",
        }}
      >
        <style>{`
          @keyframes ctine-pulse {
            0%, 100% { opacity: .35; }
            50% { opacity: .7; }
          }
          @property --p {
            syntax: "<number>";
            inherits: true;
            initial-value: 0;
          }
          /* One clock drives both the bar and the shine, so they never drift */
          @keyframes ctine-progress {
            from { --p: 0; }
            to { --p: 1; }
          }
          .ctine-splash {
            animation: ctine-progress 1.4s cubic-bezier(.6,0,.4,1) infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .ctine-splash * { animation: none !important; }
          }
        `}</style>
        <div
          className="ctine-splash"
          style={{ position: "relative", width: 300 }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              opacity: 1,
            }}
          >
            <img
              src="/assets/ctine-logo.svg"
              alt="CTINE"
              loading="eager"
              fetchPriority="high"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            {/* Light sweep clipped to the logo shape */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(100deg, transparent 42%, rgba(0,0,0,.45) 50%, transparent 58%) 0 0 / 250% 100% no-repeat",
                WebkitMask:
                  "url(/assets/ctine-logo.svg) center / contain no-repeat",
                mask: "url(/assets/ctine-logo.svg) center / contain no-repeat",
                // Enters fully off the left, exits fully off the right (logo is plain
                // white at both ends of the loop); same clock as the bar
                backgroundPositionX: "calc(105% - var(--p) * 110%)",
              }}
            />
          </div>
          <div
            className="flex flex-col items-center"
            style={{ position: "absolute", top: "100%", left: 0, right: 0 }}
          >
            <div
              aria-hidden
              style={{
                marginTop: 28,
                width: "55%",
                height: 2,
                background: "rgba(255,255,255,.12)",
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <div
                style={{
                  width: "40%",
                  height: "100%",
                  background: "#fff",
                  borderRadius: 2,
                  // 165px track, 66px segment: travels from -66px to 165px
                  transform: "translateX(calc(var(--p) * 231px - 66px))",
                }}
              />
            </div>
            <div
              style={{
                marginTop: 16,
                color: "rgba(255,255,255,.55)",
                fontSize: "0.75rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                animation: "ctine-pulse 1.8s ease-in-out infinite",
              }}
            >
              Preparing experience
            </div>
          </div>
        </div>
      </div>
      {children}
    </ReadyContext.Provider>
  );
};
