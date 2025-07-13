'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '../../styled-system/css';
import StudyRecordList from '../components/StudyRecordList';
import { useStudyRecords } from '../hooks/useStudyRecords';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function StudyListPage() {
  const { user, loading: authLoading } = useAuth();
  const { records, loading: recordsLoading, error, deleteRecord } = useStudyRecords();
  const router = useRouter();

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
      maxW: '7xl',
      mx: 'auto',
      px: '6',
      py: '8'
    })}>
      <div className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: '6'
      })}>
        <h2 className={css({
          fontSize: '2xl',
          fontWeight: 'bold',
          color: 'gray.900'
        })}>
          学習記録一覧
        </h2>
        <div className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2'
        })}>
          <span className={css({
            fontSize: 'sm',
            color: 'gray.500'
          })}>
            最新順
          </span>
        </div>
      </div>
      <StudyRecordList records={records} loading={recordsLoading} error={error} onDelete={deleteRecord} />
    </main>
  );
}
