import type { Metadata } from "next";
import { LangProvider } from "../context/LangContext";
import { ModalProvider } from "../context/ModalContext";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Ctine Drinks - Make Consistency Possible",
  description: "Welcome to C-Tine. Funcional drinks at a new pace.",
  openGraph: {
    title: "C-Tine Drinks - Make Consistency Possible",
    description: "Welcome to C-Tine. Funcional drinks at a new pace.",
    url: "https://ctinedrinks.com",
    siteName: "C-Tine Drinks",
    images: [
      {
        url: "/assets/ctine-og-image.png",
        width: 1200,
        height: 630,
        alt: "C-Tine Drinks",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "C-Tine Drinks - Make Consistency Possible",
    description: "Welcome to C-Tine. Funcional drinks at a new pace.",
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
