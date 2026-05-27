import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { AppProvider } from "@/components/providers/AppProvider";
import { AmbientBackground } from "@/components/ambient/AmbientBackground";
import { AudioUnlockBanner } from "@/components/audio/AudioUnlockBanner";
import "./globals.css";

const notoSans = Noto_Sans({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "सीखो और बढ़ो | REHAB Learning",
  description:
    "Emotionally safe interactive learning for rehabilitation centres — Hindi-first, facilitator-supported.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#e8a87c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hi"
      className={`${notoSans.variable} ${notoDevanagari.variable} h-full`}
    >
      <body className="min-h-full antialiased font-sans">
        <AppProvider>
          <AmbientBackground />
          <AudioUnlockBanner />
          <main className="relative z-0 flex min-h-screen flex-col">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
