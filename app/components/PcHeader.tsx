"use client";
import { css } from "../../styled-system/css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

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
            color: "#2563eb",
            letterSpacing: "wide",
            ml: "2",
            textShadow: "0 1px 4px rgba(37,99,235,0.10)",
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
              borderBottom: isActive("/studyList") ? "2px solid #2563eb" : "none", 
              paddingBottom: "4px", 
              textDecoration: "none",
              transition: "all 0.2s"
            }}>学習記録一覧</Link>
          </li>
          <li style={{ display: "inline-block" }}>
            <Link href="/post" style={{ 
              color: isActive("/post") ? "#1d4ed8" : "#1e3a8a", 
              borderBottom: isActive("/post") ? "2px solid #2563eb" : "none", 
              paddingBottom: "4px", 
              textDecoration: "none",
              transition: "all 0.2s"
            }}>新規投稿</Link>
          </li>
        </ul>
        {user && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
            {/* ユーザーアイコン */}
            <Link href="/myPage" className={css({
              display: "flex",
              alignItems: "center",
              gap: "2",
              textDecoration: "none",
              color: "gray.700",
              _hover: {
                color: "blue.600"
              }
            })}>
              <div className={css({
                w: "8",
                h: "8",
                rounded: "full",
                bg: "blue.100",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "sm",
                fontWeight: "medium",
                color: "blue.600",
                overflow: "hidden"
              })}>
                {user.user_metadata?.icon_url ? (
                  <img
                    src={user.user_metadata.icon_url}
                    alt="アバター"
                    className={css({
                      w: "full",
                      h: "full",
                      objectFit: "cover"
                    })}
                  />
                ) : (
                  user.user_metadata?.username?.[0] || user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"
                )}
              </div>
                             <span className={css({
                 fontSize: "sm",
                 fontWeight: "medium",
                 display: { base: "none", md: "block" }
               })}>
                 {user.user_metadata?.username || user.user_metadata?.full_name || user.email}
               </span>
            </Link>
            
            {/* ログアウトボタン */}
            <Link href="/logout" className={css({
              color: "red.600",
              textDecoration: "none",
              fontSize: "sm",
              fontWeight: "medium",
              px: "4",
              py: "2",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "red.600",
              transition: "all 0.2s",
              _hover: {
                bg: "red.600",
                color: "white"
              }
            })}>ログアウト</Link>
          </div>
        )}
      </nav>
    </header>
  );
} 