'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode, useEffect } from "react";

import "./globals.css";
import { css } from "../styled-system/css";
import { supabase } from "../lib/supabase";

import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    // グローバルエラーハンドラーを設定
    const handleGlobalError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || event.message || '';
      
      // リフレッシュトークンエラーをチェック
      if (errorMessage.includes('Invalid Refresh Token') || 
          errorMessage.includes('Refresh Token Not Found') ||
          errorMessage.includes('JWT expired')) {
        
        console.warn('グローバルエラーハンドラーでリフレッシュトークンエラーを検出しました');
        
        // ローカルストレージをクリア
        localStorage.clear();
        sessionStorage.clear();
        
        // Supabaseのセッションをクリア
        if (supabase) {
          supabase.auth.signOut();
        }
        
        // ログインページにリダイレクト
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    };

    // エラーハンドラーを登録
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => {
      const errorMessage = event.reason?.message || event.reason || '';
      if (errorMessage.includes('Invalid Refresh Token') || 
          errorMessage.includes('Refresh Token Not Found') ||
          errorMessage.includes('JWT expired')) {
        handleGlobalError({ error: { message: errorMessage }, message: errorMessage } as ErrorEvent);
      }
    });

    // クリーンアップ
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ちょい勉アシスト - 日々の学習をちょっとずつ、しっかり記録</title>
        <meta name="description" content="学習記録アプリで日々の成長を振り返ろう" />
      </head>
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
