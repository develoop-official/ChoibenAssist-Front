import { css } from '../../styled-system/css';
import StudyRecordCard from './StudyRecordCard';
import { StudyRecord } from '../types/study-record';

interface StudyRecordListProps {
  records: StudyRecord[];
}

export default function StudyRecordList({ records }: StudyRecordListProps) {
  if (records.length === 0) {
    return (
      <div className={css({
        textAlign: 'center',
        py: '16',
        px: '6'
      })}>
        <div className={css({
          maxW: 'md',
          mx: 'auto'
        })}>
          <div className={css({
            w: '20',
            h: '20',
            bg: 'gray.50',
            rounded: 'full',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: '6'
          })}>
            <span className={css({
              fontSize: '3xl'
            })}>
              📚
            </span>
          </div>
          
          <h3 className={css({
            fontSize: 'xl',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '3'
          })}>
            まだ学習記録がありません
          </h3>
          
          <p className={css({
            color: 'gray.600',
            mb: '6',
            lineHeight: 'relaxed'
          })}>
            左側のフォームから最初の学習記録を投稿してみましょう。<br />
            日々の学習を記録することで、成長を振り返ることができます。
          </p>
          
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2',
            fontSize: 'sm',
            color: 'gray.500'
          })}>
            <span>✨</span>
            <span>学習の記録を始めよう</span>
            <span>✨</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={css({
      display: 'grid',
      gridTemplateColumns: {
        base: '1fr',
        md: 'repeat(2, 1fr)',
        xl: 'repeat(3, 1fr)'
      },
      gap: '6',
      alignItems: 'start'
    })}>
      {records.map((record) => (
        <StudyRecordCard key={record.id} record={record} />
      ))}
    </div>
  );
} 