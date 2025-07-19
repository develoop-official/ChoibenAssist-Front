'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '../../styled-system/css';
import { useAuth } from '../hooks/useAuth';
import TimelinePostForm from '../components/TimelinePostForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function PostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handlePostCreated = () => {
    // 投稿後にタイムラインページに移動
    router.push('/timeline');
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      })}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={css({
        minH: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bg: 'gray.50'
      })}>
        <div className={css({
          textAlign: 'center',
          p: '8'
        })}>
          <div className={css({
            w: '16',
            h: '16',
            bg: 'red.100',
            rounded: 'full',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: '4'
          })}>
            <span className={css({
              fontSize: '2xl'
            })}>
              🔒
            </span>
          </div>
          <h2 className={css({
            fontSize: 'xl',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '2'
          })}>
            アクセスが拒否されました
          </h2>
          <p className={css({
            color: 'gray.600',
            mb: '4'
          })}>
            このページにアクセスするにはログインが必要です
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
    );
  }

  return (
    <main className={css({
      maxW: '4xl',
      mx: 'auto',
      px: '6',
      py: '8'
    })}>
      <div className={css({
        mb: '6',
        textAlign: 'center'
      })}>
        <h1 className={css({
          fontSize: '2xl',
          fontWeight: 'bold',
          color: 'gray.900',
          mb: '4'
        })}>
          📝 学習成果を投稿
        </h1>
        <p className={css({
          fontSize: 'lg',
          color: 'primary.600'
        })}>
          学習した内容をタイムラインに投稿して、みんなと共有しましょう
        </p>
      </div>
      
      <TimelinePostForm onPostCreated={handlePostCreated} />
    </main>
  );
} 