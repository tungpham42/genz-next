import type { Metadata } from "next";
// Import the font from Google via Next.js
import { Lexend_Deca } from "next/font/google";
import "./globals.css";
import AntdStyledProvider from "@/components/AntdStyledProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Script from "next/script";

// Configure the font
const lexend = Lexend_Deca({
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-lexend", // Optional: creates a CSS variable
});

export const metadata: Metadata = {
  title: "Từ điển Gen Z | Z-Lingo",
  description: "Cập nhật ngôn ngữ hệ tư tưởng mới",
  openGraph: {
    title: "Từ điển Gen Z | Z-Lingo",
    description: "Cập nhật ngôn ngữ hệ tư tưởng mới",
    images: [
      {
        url: "https://genz.soft.io.vn/og-dictionary.png",
        width: 1200,
        height: 630,
        alt: "Z-Lingo Dictionary Open Graph Image",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3585118770961536`}
          crossOrigin="anonymous"
        />
      </head>
      <body className={lexend.className}>
        <AntdStyledProvider>{children}</AntdStyledProvider>
        <GoogleAnalytics ga_id="G-HHXZSNQ65X" />
      </body>
    </html>
  );
}
