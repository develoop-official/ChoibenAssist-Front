"use client";
import { useEffect, useState } from "react";
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

export default function PcHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const isActive = (path: string) => pathname === path;

  console.log("PcHeaderが表示されています");

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
          <li style={{ display: "inline-block" }}>
            <Link href="/studyGraph" style={{ 
              color: isActive("/studyGraph") ? "#1d4ed8" : "#1e3a8a", 
              borderBottom: isActive("/studyGraph") ? "2px solid #3D8D7A" : "none", 
              paddingBottom: "4px", 
              textDecoration: "none",
              transition: "all 0.2s"
            }}>学習グラフ</Link>
          </li>
          <li style={{ display: "inline-block" }}>
            <Link href="/todoList" style={{ 
              color: isActive("/todoList") ? "#1d4ed8" : "#1e3a8a", 
              borderBottom: isActive("/todoList") ? "2px solid #3D8D7A" : "none", 
              paddingBottom: "4px", 
              textDecoration: "none",
              transition: "all 0.2s"
            }}>TODOリスト</Link>
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