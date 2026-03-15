import type { Metadata } from "next";
import { LangProvider } from "../context/LangContext";
import { ModalProvider } from "../context/ModalContext";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Ctine Drinks - Premium Beverages",
  description:
    "Discover Ctine Drinks, your source for premium and refreshing beverages. Join our waitlist for exclusive access.",
  openGraph: {
    title: "Ctine Drinks - Premium Beverages",
    description:
      "Discover Ctine Drinks, your source for premium and refreshing beverages. Join our waitlist for exclusive access.",
    url: "https://ctinedrinks.com",
    siteName: "Ctine Drinks",
    images: [
      {
        url: "/assets/ctine-og-image.png",
        width: 1200,
        height: 630,
        alt: "Ctine Drinks",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ctine Drinks - Premium Beverages",
    description:
      "Discover Ctine Drinks, your source for premium and refreshing beverages. Join our waitlist for exclusive access.",
    images: ["/assets/ctine-og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LangProvider>
      <ClientLayout>{children}</ClientLayout>
    </LangProvider>
  );
}
