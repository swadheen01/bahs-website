import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SplashScreen from "@/components/home/SplashScreen";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&family=Caveat:wght@600;700&family=Cinzel:wght@700;800;900&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,700&family=Tinos:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Instant check to prevent splash screen flash if already viewed in this session */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(sessionStorage.getItem('bahs_splash_v2')==='true'){document.documentElement.classList.add('splash-hidden');}}catch(e){}})();`,
          }}
        />
        {/* Hidden Google Translate mount point (secondary bonus) */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `window.googleTranslateElementInit = function() { try { new google.translate.TranslateElement({pageLanguage: 'bn', autoDisplay: false}, 'google_translate_element'); } catch(e){} }`,
          }}
        />
        <script
          type="text/javascript"
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          async
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <div id="google_translate_element" style={{ position: "absolute", opacity: 0, pointerEvents: "none", zIndex: -100 }} />
        <SplashScreen />
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

