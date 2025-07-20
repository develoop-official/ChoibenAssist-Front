// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";

import "./globals.css";
import { css } from "../styled-system/css";

import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ちょい勉アシスト - 日々の学習をちょっとずつ、しっかり記録",
  description: "学習記録アプリで日々の成長を振り返ろう",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body 
        className={css({
          fontFamily: "var(--font-geist-sans)",
          bg: "primary.50",
          minH: "100vh",
          display: "flex",
          flexDirection: "column"
        })}
        suppressHydrationWarning={true}
      >
        <Header />

        <main className={css({
          flex: "1",
          container: "7xl",
          mx: "auto",
          px: { base: "4", md: "8" },
          py: "8"
        })}>
          {children}
        </main>

        <footer className={css({
          bg: "white",
          borderTop: "1px solid",
          borderColor: "gray.200",
          py: "6"
        })}>
          <div className={css({
            container: "7xl",
            mx: "auto",
            px: { base: "4", md: "8" },
            textAlign: "center"
          })}>
            <p className={css({
              fontSize: "sm",
              color: "gray.600"
            })}>
              © 2025 ちょい勉アシスト. 学習の記録で成長を加速させよう。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
