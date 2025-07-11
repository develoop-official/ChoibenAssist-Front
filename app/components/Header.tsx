'use client';

import { useState } from 'react';
import { css } from '../../styled-system/css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Top Bar */}
      <div className={css({
        bg: 'gray.900',
        color: 'white',
        py: '2',
        px: '6',
        fontSize: 'xs'
      })}>
        <div className={css({
          maxW: '7xl',
          mx: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        })}>
          <span>学習記録で成長を可視化</span>
          <span>Version 1.0</span>
        </div>
      </div>

      {/* Main Header */}
      <header className={css({
        bg: 'white',
        borderBottom: '1px solid',
        borderColor: 'gray.200',
        position: 'sticky',
        top: '0',
        zIndex: '50',
        shadow: 'sm'
      })}>
        <div className={css({
          maxW: '7xl',
          mx: 'auto',
          px: '6'
        })}>
          {/* Header Content */}
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: '4'
          })}>
            {/* Logo Section */}
            <div className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '4'
            })}>
              <div className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3'
              })}>
                <div className={css({
                  w: '12',
                  h: '12',
                  position: 'relative',
                  flexShrink: '0'
                })}>
                  <Image
                    src="/logo.svg"
                    alt="ちょい勉アシスト"
                    width={48}
                    height={48}
                    className={css({
                      w: 'full',
                      h: 'full'
                    })}
                  />
                </div>
                <div>
                  <h1 className={css({
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: 'gray.900',
                    lineHeight: 'tight'
                  })}>
                    ちょい勉アシスト
                  </h1>
                  <p className={css({
                    fontSize: 'sm',
                    color: 'gray.600',
                    mt: '1'
                  })}>
                    日々の学習をちょっとずつ、しっかり記録
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className={css({
              display: { base: 'none', md: 'flex' },
              alignItems: 'center',
              gap: '1'
            })}>
              <Link 
                href="/" 
                onClick={closeMenu}
                className={css({
                  px: '6',
                  py: '3',
                  rounded: 'lg',
                  fontWeight: '600',
                  fontSize: 'sm',
                  color: isActive('/') ? 'blue.700' : 'gray.700',
                  bg: isActive('/') ? 'blue.50' : 'transparent',
                  border: '2px solid',
                  borderColor: isActive('/') ? 'blue.200' : 'transparent',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: isActive('/') ? 'blue.100' : 'gray.50',
                    color: isActive('/') ? 'blue.800' : 'gray.900'
                  }
                })}
              >
                学習記録一覧
              </Link>
              <Link 
                href="/post" 
                onClick={closeMenu}
                className={css({
                  px: '6',
                  py: '3',
                  rounded: 'lg',
                  fontWeight: '600',
                  fontSize: 'sm',
                  color: 'white',
                  bg: isActive('/post') 
                    ? 'gradient-to-r from-purple.600 to-purple.700' 
                    : 'gradient-to-r from-blue.600 to-purple.600',
                  border: '2px solid',
                  borderColor: 'transparent',
                  transition: 'all 0.2s',
                  _hover: {
                    transform: 'translateY(-1px)',
                    shadow: 'lg'
                  },
                  _active: {
                    transform: 'translateY(0)'
                  }
                })}
              >
                新規投稿
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className={css({
                display: { base: 'flex', md: 'none' },
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                w: '10',
                h: '10',
                bg: 'transparent',
                border: 'none',
                cursor: 'pointer',
                p: '2'
              })}
              aria-label="メニューを開く"
            >
              <span className={css({
                w: '6',
                h: '0.5',
                bg: 'gray.700',
                transition: 'all 0.3s',
                transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
              })} />
              <span className={css({
                w: '6',
                h: '0.5',
                bg: 'gray.700',
                mt: '1',
                transition: 'all 0.3s',
                opacity: isMenuOpen ? '0' : '1'
              })} />
              <span className={css({
                w: '6',
                h: '0.5',
                bg: 'gray.700',
                mt: '1',
                transition: 'all 0.3s',
                transform: isMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
              })} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className={css({
            display: { base: isMenuOpen ? 'block' : 'none', md: 'none' },
            borderTop: '1px solid',
            borderColor: 'gray.200',
            py: '4'
          })}>
            <nav className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '2'
            })}>
              <Link 
                href="/" 
                onClick={closeMenu}
                className={css({
                  px: '4',
                  py: '3',
                  rounded: 'lg',
                  fontWeight: '600',
                  fontSize: 'sm',
                  color: isActive('/') ? 'blue.700' : 'gray.700',
                  bg: isActive('/') ? 'blue.50' : 'transparent',
                  border: '2px solid',
                  borderColor: isActive('/') ? 'blue.200' : 'transparent',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: isActive('/') ? 'blue.100' : 'gray.50'
                  }
                })}
              >
                学習記録一覧
              </Link>
              <Link 
                href="/post" 
                onClick={closeMenu}
                className={css({
                  px: '4',
                  py: '3',
                  rounded: 'lg',
                  fontWeight: '600',
                  fontSize: 'sm',
                  color: 'white',
                  bg: isActive('/post') 
                    ? 'gradient-to-r from-purple.600 to-purple.700' 
                    : 'gradient-to-r from-blue.600 to-purple.600',
                  border: '2px solid',
                  borderColor: 'transparent',
                  transition: 'all 0.2s',
                  _hover: {
                    transform: 'translateY(-1px)',
                    shadow: 'lg'
                  }
                })}
              >
                新規投稿
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
} 