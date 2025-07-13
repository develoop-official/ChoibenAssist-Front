"use client";
import { useState } from "react";
import { css } from "../../styled-system/css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const isActive = (path: string) => pathname === path;

  return (
    <header className={css({
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      bg: "blue.500",
      color: "white",
      p: "4",
      boxShadow: "md",
    })}>
      <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between", w: "full" })}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={css({
            w: "10",
            h: "10",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bg: "transparent",
            border: "none",
            cursor: "pointer",
            mr: "2",
          })}
          aria-label="メニューを開く"
        >
          <span className={css({ w: "6", h: "0.5", bg: "white", mb: "1.5", borderRadius: "full", transition: "all 0.3s", transform: open ? "rotate(45deg) translate(5px, 5px)" : "none" })} />
          <span className={css({ w: "6", h: "0.5", bg: "white", mb: "1.5", borderRadius: "full", transition: "all 0.3s", opacity: open ? "0" : "1" })} />
          <span className={css({ w: "6", h: "0.5", bg: "white", borderRadius: "full", transition: "all 0.3s", transform: open ? "rotate(-45deg) translate(7px, -6px)" : "none" })} />
        </button>
        <Link href="/" className={css({ textDecoration: "none", display: "flex", alignItems: "center", gap: "2" })}>
          <Image src="/logo.svg" alt="ロゴ" width={32} height={32} className={css({ w: "8", h: "8" })} priority />
          <span className={css({ fontSize: "xl", fontWeight: "extrabold", color: "#2563eb", letterSpacing: "wide", textShadow: "0 1px 4px rgba(37,99,235,0.10)" })}>ちょい勉アシスト</span>
        </Link>
      </div>
      {/* Drawer風メニュー */}
      {open && (
        <div className={css({
          position: "fixed",
          top: 0,
          left: 0,
          w: "80vw",
          maxW: "320px",
          h: "100vh",
          bg: "white",
          color: "blue.900",
          boxShadow: "xl",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
        })}>
          {/* Xボタン */}
          <div className={css({ display: "flex", justifyContent: "flex-end", p: "4" })}>
            <button onClick={() => setOpen(false)} className={css({ fontSize: "2xl", fontWeight: "bold", color: "blue.900", bg: "transparent", border: "none", cursor: "pointer" })}>&times;</button>
          </div>
          <div className={css({ px: "6", pt: "10", fontWeight: "bold", display: "flex", flexDirection: "column", gap: "6" })}>
            <Link href="/studyList" onClick={() => setOpen(false)} className={css({ mb: "4", color: isActive("/studyList") ? "blue.700" : "blue.900", fontSize: "lg", borderBottom: isActive("/studyList") ? "2px solid #2563eb" : "none", pb: "1", transition: "all 0.2s", _hover: { color: "blue.600" } })}>学習記録一覧</Link>
            <Link href="/post" onClick={() => setOpen(false)} className={css({ mb: "4", color: isActive("/post") ? "blue.700" : "blue.900", fontSize: "lg", borderBottom: isActive("/post") ? "2px solid #2563eb" : "none", pb: "1", transition: "all 0.2s", _hover: { color: "blue.600" } })}>新規投稿</Link>
            {user && (
              <div className={css({ borderTop: "1px solid", borderColor: "gray.200", pt: "4", mt: "4" })}>
                <Link href="/logout" onClick={() => setOpen(false)} className={css({ color: "red.600", fontSize: "lg", transition: "all 0.2s", _hover: { color: "red.700" } })}>ログアウト</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 