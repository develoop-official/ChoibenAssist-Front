'use client';

import { css } from '../../styled-system/css';
import StudyRecordForm from '../components/StudyRecordForm';
import { useStudyRecords } from '../hooks/useStudyRecords';
import { CreateStudyRecord } from '../types/study-record';
import { useRouter } from 'next/navigation';

export default function PostPage() {
  const { addRecord } = useStudyRecords();
  const router = useRouter();

  const handleSubmit = (newRecord: CreateStudyRecord) => {
    addRecord(newRecord);
    router.push('/');
  };

  return (
    <main className={css({
      maxW: '7xl',
      mx: 'auto',
      px: '6',
      py: '8',
      minH: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    })}>
      <div className={css({ w: { base: 'full', md: '500px' } })}>
        <StudyRecordForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
} 