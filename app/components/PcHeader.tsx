"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import { supabase } from "../../lib/supabase";
import { css } from "../../styled-system/css";
import { useAuth } from "../hooks/useAuth";

interface UserProfile {
  user_id: string;
  username?: string;
  full_name?: string;
  icon_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export default function PcHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const isActive = (path: string) => pathname === path;

  // console.log("PcHeaderが表示されています");

  const fetchProfile = useCallback(async () => {
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
  }, [user]);

  // ユーザープロフィールを取得
  useEffect(() => {
    if (user && supabase) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  // アバターURLを取得する関数
  const getAvatarUrl = () => {
    return profile?.icon_url || undefined;
  };

  // 表示名を取得する関数
  const getDisplayName = () => {
    // 1. カスタムユーザー名（user_profiles.username）を優先
    if (profile?.username) {
      return profile.username;
    }
    // 2. フルネーム（user_profiles.full_name）をフォールバック
    if (profile?.full_name) {
      return profile.full_name;
    }
    // 3. OAuthユーザー名（user_metadata.username）をフォールバック
    if (user?.user_metadata?.username) {
      return user.user_metadata.username;
    }
    // 4. OAuthフルネーム（user_metadata.full_name）をフォールバック
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    // 5. メールアドレスをフォールバック
    return user?.email || 'ユーザー';
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
          <Image src="/choiben.webp" alt="ロゴ" width={40} height={40} className={css({ w: "10", h: "10" })} priority />
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
              <Link href="/" style={{
                color: isActive("/") ? "#1d4ed8" : "#1e3a8a",
                borderBottom: isActive("/") ? "2px solid #3D8D7A" : "none",
                paddingBottom: "4px",
                textDecoration: "none",
                transition: "all 0.2s"
              }}>🏠 ダッシュボード</Link>
            </li>
            <li style={{ display: "inline-block" }}>
              <Link href="/farm" style={{
                color: isActive("/farm") ? "#1d4ed8" : "#1e3a8a",
                borderBottom: isActive("/farm") ? "2px solid #3D8D7A" : "none",
                paddingBottom: "4px",
                textDecoration: "none",
                transition: "all 0.2s"
              }}>🌱 ちょい勉ファーム</Link>
            </li>
          <li style={{ display: "inline-block" }}>

          </li>
          <li style={{ display: "inline-block" }}>
            <Link href="/timeline" style={{
              color: isActive("/timeline") ? "#1d4ed8" : "#1e3a8a",
              borderBottom: isActive("/timeline") ? "2px solid #3D8D7A" : "none",
              paddingBottom: "4px",
              textDecoration: "none",
              transition: "all 0.2s"
            }}>📱 ちょい勉タイムライン</Link>
          </li>
        </ul>
        {user && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
            {/* ユーザーアイコン */}
            <Link href="/profile" className={css({
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
                {getAvatarUrl() ? (
                  <Image
                    src={getAvatarUrl()!}
                    alt="アバター"
                    width={40}
                    height={40}
                    priority
                    className={css({
                      w: "full",
                      h: "full",
                      objectFit: "cover"
                    })}
                  />
                ) : (
                  getAvatarInitial()
                )}
              </div>
              <span className={css({
                fontSize: "sm",
                fontWeight: "medium",
                display: { base: "none", md: "block" }
              })}>
                {getDisplayName()}
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
