"use client";
import { useEffect, useState } from "react";

import { useAuth } from "../hooks/useAuth";

import MobileHeader from "./MobileHeader";
import PcHeader from "./PcHeader";

export default function Header() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      const isMobileView = window.matchMedia("(max-width: 1024px)").matches;
      // console.log("画面幅:", window.innerWidth, "px, モバイル判定:", isMobileView);
      setIsMobile(isMobileView);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isClient) return null;

  // ログインしていない場合はヘッダーを表示しない
  if (!user) return null;

  // console.log("現在のコンポーネント:", isMobile ? "MobileHeader" : "PcHeader");
  return isMobile ? <MobileHeader /> : <PcHeader />;
}
