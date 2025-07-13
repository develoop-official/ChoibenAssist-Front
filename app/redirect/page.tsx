'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '../../styled-system/css';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function RedirectPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLからセッション情報を取得
        if (!supabase) {
          setError('認証サービスが利用できません');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError('認証エラーが発生しました');
          setLoading(false);
          return;
        }

        if (data.session) {
          // 認証成功時はstudyListにリダイレクト
          router.push('/studyList');
        } else {
          // セッションがない場合はログインページにリダイレクト
          router.push('/');
        }
      } catch (err) {
        setError('リダイレクト処理中にエラーが発生しました');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (loading) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.50'
      })}>
        <LoadingSpinner text="認証処理中..." />
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