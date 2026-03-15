"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { useLang } from "../context/LangContext";
import { translations } from "../lib/translations";
import { WaitlistBadge } from "../components/WaitlistBadge";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { addEmailToWaitlist } from "../lib/waitlistFunctions";
import Head from "next/head";
import { useModal } from "../context/ModalContext";

const firebaseConfig = {
  apiKey: "AIzaSyABwAB6QuG12q3CAfihuiDc29y-IBUHZ_M",
  authDomain: "ctine-drinks.firebaseapp.com",
  projectId: "ctine-drinks",
  storageBucket: "ctine-drinks.firebasestorage.app",
  messagingSenderId: "151318308173",
  appId: "1:151318308173:web:9719dbaa398bd33d0a8304",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  const [isJoined, setIsJoined] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [email, setEmail] = useState("");
  const { lang } = useLang();
  const {
    isModalOpen,
    setIsModalOpen,
    showEmailModal,
    setShowEmailModal,
    hasJoined,
    setHasJoined,
  } = useModal();

  useEffect(() => {
    if (
      typeof document !== "undefined" &&
      document.cookie.includes("ctinewaitlist=true")
    ) {
      setAlreadyJoined(true);
      setHasJoined(true);
    }
  }, []);

  const getButtonPosition = (): "top" | "bottom" => {
    if (typeof window === "undefined") return "bottom";

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;

    // If scrolled to the very top (within 100px)
    if (scrollY < 100) {
      return "top";
    }

    // If scrolled to the very bottom (within 100px of bottom)
    if (scrollY + windowHeight > documentHeight - 100) {
      return "bottom";
    }

    // Default to bottom if in middle
    return "bottom";
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedEmail = sanitizeEmail(email);

    if (!validateEmail(sanitizedEmail)) {
      alert(translations[lang].invalidEmail);
      return;
    }

    const position = getButtonPosition();
    setIsJoining(true);
    const success = await addEmailToWaitlist(sanitizedEmail, position);
    setIsJoining(false);

    if (success) {
      setIsJoined(true);
      setEmail("");
      setShowEmailModal(false);
      setIsModalOpen(true);
      document.cookie = "ctinewaitlist=true; path=/; max-age=31536000";
      setAlreadyJoined(true);
      setHasJoined(true);
    }
  };

  const validateEmail = (email: string): boolean => {
    // Trim whitespace and convert to lowercase
    const trimmedEmail = email.trim().toLowerCase();

    // Basic email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check length (reasonable email length)
    if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
      return false;
    }

    // Check for basic email format
    if (!emailRegex.test(trimmedEmail)) {
      return false;
    }

    // Additional checks for common injection patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\(/i,
      /alert\(/i,
      /document\./i,
      /window\./i,
      /location\./i,
      /cookie/i,
      /localStorage/i,
      /sessionStorage/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmedEmail)) {
        return false;
      }
    }

    return true;
  };

  const sanitizeEmail = (email: string): string => {
    // Trim whitespace and convert to lowercase
    return email.trim().toLowerCase();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const overlayOpacity = Math.min(0.9, scrollY / 500);
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
      height: "h-svh",
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
      height: "h-svh",
    },
  ];

  return (
    <>
      <Head>
        <title>CTINE Drinks - Revolutionizing Sports Hydration</title>
        <meta
          name="description"
          content="Discover CTINE, the world's first sports drink infused with 5 grams of 100% creatine monohydrate. Stay hydrated and energized with zero sugar and essential electrolytes."
        />
        <meta
          name="keywords"
          content="CTINE, sports drink, creatine, hydration, electrolytes, zero sugar"
        />
        <meta name="author" content="CTINE" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          property="og:title"
          content="CTINE Drinks - Revolutionizing Sports Hydration"
        />
        <meta
          property="og:description"
          content="Discover CTINE, the world's first sports drink infused with 5 grams of 100% creatine monohydrate. Stay hydrated and energized with zero sugar and essential electrolytes."
        />
        <meta property="og:image" content="/assets/ctine-og-image.png" />
        <meta
          property="og:image:alt"
          content="CTINE Sports Drink - Revolutionizing Sports Hydration"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://www.ctinedrinks.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/assets/ctine-og-image.png" />
        <meta
          name="twitter:image:alt"
          content="CTINE Sports Drink - Revolutionizing Sports Hydration"
        />
        <link rel="icon" href="/assets/c-favicon.ico" />{" "}
        {/* Added c-favicon as the browser tab logo */}
      </Head>
      <div
        className={`relative ${inter.className}`}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* Fixed Background Images */}
        <div className="fixed inset-0 z-0 h-screen">
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
            className="absolute inset-0 bg-black pointer-events-none"
            style={{ opacity: overlayOpacity }}
          />
        </div>

        {/* Scrollable Content */}
        <div className="relative flex-col z-10">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`${section.height} flex items-center justify-center ${
                section.id === "hero" ? "hero h-screen py-36" : "py-36"
              }`}
            >
              {section.image ? (
                // Two-column layout for sections with images
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 ${
                    section.id === "about"
                      ? "md:grid-cols-[1fr,200px,200px]"
                      : ""
                  } items-center w-full max-w-6xl px-0`}
                >
                  {/* Left: Text */}
                  <div
                    className={`text-center ${lang === "ar" ? "md:text-right" : "md:text-left"} text-white max-w-2xl mb-0 md:mb-0 flex flex-col justify-center h-full`}
                  >
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
                                width={180} // Reduced from 220
                                height={320} // Reduced from 400
                                className={`object-contain drop-shadow-lg max-h-120`} // Reduced max-width values
                              />
                            </div>
                          )}
                        {section.id === "about" &&
                          section.image === "/assets/bottle.png" && (
                            <>
                              <div className="grid mt-8 grid-cols-1 sm:grid-cols-3 w-full items-start justify-center gap-8 mb-8">
                                <div className="flex flex-col w-full">
                                  <div
                                    className={`${lang === "ar" ? "text-right" : "text-left"} text-white text-sm font-semibold leading-tight mb-1`}
                                  >
                                    {
                                      translations[lang].about.features.creatine
                                        .title
                                    }
                                  </div>
                                  <div className="border-t border-white w-full mb-2" />
                                  <div
                                    className={`${lang === "ar" ? "text-right" : "text-left"} text-white text-xs font-normal`}
                                  >
                                    {
                                      translations[lang].about.features.creatine
                                        .desc
                                    }
                                  </div>
                                </div>
                                <div className="flex flex-col w-full">
                                  <div
                                    className={`${lang === "ar" ? "text-right" : "text-left"} text-white text-sm font-semibold leading-tight mb-1 lg:whitespace-nowrap`}
                                  >
                                    {
                                      translations[lang].about.features
                                        .electrolytes.title
                                    }
                                  </div>
                                  <div className="border-t border-white w-full mb-2" />
                                  <div
                                    className={`${lang === "ar" ? "text-right" : "text-left"} text-white text-xs font-normal`}
                                  >
                                    {
                                      translations[lang].about.features
                                        .electrolytes.desc
                                    }
                                  </div>
                                </div>
                                <div className="flex flex-col w-full">
                                  <div
                                    className={`${lang === "ar" ? "text-right" : "text-left"} text-white text-sm font-semibold leading-tight mb-1`}
                                  >
                                    {
                                      translations[lang].about.features.sugar
                                        .title
                                    }
                                  </div>
                                  <div className="border-t border-white w-full mb-2" />
                                  <div
                                    className={`${lang === "ar" ? "text-right" : "text-left"} text-white text-xs font-normal`}
                                  >
                                    {
                                      translations[lang].about.features.sugar
                                        .desc
                                    }
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                      </>
                    )}
                    {section.buttonText &&
                      (section.id === "join" ? (
                        <div className="flex flex-col items-center gap-6">
                          {alreadyJoined ? (
                            <WaitlistBadge
                              onOpenModal={() => setShowEmailModal(true)}
                            />
                          ) : (
                            <button
                              onClick={() => setShowEmailModal(true)}
                              className="bg-white text-black px-6 py-3 rounded-full text-base font-light cursor-pointer hover:bg-gray-200 transition-colors inline-block"
                            >
                              {translations[lang].joinWaitlist}
                            </button>
                          )}
                          <div className="flex flex-col items-center mt-4">
                            <p className="text-white/70 text-sm mb-3">
                              {translations[lang].orGetInTouch}
                            </p>
                            <a
                              href="mailto:hello@ctinedrinks.com"
                              className={
                                alreadyJoined
                                  ? "bg-white text-black px-6 py-3 rounded-full text-base font-light hover:bg-gray-200 transition-colors inline-block"
                                  : "bg-transparent border border-white/50 text-white px-6 py-3 rounded-full text-base font-light hover:bg-white/10 transition-colors inline-block"
                              }
                            >
                              {section.buttonText}
                            </a>
                          </div>
                        </div>
                      ) : alreadyJoined ? (
                        <div className="flex flex-col items-center gap-2 mt-2">
                          <div
                            className={`text-white/80 font-light border border-white/20 flex items-center justify-center gap-2 rounded-full inline-block backdrop-blur-sm bg-black/20 ${
                              section.showLogo
                                ? "px-8 py-4 text-lg"
                                : "px-6 py-3 text-base"
                            }`}
                          >
                            <div className="bg-white/20 rounded-full p-0.5 flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            {translations[lang].onWaitlist}
                          </div>
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs text-white/50 hover:text-white transition-colors underline underline-offset-4"
                          >
                            {translations[lang].joinAnother}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsModalOpen(true)}
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
                        className={`object-contain drop-shadow-lg w-full ${
                          section.id === "about"
                            ? "max-h-150" // Reduced max-width values
                            : ""
                        } ${
                          section.id === "sustainability"
                            ? "filter brightness-0 invert"
                            : ""
                        }`}
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

                      {alreadyJoined ? (
                        <WaitlistBadge
                          onOpenModal={() => setShowEmailModal(true)}
                        />
                      ) : (
                        <button
                          onClick={() => setShowEmailModal(true)}
                          className="bg-white text-black px-6 py-3 rounded-full text-base font-medium hover:bg-gray-200 cursor-pointer transition-colors mb-8 inline-block"
                        >
                          {translations[lang].joinWaitlist}
                        </button>
                      )}
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
                      <div className="flex flex-col items-center gap-8">
                        {alreadyJoined ? (
                          <WaitlistBadge
                            onOpenModal={() => setShowEmailModal(true)}
                            isLarge={section.showLogo}
                          />
                        ) : (
                          <button
                            onClick={() => setShowEmailModal(true)}
                            className={`bg-white text-black rounded-full font-light hover:bg-gray-200 transition-colors cursor-pointer ${
                              section.showLogo
                                ? "px-8 py-4 text-lg"
                                : "px-6 py-3 text-base"
                            }`}
                          >
                            {translations[lang].joinWaitlist}
                          </button>
                        )}

                        <div className="flex flex-col items-center pt-16 px-10 border-t border-white/10 w-full max-w-sm">
                          <p className="text-white/50 text-sm mb-4">
                            {translations[lang].haveQuestions}
                          </p>
                          <a
                            href="mailto:hello@ctinedrinks.com"
                            className={
                              alreadyJoined
                                ? `bg-white text-black rounded-full font-light hover:bg-gray-200 transition-colors ${
                                    section.showLogo
                                      ? "px-8 py-4 text-lg"
                                      : "px-6 py-3 text-base"
                                  } inline-block`
                                : `bg-transparent border border-white/50 text-white rounded-full font-light hover:bg-white/10 transition-colors ${
                                    section.showLogo
                                      ? "px-8 py-4 text-lg"
                                      : "px-6 py-3 text-base"
                                  } inline-block`
                            }
                          >
                            {section.buttonText}
                          </a>
                          <p className="mt-6 text-gray-500 text-sm cursor-pointer">
                            {translations[lang].email}
                          </p>
                        </div>
                      </div>
                    ) : alreadyJoined ? (
                      <div className="flex flex-col items-center gap-3 mt-4">
                        <div
                          className={`text-white/80 font-light border border-white/20 flex items-center justify-center gap-2 rounded-full inline-block backdrop-blur-sm bg-black/20 ${
                            section.showLogo
                              ? "px-8 py-4 text-lg"
                              : "px-6 py-3 text-base"
                          }`}
                        >
                          <div className="bg-white/20 rounded-full p-0.5 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          {translations[lang].onWaitlist}
                        </div>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="text-sm text-white/50 hover:text-white transition-colors underline underline-offset-4"
                        >
                          {translations[lang].joinAnother}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsModalOpen(true)}
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

        {/* Global Scroll CTA */}
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white mix-blend-difference transition-opacity duration-500 ease-out z-[90] pointer-events-none"
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

        {/* Scroll Progress Indicator */}
        <div className="fixed bottom-0 left-0 w-full h-1 bg-white/20 z-50">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Waitlist Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-black border border-gray-600 rounded-2xl p-8 max-w-md w-full shadow-2xl relative film-grain"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div className="text-center py-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {translations[lang].modalTitle}
                </h2>
                <p className="text-gray-400 font-light mb-8">
                  {translations[lang].modalMessage}
                </p>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsJoined(false);
                  }}
                  className="bg-white text-black font-medium px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors w-full"
                >
                  {translations[lang].modalClose}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Input Modal */}
        {showEmailModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={() => setShowEmailModal(false)}
          >
            <div
              className="bg-black border border-gray-600 rounded-2xl p-8 max-w-md w-full shadow-2xl relative film-grain"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowEmailModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <div className="text-center py-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {translations[lang].emailModalTitle}
                </h2>
                <p className="text-gray-400 font-light mb-8">
                  {translations[lang].emailModalDescription}
                </p>
                <form onSubmit={handleJoinSubmit} className="w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    placeholder={translations[lang].emailPlaceholder}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white mb-4 relative z-10"
                    required
                    maxLength={254}
                    autoComplete="email"
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isJoining}
                    className="bg-white text-black font-medium px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors w-full disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isJoining && (
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    )}
                    {isJoining
                      ? translations[lang].joiningText
                      : translations[lang].joinWaitlist}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
