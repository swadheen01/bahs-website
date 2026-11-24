import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/LanguageContext";

// Inter is self-hosted by next/font (no extra request to Google).
const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
  description:
    "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের অফিসিয়াল ওয়েবসাইট। উপজেলাঃ বানিয়াচং, জেলাঃ হবিগঞ্জ। Baniyachong Adarsha High School official website.",
  keywords: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়, BAHS, Baniyachong, Habiganj, School, Bangladesh",
  icons: {
    icon: "/images/logo/logo.png",
    shortcut: "/images/logo/logo.png",
    apple: "/images/logo/logo.png",
  },
  openGraph: {
    title: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
    description: "উপজেলাঃ বানিয়াচং, জেলাঃ হবিগঞ্জ",
    type: "website",
    locale: "bn_BD",
    images: [
      {
        url: "/images/logo/logo.png",
        width: 512,
        height: 512,
        alt: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয় লোগো",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
    description: "উপজেলাঃ বানিয়াচং, জেলাঃ হবিগঞ্জ",
    images: ["/images/logo/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        {/* Preload the main Bengali font so text renders in Kalpurush as early as possible */}
        <link rel="preload" href="/fonts/Kalpurush-v0.258.woff2" as="font" type="font/woff2" crossOrigin="" />
        {/* Instant check to prevent splash screen flash if already viewed in this session */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(sessionStorage.getItem('bahs_splash_v2')==='true'){document.documentElement.classList.add('splash-hidden');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
