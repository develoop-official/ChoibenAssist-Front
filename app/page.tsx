'use client';

import { css } from '../styled-system/css';
import StudyRecordList from './components/StudyRecordList';
import { useStudyRecords } from './hooks/useStudyRecords';

export default function Home() {
  const { records } = useStudyRecords();

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
      <StudyRecordList records={records} />
    </main>
  );
}
