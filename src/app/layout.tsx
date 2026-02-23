import type { Metadata } from "next";
import { Geist, Geist_Mono, Audiowide, Inter, Quicksand } from "next/font/google";
import "./globals.css";
import "../App.css";
import { Providers } from "@/components/Providers";
import Topbar from "@/components/Topbar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const audiowide = Audiowide({
  weight: "400",
  variable: "--font-audiowide",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flower Bloom",
  description: "Premium Flowers & Gifts for every occasion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${audiowide.variable} ${inter.variable} ${quicksand.variable} antialiased`}
      >
        <Providers>
          <header id="header">
            <Topbar />
            <Navbar />
          </header>
          <main id="main">
            {children}
          </main>
          <Footer />
          <ScrollToTopButton />
        </Providers>
      </body>
    </html>
  );
}
