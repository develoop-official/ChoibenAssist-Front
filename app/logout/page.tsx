'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { css } from '../../styled-system/css';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

export default function LogoutPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const { error } = await signOut();

        if (error) {
          setError('ログアウト中にエラーが発生しました');
          setLoading(false);
          return;
        }

        // ログアウト成功時はログインページにリダイレクト
        router.push('/');
      } catch (err) {
        setError('ログアウト処理中にエラーが発生しました');
        setLoading(false);
      }
    };

    handleLogout();
  }, [signOut, router]);

  if (loading) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.50'
      })}>
        <LoadingSpinner text="ログアウト処理中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.50',
        px: '4'
      })}>
        <div className={css({
          textAlign: 'center',
          maxW: 'md'
        })}>
          <div className={css({
            p: '6',
            bg: 'red.50',
            border: '1px solid',
            borderColor: 'red.200',
            rounded: 'lg',
            mb: '4'
          })}>
            <p className={css({
              fontSize: 'lg',
              color: 'red.700',
              mb: '4'
            })}>
              {error}
            </p>
            <button
              onClick={() => router.push('/')}
              className={css({
                px: '4',
                py: '2',
                bg: 'blue.600',
                color: 'white',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                _hover: {
                  bg: 'blue.700'
                }
              })}
            >
              ログインページに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
