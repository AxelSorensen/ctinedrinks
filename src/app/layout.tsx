"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LangProvider, useLang } from "../context/LangContext";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="w-full font-bold sm:font-medium absolute flex items-center justify-between"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        padding: "1rem",
        backdropFilter: `blur(${scrolled ? 12 : 0}px)`,
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid rgba(255,255,255,${scrolled ? 0.2 : 0})`,
      }}
    >
      <Link href="/">
        <img
          src="/assets/ctine-logo.svg"
          alt="ctine logo"
          style={{ height: "20px", width: "auto" }}
        />
      </Link>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="cursor-pointer"
          style={{
            color: scrolled ? "#fff" : "#111",
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
            color: scrolled ? "#fff" : "#111",
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
      </div>
    </div>
  );
}

function RootLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { lang } = useLang();

  return (
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
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LangProvider>
      <RootLayoutInner>{children}</RootLayoutInner>
    </LangProvider>
  );
}
