"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { useLang } from "../context/LangContext";
import { translations } from "../lib/translations";

const inter = Inter({
  weight: ["400", "500", "600", "700"], // Include multiple weights
});

interface Section {
  id: string;
  title: string;
  subtitle: string;
  subtitleSize: string;
  buttonText: string | null;
  showLogo: boolean;
  image: string | null;
  height?: string;
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { lang } = useLang();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      const progress =
        scrollHeight > 0 ? (currentScrollY / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate opacity based on scroll position
  const vh = 800; // Approximate viewport height for transitions
  const currentSection = Math.floor(scrollY / vh);
  const progressInSection = (scrollY % vh) / vh;

  const overlayOpacity = Math.min(0.6, scrollY / 500);
  const scrollIndicatorOpacity = Math.max(0, 1 - scrollY / 100);

  // Define sections - easy to add/remove/modify
  const sections: Section[] = [
    {
      id: "hero",
      title: translations[lang].hero.title,
      subtitle: translations[lang].hero.subtitle,
      subtitleSize: "text-sm",
      buttonText: translations[lang].hero.buttonText,
      showLogo: true,
      image: null,
      height: "h-dvh",
    },
    {
      id: "about",
      title: translations[lang].about.title,
      subtitle: translations[lang].about.subtitle,
      subtitleSize: "text-xl",
      buttonText: translations[lang].about.buttonText,
      showLogo: false,
      image: "/assets/bottle.png",
    },
    {
      id: "sustainability",
      title: translations[lang].science.title,
      subtitle: translations[lang].science.subtitle,
      subtitleSize: "text-lg",
      buttonText: translations[lang].science.buttonText,
      showLogo: false,
      image: "/assets/molecule_creatine.png",
    },
    {
      id: "sustainability-2",
      title: translations[lang].why.title,
      subtitle: translations[lang].why.subtitle,
      subtitleSize: "text-lg",
      buttonText: translations[lang].why.buttonText,
      showLogo: false,
      image: "/assets/cap.png",
    },
    {
      id: "sustainability-3",
      title: translations[lang].story.title,
      subtitle: translations[lang].story.subtitle,
      subtitleSize: "text-base",
      buttonText: translations[lang].story.buttonText,
      showLogo: false,
      image: "/assets/profile.png",
    },
    {
      id: "join",
      title: translations[lang].join.title,
      subtitle: translations[lang].join.subtitle,
      subtitleSize: "text-lg",
      buttonText: translations[lang].join.buttonText,
      showLogo: false,
      image: null,
      height: "h-dvh",
    },
  ];

  return (
    <div className={`relative ${inter.className}`}>
      {/* Fixed Background Images */}
      <div className="fixed inset-0 z-0" style={{ height: '100dvh' }}>
        {sections.map((section, idx) => {
          // Last slide gets black background only
          if (idx === sections.length - 1) {
            return (
              <div
                key={section.id}
                className="absolute inset-0 bg-gray-900 film-grain"
                style={{
                  opacity:
                    idx === currentSection
                      ? 1 - progressInSection
                      : idx === currentSection + 1 &&
                        idx === sections.length - 1
                      ? progressInSection
                      : 0,
                }}
              />
            );
          }
          // Alternate between image 1 and image 2
          const imgSrc =
            idx % 2 === 0 ? "/assets/img_1.jpg" : "/assets/img_2.png";
          return (
            <div
              key={section.id}
              className="absolute inset-0 film-grain"
              style={{
                opacity:
                  idx === currentSection
                    ? 1 - progressInSection
                    : idx === currentSection + 1
                    ? progressInSection
                    : 0,
              }}
            >
              <Image
                src={imgSrc}
                alt={`Background for ${section.id}`}
                fill
                className={
                  imgSrc === "/assets/img_1.jpg"
                    ? "object-cover object-[center_10%]"
                    : "object-cover scale-110 -scale-x-100 object-center"
                }
                priority
              />
            </div>
          );
        })}
        {/* Dark Overlay for Text Sections */}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {/* Scrollable Content */}
      <div className="relative flex-col z-10">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`${section.height} flex items-center justify-center ${
              section.id === "hero" ? "hero" : ""
            } py-36`}
          >
            {section.image ? (
              // Two-column layout for sections with images
              <div
                className={`grid grid-cols-1 md:grid-cols-2 ${
                  section.id === "about" ? "md:grid-cols-[1fr,200px,200px]" : ""
                } items-center w-full max-w-6xl px-0`}
              >
                {/* Left: Text */}
                <div className="text-center md:text-left text-white max-w-2xl mb-0 md:mb-0 flex flex-col justify-center h-full">
                  {section.title && (
                    <h1 className="text-3xl md:text-5xl font-semibold mb-4 ">
                      {section.title}
                    </h1>
                  )}
                  {section.subtitle && (
                    <>
                      <div
                        className={`${section.subtitleSize} mb-6 whitespace-pre-line`}
                      >
                        {section.subtitle}
                      </div>

                      {section.id === "about" &&
                        section.image === "/assets/bottle.png" && (
                          <div className="md:hidden relative w-full flex flex-col items-center mb-8">
                            <Image
                              src={section.image}
                              alt="CTINE Bottle"
                              width={220}
                              height={400}
                              className={`object-contain drop-shadow-lg w-full max-w-[180px] sm:max-w-[220px]`}
                            />
                          </div>
                        )}
                      {section.id === "about" &&
                        section.image === "/assets/bottle.png" && (
                          <>
                            <div className="grid mt-8 grid-cols-1 sm:grid-cols-3 w-full items-start justify-center gap-8 mb-8">
                              <div className="flex flex-col w-full">
                                <div className="text-left text-white text-sm font-semibold leading-tight mb-1">
                                  {
                                    translations[lang].about.features.creatine
                                      .title
                                  }
                                </div>
                                <div className="border-t border-white w-full mb-2" />
                                <div className="text-left text-white text-xs font-normal">
                                  {
                                    translations[lang].about.features.creatine
                                      .desc
                                  }
                                </div>
                              </div>
                              <div className="flex flex-col w-full">
                                <div className="text-left text-white text-sm font-semibold leading-tight mb-1 lg:whitespace-nowrap">
                                  {
                                    translations[lang].about.features
                                      .electrolytes.title
                                  }
                                </div>
                                <div className="border-t border-white w-full mb-2" />
                                <div className="text-left text-white text-xs font-normal">
                                  {
                                    translations[lang].about.features
                                      .electrolytes.desc
                                  }
                                </div>
                              </div>
                              <div className="flex flex-col w-full">
                                <div className="text-left text-white text-sm font-semibold leading-tight mb-1">
                                  {
                                    translations[lang].about.features.sugar
                                      .title
                                  }
                                </div>
                                <div className="border-t border-white w-full mb-2" />
                                <div className="text-left text-white text-xs font-normal">
                                  {translations[lang].about.features.sugar.desc}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                    </>
                  )}
                  {section.buttonText &&
                    (section.id === "join" ? (
                      <>
                        <a
                          href="mailto:hello@ctinedrinks.com"
                          className="bg-white text-black px-6 py-3 rounded-full text-base font-light hover:bg-gray-200 transition-colors inline-block"
                        >
                          {section.buttonText}
                        </a>
                        <div className="mt-2 text-white text-sm">
                          {translations[lang].email}
                        </div>
                      </>
                    ) : (
                      <button className="bg-white text-black px-6 py-3 rounded-full text-base font-light hover:bg-gray-200 transition-colors">
                        {section.buttonText}
                      </button>
                    ))}
                </div>
                {/* Middle: Bottle Image + Top/Middle Annotations */}
                <div
                  className={` ${
                    section.id === "about" ? "hidden md:flex" : "flex"
                  } flex-shrink-0 h-full relative ${
                    section.id === "about"
                      ? "items-start justify-center"
                      : "justify-center items-center"
                  }`}
                >
                  <div className="relative w-full max-w-lg md:max-w-sm flex flex-col items-center ">
                    <img
                      src={section.image}
                      alt={
                        section.id === "sustainability"
                          ? "ATP Molecule"
                          : "CTINE Bottle"
                      }
                      className={`object-contain drop-shadow-lg w-full 
                        ${
                          section.id === "about"
                            ? "max-w-[180px] sm:max-w-[220px] md:max-w-[260px] lg:max-w-sm"
                            : ""
                        }
                        ${
                          section.id === "sustainability"
                            ? "filter brightness-0 invert"
                            : ""
                        }
                      `}
                    />
                  </div>
                </div>
                {/* Right: Third Column for Last Annotation (only for 'about' section) */}
                {section.id === "about" &&
                  section.image === "/assets/bottle.png" &&
                  null}
              </div>
            ) : (
              // Single column layout for sections without images
              <div className="text-center text-white max-w-4xl px-0">
                {section.showLogo && (
                  <div className="flex flex-col items-center justify-center mb-8 w-full">
                    <img
                      src="/ctine-logo.svg"
                      alt="CTINE Logo"
                      className="w-[300px] mb-8"
                    />
                    {/* Scroll CTA */}
                    <div
                      className="mt-4 flex flex-col items-center text-white transition-opacity duration-500 ease-out"
                      style={{ opacity: scrollIndicatorOpacity }}
                    >
                      <span className="text-sm font-light mb-2">
                        {translations[lang].scrollCta}
                      </span>
                      <div className="scroll-cta">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="opacity-70"
                        >
                          <path
                            d="M12 5V19M5 12L12 19L19 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                {section.title && (
                  <h1
                    className={`font-light mb-4 ${
                      section.showLogo
                        ? "text-5xl md:text-7xl mb-6"
                        : "text-3xl md:text-5xl"
                    }`}
                  >
                    {section.title}
                  </h1>
                )}
                {section.subtitle && (
                  <p
                    className={`font-light ${section.subtitleSize} ${
                      section.showLogo ? "mb-8" : "mb-6"
                    }`}
                  >
                    {section.subtitle}
                  </p>
                )}
                {section.buttonText &&
                  (section.id === "join" ? (
                    <>
                      <div className="flex flex-col items-center">
                        <a
                          href="mailto:hello@ctinedrinks.com"
                          className={`bg-white text-black rounded-full font-light hover:bg-gray-200 transition-colors ${
                            section.showLogo
                              ? "px-8 py-4 text-lg"
                              : "px-6 py-3 text-base"
                          } inline-block`}
                        >
                          {section.buttonText}
                        </a>
                        <p className="mt-8 text-gray-500 text-sm cursor-pointer">
                          {translations[lang].email}
                        </p>
                      </div>
                    </>
                  ) : (
                    <button
                      className={`bg-white text-black rounded-full font-light hover:bg-gray-200 transition-colors ${
                        section.showLogo
                          ? "px-8 py-4 text-lg"
                          : "px-6 py-3 text-base"
                      }`}
                    >
                      {section.buttonText}
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scroll Progress Indicator */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-white/20 z-50">
        <div
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </div>
  );
}
