'use client';

import React, { useState } from 'react';

import { css } from '../../styled-system/css';
import {
  ShareData,
  shareWithWebAPI,
  shareOnTwitter,
  shareOnFacebook,
  shareOnLinkedIn,
  shareViaEmail,
  copyToClipboard
} from '../utils/share-utils';

interface ShareButtonProps {
  shareData: ShareData;
  className?: string;
}

export default function ShareButton({ shareData, className }: ShareButtonProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform: string) => {
    try {
      let success = false;

      switch (platform) {
        case 'native':
          success = await shareWithWebAPI(shareData);
          if (success) {
            setShowShareMenu(false);
            return;
          }
          // Web Share APIが利用できない場合は、メニューを表示
          break;
        case 'twitter':
          shareOnTwitter(shareData);
          break;
        case 'facebook':
          shareOnFacebook(shareData);
          break;
        case 'linkedin':
          shareOnLinkedIn(shareData);
          break;
        case 'email':
          shareViaEmail(shareData);
          break;
        case 'copy':
          success = await copyToClipboard(`${shareData.text}\n\n${shareData.url}`);
          if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
          break;
      }

      setShowShareMenu(false);
    } catch (error) {
      console.error('シェアエラー:', error);
    }
  };

  return (
    <div className={css({ position: 'relative' })}>
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className={`${css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          px: '3',
          py: '2',
          rounded: 'lg',
          bg: 'gray.50',
          color: 'gray.600',
          border: '1px solid',
          borderColor: 'gray.200',
          cursor: 'pointer',
          transition: 'all 0.2s',
          _hover: {
            bg: 'gray.100'
          }
        })} ${className || ''}`}
      >
        <span className={css({
          fontSize: 'lg'
        })}>
          🔄
        </span>
        <span className={css({
          fontSize: 'sm',
          fontWeight: 'medium'
        })}>
          シェア
        </span>
      </button>

      {/* シェアメニュー */}
      {showShareMenu && (
        <>
          {/* オーバーレイ */}
          <div
            className={css({
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              zIndex: '40'
            })}
            onClick={() => setShowShareMenu(false)}
          />

          {/* メニュー */}
          <div className={css({
            position: 'absolute',
            top: 'full',
            right: '0',
            mt: '2',
            bg: 'white',
            border: '1px solid',
            borderColor: 'gray.200',
            rounded: 'lg',
            shadow: 'lg',
            zIndex: '50',
            minW: '48',
            py: '2'
          })}>
            {/* ネイティブシェア */}
            <button
              onClick={() => handleShare('native')}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                w: 'full',
                px: '4',
                py: '2',
                textAlign: 'left',
                _hover: { bg: 'gray.50' }
              })}
            >
              <span className={css({ fontSize: 'lg' })}>📱</span>
              <span className={css({ fontSize: 'sm' })}>シェア</span>
            </button>

            {/* Twitter */}
            <button
              onClick={() => handleShare('twitter')}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                w: 'full',
                px: '4',
                py: '2',
                textAlign: 'left',
                _hover: { bg: 'gray.50' }
              })}
            >
              <span className={css({ fontSize: 'lg' })}>🐦</span>
              <span className={css({ fontSize: 'sm' })}>Twitter</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleShare('facebook')}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                w: 'full',
                px: '4',
                py: '2',
                textAlign: 'left',
                _hover: { bg: 'gray.50' }
              })}
            >
              <span className={css({ fontSize: 'lg' })}>📘</span>
              <span className={css({ fontSize: 'sm' })}>Facebook</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => handleShare('linkedin')}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                w: 'full',
                px: '4',
                py: '2',
                textAlign: 'left',
                _hover: { bg: 'gray.50' }
              })}
            >
              <span className={css({ fontSize: 'lg' })}>💼</span>
              <span className={css({ fontSize: 'sm' })}>LinkedIn</span>
            </button>

            {/* メール */}
            <button
              onClick={() => handleShare('email')}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                w: 'full',
                px: '4',
                py: '2',
                textAlign: 'left',
                _hover: { bg: 'gray.50' }
              })}
            >
              <span className={css({ fontSize: 'lg' })}>📧</span>
              <span className={css({ fontSize: 'sm' })}>メール</span>
            </button>

            {/* コピー */}
            <button
              onClick={() => handleShare('copy')}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                w: 'full',
                px: '4',
                py: '2',
                textAlign: 'left',
                _hover: { bg: 'gray.50' }
              })}
            >
              <span className={css({ fontSize: 'lg' })}>📋</span>
              <span className={css({ fontSize: 'sm' })}>
                {copied ? 'コピーしました！' : 'リンクをコピー'}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
