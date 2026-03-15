"use client";

import { useLang } from "../context/LangContext";
import { translations } from "../lib/translations";

export const WaitlistBadge = ({
  onOpenModal,
  isLarge,
}: {
  onOpenModal: () => void;
  isLarge?: boolean;
}) => {
  const { lang } = useLang();

  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <div
        className={`text-white/80 font-light border border-white/20 inline-flex items-center justify-center gap-2 rounded-full backdrop-blur-sm bg-black/20 ${isLarge ? "px-8 py-4 text-lg" : "px-6 py-3 text-base"}`}
      >
        <div className="bg-white/20 rounded-full p-0.5 flex items-center justify-center shrink-0">
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
        <span>{translations[lang].onWaitlist}</span>
      </div>
      <button
        onClick={onOpenModal}
        className="text-xs text-white/50 hover:text-white transition-colors underline underline-offset-4"
      >
        {translations[lang].joinAnother}
      </button>
    </div>
  );
};
