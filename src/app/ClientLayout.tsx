"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LangProvider, useLang } from "../context/LangContext";
import { ModalProvider, useModal } from "../context/ModalContext";
import { translations } from "../lib/translations";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function Header() {
  const { lang, setLang } = useLang();
  const {
    isModalOpen,
    setIsModalOpen,
    showEmailModal,
    setShowEmailModal,
    hasJoined,
  } = useModal();
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showWaitlistButton, setShowWaitlistButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setScrolled(currentScrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate blur amount based on scroll position (max 12px)
  const blurAmount = Math.min(scrollY / 10, 12);

  // Interpolate color from dark (#111) to light (#fff) based on scroll
  const interpolateColor = (
    startColor: string,
    endColor: string,
    factor: number,
  ) => {
    const start = parseInt(startColor.slice(1), 16);
    const end = parseInt(endColor.slice(1), 16);

    const r1 = (start >> 16) & 0xff;
    const g1 = (start >> 8) & 0xff;
    const b1 = start & 0xff;

    const r2 = (end >> 16) & 0xff;
    const g2 = (end >> 8) & 0xff;
    const b2 = end & 0xff;

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const buttonColor = interpolateColor(
    "#111",
    "#e5e5e5",
    Math.min(scrollY / 100, 1),
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      setShowWaitlistButton(
        !document.cookie.includes("ctinewaitlist=true") && !hasJoined,
      );
    }
  }, [hasJoined]);

  const vh = 800;
  const joinPassed = scrollY > 0.2 * vh;

  return (
    <div
      className="w-full font-bold sm:font-medium absolute flex items-center justify-between"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        padding: "1rem",
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
      }}
    >
      <Link href="/" style={{ flexShrink: 0 }}>
        <img
          src="/assets/ctine-logo.svg"
          alt="ctine logo"
          style={{ height: "20px", width: "auto", minHeight: "20px" }}
        />
      </Link>
      <div className="flex items-center md:gap-4">
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="cursor-pointer"
          style={{
            color: buttonColor,
            background: "transparent",
            border: "none",
            borderRadius: "6px",
            padding: "0.5rem 1.25rem",

            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          {lang === "en" ? "العربية" : "English"}
        </button>
        <button
          type="button"
          onClick={() => {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
          }}
          className="cursor-pointer"
          style={{
            color: buttonColor,
            background: "transparent",
            border: "none",
            borderRadius: "6px",
            padding: "0.5rem 1.25rem",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          {translations[lang].contact}
        </button>
        {showWaitlistButton && (
          <button
            onClick={() => setShowEmailModal(true)}
            className="cursor-pointer"
            style={{
              color: joinPassed ? "black" : "black",
              background: joinPassed ? "white" : "transparent",
              border: "none",
              borderRadius: joinPassed ? "9999px" : "6px",
              padding: "0.5rem 1.25rem",
              textDecoration: "none",
              fontSize: "0.85rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (joinPassed) {
                e.currentTarget.style.background = "#e5e5e5";
              } else {
                e.currentTarget.style.background = "rgba(0,0,0,0.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = joinPassed
                ? "white"
                : "transparent";
            }}
          >
            <span className="block md:hidden">
              {translations[lang].joinWaitlistShort}
            </span>
            <span className="hidden md:block">
              {translations[lang].joinWaitlist}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lang } = useLang();

  return (
    <ModalProvider>
      <html lang={lang}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
        >
          <Header />
          <div className="px-4" style={{ paddingTop: "72px" }}>
            {children}
          </div>
        </body>
      </html>
    </ModalProvider>
  );
}
