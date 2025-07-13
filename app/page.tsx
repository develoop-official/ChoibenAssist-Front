'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '../styled-system/css';
import { useAuth } from './hooks/useAuth';
import SupabaseSetupNotice from './components/SupabaseSetupNotice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading: authLoading, error: authError, signInWithEmail, signUpWithEmail, signInWithProvider } = useAuth();

  // ユーザーが既にログインしている場合はstudyListにリダイレクト
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/studyList');
    }
  }, [user, authLoading, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = isSignUp 
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      if (error) {
        setError(error.message);
      } else {
        router.push('/studyList');
      }
    } catch (err) {
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
    } catch (err) {
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
      bg: 'gray.50',
      px: '4'
    })}>
      {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
        <SupabaseSetupNotice />
      )}
      <div className={css({
        w: 'full',
        maxW: 'md',
        bg: 'white',
        rounded: 'lg',
        shadow: 'xl',
        p: '8'
      })}>
        <div className={css({
          textAlign: 'center',
          mb: '8'
        })}>
          <h1 className={css({
            fontSize: '3xl',
            fontWeight: 'bold',
            color: 'blue.600',
            mb: '2'
          })}>
            ChoibenAssist
          </h1>
          <p className={css({
            fontSize: 'lg',
            color: 'gray.600'
          })}>
            {isSignUp ? 'アカウントを作成' : 'ログイン'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className={css({
          spaceY: '4'
        })}>
          <div>
            <label className={css({
              display: 'block',
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.700',
              mb: '2'
            })}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
                  ring: '2px',
                  ringColor: 'blue.500',
                  borderColor: 'blue.500'
                }
              })}
            />
          </div>

          <div>
            <label className={css({
              display: 'block',
              fontSize: 'sm',
              fontWeight: 'medium',
              color: 'gray.700',
              mb: '2'
            })}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
                  ring: '2px',
                  ringColor: 'blue.500',
                  borderColor: 'blue.500'
                }
              })}
            />
          </div>

          {(error || authError) && (
            <div className={css({
              p: '3',
              bg: 'red.50',
              border: '1px solid',
              borderColor: 'red.200',
              rounded: 'md',
              color: 'red.700',
              fontSize: 'sm'
            })}>
              {error || authError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={css({
              w: 'full',
              py: '2',
              px: '4',
              bg: 'blue.600',
              color: 'white',
              rounded: 'md',
              fontSize: 'sm',
              fontWeight: 'medium',
              _hover: {
                bg: 'blue.700'
              },
              _disabled: {
                opacity: '0.5',
                cursor: 'not-allowed'
              }
            })}
          >
            {loading ? '処理中...' : (isSignUp ? 'アカウント作成' : 'ログイン')}
          </button>
        </form>

        <div className={css({
          mt: '6',
          textAlign: 'center'
        })}>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className={css({
              fontSize: 'sm',
              color: 'blue.600',
              _hover: {
                textDecoration: 'underline'
              }
            })}
          >
            {isSignUp ? '既にアカウントをお持ちですか？' : 'アカウントをお持ちでないですか？'}
          </button>
        </div>

        <div className={css({
          mt: '6',
          borderTop: '1px solid',
          borderColor: 'gray.200',
          pt: '6'
        })}>
          <p className={css({
            textAlign: 'center',
            fontSize: 'sm',
            color: 'gray.600',
            mb: '4'
          })}>
            または
          </p>

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
                _hover: {
                  bg: 'gray.50'
                },
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
                _hover: {
                  bg: 'gray.800'
                },
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
                bg: 'blue.400',
                color: 'white',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                _hover: {
                  bg: 'blue.500'
                },
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
