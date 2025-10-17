"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate opacity based on scroll position
  const firstImageOpacity = Math.max(0, 1 - scrollY / 300);
  const secondImageOpacity = Math.max(
    0,
    Math.min(1, scrollY / 300, 1 - (scrollY - 400) / 300)
  );
  const thirdImageOpacity = Math.max(0, Math.min(1, (scrollY - 400) / 300));

  // Define sections - easy to add/remove/modify
  const sections = [
    {
      id: "hero",
      title: "",
      subtitle: "",
      buttonText: null,
      showLogo: true,
      image: null,
      height: "h-screen",
    },
    {
      id: "about",
      title: "Premium Quality Drinks",
      subtitle:
        "C-Tine's infusion cap keeps 5 grams of 100% creatine monohydrate sealed in its purest state — until the moment you activate it.\n\nCreatine as you know it - 5g of pure, 100% monohydrate.\n\nRefreshing elderflower zero sugar, no dry scoops, no bad taste, best served cold.\n\nCrafted from premium PET or rPET, Pharma Veral bottles are BPA, BPS, and BPF free, offering food-grade safety, strong chemical resistance, and reliable durability.",
      buttonText: null,
      showLogo: false,
      image: "/assets/ctine-shot.png",
      height: "min-h-screen",
    },
    {
      id: "sustainability",
      title: "Everyday Convenience",
      subtitle:
        "Every thought, lift, and movement runs on one thing - energy.\n\nCreatine is your body's natural power reserve, recycling ATP, the fuel for your muscles and brain.\n\nWhen ATP drops, fatigue hits - but with higher creatine levels, performance lasts longer.\n\nSharper focus. Stronger lifts. Faster recovery.\n\nNot just in the gym, but in everyday life.\n\nEach shot delivers 5 grams of pure creatine, infused with elderflower for instant activation.\n\nNo powders. No measuring. No mess. Just twist, press and go.",
      buttonText: null,
      showLogo: false,
      image: "/assets/Adenosintriphosphat_protoniert.svg.png",
      height: "min-h-screen",
    },
    {
      id: "join",
      title: "Join the Revolution",
      subtitle: "Be part of the next generation of beverage innovation",
      buttonText: "Get Started",
      showLogo: false,
      image: null,
      height: "min-h-screen",
    },
  ];

  return (
    <div className={`relative ${inter.className}`}>
      {/* Fixed Background Images */}
      <div className="fixed inset-0 z-0">
        {/* First Image */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: firstImageOpacity }}
        >
          <Image
            src="/assets/img_1.jpg"
            alt="First fullscreen background"
            fill
            className="object-cover object-[center_10%]"
            priority
          />
        </div>

        {/* Second Image */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: secondImageOpacity }}
        >
          <Image
            src="/assets/img_2.png"
            alt="Second fullscreen background"
            fill
            className="object-cover scale-110 -scale-x-100 object-center"
            priority
          />
        </div>

        {/* Third Image */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: thirdImageOpacity }}
        >
          <Image
            src="/assets/img_2.png"
            alt="Third fullscreen background"
            fill
            className="object-cover scale-125 object-[center_20%]"
            priority
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`${section.height} flex items-center justify-center`}
          >
            {section.image ? (
              // Two-column layout for sections with images
              <div className="flex flex-col md:flex-row items-center md:justify-between w-full max-w-6xl px-8">
                <div className="text-center md:text-left text-white max-w-2xl md:mr-8 mb-8 md:mb-0">
                  {section.title && (
                    <h1 className="text-3xl md:text-5xl font-light mb-4 drop-shadow-lg">
                      {section.title}
                    </h1>
                  )}
                  {section.subtitle && (
                    <div className="text-lg md:text-xl mb-6 drop-shadow-md font-light whitespace-pre-line">
                      {section.subtitle}
                    </div>
                  )}
                  {section.buttonText && (
                    <button className="bg-white text-black px-6 py-3 rounded-full text-base font-light hover:bg-gray-200 transition-colors drop-shadow-lg">
                      {section.buttonText}
                    </button>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <img
                    src={section.image}
                    alt={
                      section.id === "sustainability"
                        ? "ATP Molecule"
                        : "CTINE Bottle"
                    }
                    className={`object-contain drop-shadow-lg w-full max-w-lg md:max-w-sm ${
                      section.id === "sustainability"
                        ? "filter brightness-0 invert"
                        : ""
                    }`}
                  />
                </div>
              </div>
            ) : (
              // Single column layout for sections without images
              <div className="text-center text-white max-w-4xl px-8">
                {section.showLogo && (
                  <div className="mb-8">
                    <img
                      src="/ctine-logo.svg"
                      alt="CTINE Logo"
                      className="w-[300px] mx-auto mb-8"
                    />
                    {/* Scroll CTA */}
                    <div className="flex flex-col items-center text-white/70">
                      <span className="text-sm font-light mb-2">
                        Scroll to explore
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
                    className={`font-light mb-4 drop-shadow-lg ${
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
                    className={`drop-shadow-md font-light ${
                      section.showLogo
                        ? "text-xl md:text-3xl mb-8"
                        : "text-lg md:text-xl mb-6"
                    }`}
                  >
                    {section.subtitle}
                  </p>
                )}
                {section.buttonText && (
                  <button
                    className={`bg-white text-black rounded-full font-light hover:bg-gray-200 transition-colors drop-shadow-lg ${
                      section.showLogo
                        ? "px-8 py-4 text-lg"
                        : "px-6 py-3 text-base"
                    }`}
                  >
                    {section.buttonText}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
