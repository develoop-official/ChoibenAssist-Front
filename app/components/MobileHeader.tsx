"use client";
import { useState, useEffect } from "react";
import { css } from "../../styled-system/css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../../lib/supabase";

interface UserProfile {
  user_id: string;
  username?: string;
  full_name?: string;
  icon_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const isActive = (path: string) => pathname === path;

  // ユーザープロフィールを取得
  useEffect(() => {
    if (user && supabase) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!supabase || !user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
    }
  };

  // アバターURLを取得する関数
  const getAvatarUrl = () => {
    // 1. カスタムアバター（user_profiles.icon_url）を優先
    if (profile?.icon_url) {
      return profile.icon_url;
    }
    // 2. OAuthアバター（user_metadata.avatar_url）をフォールバック
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    return null;
  };

  // アバターの初期文字を取得する関数
  const getAvatarInitial = () => {
    const avatarUrl = getAvatarUrl();
    if (avatarUrl) return null; // アバター画像がある場合は初期文字を表示しない

    // カスタムユーザー名の最初の文字
    if (profile?.username?.[0]) {
      return profile.username[0].toUpperCase();
    }
    // カスタムフルネームの最初の文字
    if (profile?.full_name?.[0]) {
      return profile.full_name[0].toUpperCase();
    }
    // OAuthユーザー名の最初の文字
    if (user?.user_metadata?.username?.[0]) {
      return user.user_metadata.username[0].toUpperCase();
    }
    // OAuthフルネームの最初の文字
    if (user?.user_metadata?.full_name?.[0]) {
      return user.user_metadata.full_name[0].toUpperCase();
    }
    // メールアドレスの最初の文字
    if (user?.email?.[0]) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header className={css({
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      bg: "primary.700",
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
          <span className={css({ fontSize: "xl", fontWeight: "extrabold", color: "#3D8D7A", letterSpacing: "wide", textShadow: "0 1px 4px rgba(61,141,122,0.10)" })}>ちょい勉アシスト</span>
        </Link>
        {user && (
          <Link href="/myPage" className={css({
            w: "8",
            h: "8",
            rounded: "full",
            bg: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "sm",
            fontWeight: "medium",
            color: "blue.600",
            textDecoration: "none",
            overflow: "hidden"
          })}>
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()}
                alt="アバター"
                className={css({
                  w: "full",
                  h: "full",
                  objectFit: "cover"
                })}
              />
            ) : (
              getAvatarInitial()
            )}
          </Link>
        )}
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
          color: "primary.900",
          boxShadow: "xl",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
        })}>
          {/* Xボタン */}
          <div className={css({ display: "flex", justifyContent: "flex-end", p: "4" })}>
            <button onClick={() => setOpen(false)} className={css({ fontSize: "2xl", fontWeight: "bold", color: "primary.900", bg: "transparent", border: "none", cursor: "pointer" })}>&times;</button>
          </div>
          <div className={css({ px: "6", pt: "10", fontWeight: "bold", display: "flex", flexDirection: "column", gap: "6" })}>
            <Link href="/studyList" onClick={() => setOpen(false)} className={css({ mb: "4", color: isActive("/studyList") ? "primary.700" : "primary.900", fontSize: "lg", borderBottom: isActive("/studyList") ? "2px solid #3D8D7A" : "none", pb: "1", transition: "all 0.2s", _hover: { color: "primary.600" } })}>学習記録一覧</Link>
            <Link href="/post" onClick={() => setOpen(false)} className={css({ mb: "4", color: isActive("/post") ? "primary.700" : "primary.900", fontSize: "lg", borderBottom: isActive("/post") ? "2px solid #3D8D7A" : "none", pb: "1", transition: "all 0.2s", _hover: { color: "primary.600" } })}>新規投稿</Link>
            {user && (
              <div className={css({ borderTop: "1px solid", borderColor: "gray.200", pt: "4", mt: "4", display: "flex", flexDirection: "column", gap: "4" })}>
                <Link href="/myPage" onClick={() => setOpen(false)} className={css({ color: "blue.600", fontSize: "lg", transition: "all 0.2s", _hover: { color: "blue.700" } })}>マイページ</Link>
                <Link href="/logout" onClick={() => setOpen(false)} className={css({ color: "red.600", fontSize: "lg", transition: "all 0.2s", _hover: { color: "red.700" } })}>ログアウト</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 