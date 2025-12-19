import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "응급실 위치 정보 서비스",
  description: "Emergency Room Information Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=63a8f0bcdb302fee441d3905192eb69d&libraries=services,clusterer&autoload=false" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
