'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { css } from '../../styled-system/css';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading: authLoading, signInWithEmail, signInWithProvider } = useAuth();

  // ユーザーが既にログインしている場合はトップページにリダイレクト
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
      }
    } catch {
      setError('認証中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderAuth = async (provider: 'google' | 'github' | 'twitter') => {
    setLoading(true);
    setError('');

    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch {
      setError('認証中にエラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <div className={css({
      minH: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bg: 'primary.50',
      px: '4'
    })}>
      <div className={css({
        w: 'full',
        maxW: 'sm',
        bg: 'white',
        rounded: 'lg',
        shadow: 'lg',
        p: '8'
      })}>
        <div className={css({
          textAlign: 'center',
          mb: '8'
        })}>
          <h1 className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: 'primary.700',
            mb: '2'
          })}>
            ChoibenAssist
          </h1>
          <p className={css({
            fontSize: 'sm',
            color: 'gray.600'
          })}>
            学習管理アプリにログイン
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className={css({
          spaceY: '4',
          mb: '6'
        })}>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              autoComplete="email"
              className={css({
                w: 'full',
                px: '3',
                py: '2',
                border: '1px solid',
                borderColor: 'gray.300',
                rounded: 'md',
                fontSize: 'sm',
                _focus: {
                  outline: 'none',
                  borderColor: 'primary.500',
                  ring: '1px',
                  ringColor: 'primary.500'
                }
              })}
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              autoComplete="current-password"
              className={css({
                w: 'full',
                px: '3',
                py: '2',
                border: '1px solid',
                borderColor: 'gray.300',
                rounded: 'md',
                fontSize: 'sm',
                _focus: {
                  outline: 'none',
                  borderColor: 'primary.500',
                  ring: '1px',
                  ringColor: 'primary.500'
                }
              })}
            />
          </div>

          {error && (
            <div className={css({
              p: '2',
              bg: 'red.50',
              border: '1px solid',
              borderColor: 'red.200',
              rounded: 'md',
              color: 'red.700',
              fontSize: 'xs'
            })}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={css({
              w: 'full',
              py: '2',
              px: '4',
              bg: 'primary.600',
              color: 'white',
              rounded: 'md',
              fontSize: 'sm',
              fontWeight: 'medium',
              _hover: { bg: 'primary.700' },
              _disabled: {
                opacity: '0.5',
                cursor: 'not-allowed'
              }
            })}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className={css({
          borderTop: '1px solid',
          borderColor: 'gray.200',
          pt: '6'
        })}>
          <div className={css({
            spaceY: '3'
          })}>
            <button
              onClick={() => handleProviderAuth('google')}
              disabled={loading}
              className={css({
                w: 'full',
                py: '2',
                px: '4',
                bg: 'white',
                border: '1px solid',
                borderColor: 'gray.300',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'gray.700',
                _hover: { bg: 'gray.50' },
                _disabled: {
                  opacity: '0.5',
                  cursor: 'not-allowed'
                }
              })}
            >
              Googleでログイン
            </button>

            <button
              onClick={() => handleProviderAuth('github')}
              disabled={loading}
              className={css({
                w: 'full',
                py: '2',
                px: '4',
                bg: 'gray.900',
                color: 'white',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                _hover: { bg: 'gray.800' },
                _disabled: {
                  opacity: '0.5',
                  cursor: 'not-allowed'
                }
              })}
            >
              GitHubでログイン
            </button>

            <button
              onClick={() => handleProviderAuth('twitter')}
              disabled={loading}
              className={css({
                w: 'full',
                py: '2',
                px: '4',
                bg: 'blue.500',
                color: 'white',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                _hover: { bg: 'blue.600' },
                _disabled: {
                  opacity: '0.5',
                  cursor: 'not-allowed'
                }
              })}
            >
              X (Twitter)でログイン
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
