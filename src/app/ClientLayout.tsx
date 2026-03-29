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

  // Always use white for top bar text
  const buttonColor = "#fff";

  useEffect(() => {
    if (typeof document !== "undefined") {
      setShowWaitlistButton(
        !document.cookie.includes("ctinewaitlist=true") && !hasJoined,
      );
    }
  }, [hasJoined]);

  const vh = 800;
  // Delay join waitlist button turning white to match overlay fade (0.53 * vh)
  const joinPassed = scrollY > 0.53 * vh;

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
              color: joinPassed ? "black" : buttonColor,
              background: joinPassed ? "white" : "transparent",
              border: "none",
              borderRadius: "9999px",
              padding: "0.5rem 1.25rem",
              textDecoration: "none",
              fontSize: "0.85rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (joinPassed) {
                e.currentTarget.style.background = "#e5e5e5";
                e.currentTarget.style.color = "black";
              } else {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = buttonColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = joinPassed
                ? "white"
                : "transparent";
              e.currentTarget.style.color = joinPassed ? "black" : buttonColor;
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
