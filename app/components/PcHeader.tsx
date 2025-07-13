"use client";
import { css } from "../../styled-system/css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { buttonStyles, layoutStyles } from "../styles/components";

export default function PcHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isActive = (path: string) => pathname === path;

  console.log("PcHeaderが表示されています");

  return (
    <header className={css({
      bg: "white",
      borderBottom: "1px solid",
      borderColor: "gray.200",
      position: "sticky",
      top: 0,
      zIndex: 50,
      w: "full",
    })}>
      <nav className={css({
        maxW: "7xl",
        mx: "auto",
        px: { base: "4", md: "8" },
        py: { base: "2", md: "3" },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pr: { base: "6", md: "12" }
      })}>
        <Link href="/" className={css({ display: "flex", alignItems: "center", gap: "2", textDecoration: "none" })}>
          <Image src="/logo.svg" alt="ロゴ" width={40} height={40} className={css({ w: "10", h: "10" })} priority />
          <span className={css({
            fontSize: { base: "xl", md: "2xl" },
            fontWeight: "extrabold",
            color: "#3D8D7A",
            letterSpacing: "wide",
            ml: "2",
            textShadow: "0 1px 4px rgba(61,141,122,0.10)",
          })}>ちょい勉アシスト</span>
        </Link>
        <ul style={{ 
          display: "flex", 
          flexDirection: "row", 
          flexWrap: "nowrap",
          gap: "32px", 
          listStyle: "none", 
          alignItems: "center", 
          fontWeight: "bold", 
          color: "#1e3a8a", 
          fontSize: "16px", 
          margin: 0, 
          padding: 0,
          justifyContent: "center",
          flex: 1,
          minWidth: 0,
          overflow: "hidden"
        }}>
          <li style={{ display: "inline-block" }}>
            <Link href="/studyList" style={{ 
              color: isActive("/studyList") ? "#1d4ed8" : "#1e3a8a", 
              borderBottom: isActive("/studyList") ? "2px solid #3D8D7A" : "none", 
              paddingBottom: "4px", 
              textDecoration: "none",
              transition: "all 0.2s"
            }}>学習記録一覧</Link>
          </li>
          <li style={{ display: "inline-block" }}>
            <Link href="/post" style={{ 
              color: isActive("/post") ? "#1d4ed8" : "#1e3a8a", 
              borderBottom: isActive("/post") ? "2px solid #3D8D7A" : "none", 
              paddingBottom: "4px", 
              textDecoration: "none",
              transition: "all 0.2s"
            }}>新規投稿</Link>
          </li>
        </ul>
        {user && (
          <div style={{ marginLeft: "auto" }}>
            <Link href="/logout" className={buttonStyles.outline}>ログアウト</Link>
          </div>
        )}
      </nav>
    </header>
  );
} 