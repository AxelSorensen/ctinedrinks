# 🍹 Ctine Drinks

A landing page for the Ctine Drinks brand with a waitlist signup, built to launch ahead of the product itself.

## Features

- 🎬 **Scroll-driven frame animation** — `ScrollFrames` swaps through a sequence of images as the visitor scrolls, giving the page a video-like feel without an actual video file
- ✉️ **Waitlist capture** — an email form writes straight to Firestore via `addEmailToWaitlist`, with a badge component showing signup state
- 🌐 **Bilingual copy** — `LangContext` and `translations.ts` swap all page text between languages without a page reload
- 🪟 **Modal system** — a small `ModalContext` provider drives any in-page modal (e.g. confirming a waitlist signup)

## Installation

```bash
git clone <this repo>
cd ctinedrinks
npm install
```

## Usage

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). `npm run build` / `npm run start` produce and serve a production build; `npm run lint` runs ESLint.

## Built with

- [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/)
- [Firebase](https://firebase.google.com/) (Firestore for the waitlist)
- [Tailwind CSS](https://tailwindcss.com/)

## Status

⚠️ Runs — `pnpm install && npm run build` verified working as of 2026-09-03 (Next.js build completes cleanly, only lint warnings for unused vars and `<img>` usage). Single-page marketing site — functional and deployed, but Firebase config is currently hardcoded in `src/app/page.tsx` rather than pulled from environment variables.
