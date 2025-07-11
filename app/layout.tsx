import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from 'react';
import { css } from '../styled-system/css';
import Header from './components/Header';

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className={css({ bg: 'white' })}>
        <Header />
        {children}
        <footer className={css({
          bg: 'gray.50',
          borderTop: '1px solid',
          borderColor: 'gray.200',
          py: '6',
          px: '6'
        })}>
          <div className={css({
            maxW: '7xl',
            mx: 'auto',
            textAlign: 'center'
          })}>
            <p className={css({
              fontSize: 'sm',
              color: 'gray.600'
            })}>
              © 2024 ちょい勉アシスト. 学習の記録で成長を加速させよう。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
