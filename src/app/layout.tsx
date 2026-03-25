import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TRIPLY - AI Travel Recommendation",
  description: "AI-powered personalized travel planner",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-gray-100 flex justify-center min-h-screen">
        <div className="w-full max-w-[480px] bg-white min-h-screen relative shadow-2xl flex flex-col overflow-x-hidden">
          <main className="flex-1 pb-16">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
