import { css } from '../../styled-system/css';
import { StudyRecord } from '../types/study-record';

import StudyRecordCard from './StudyRecordCard';
import EmptyState from './ui/EmptyState';
import ErrorMessage from './ui/ErrorMessage';
import LoadingSpinner from './ui/LoadingSpinner';

interface StudyRecordListProps {
  records: StudyRecord[];
  loading?: boolean;
  error?: string | null;
  onDelete?: (_id: string) => Promise<void>;
}

export default function StudyRecordList({ records, loading = false, error = null, onDelete }: StudyRecordListProps) {
  if (loading) {
    return <LoadingSpinner text="学習記録を読み込み中..." />;
  }

  if (error) {
    const errorMessage = error === 'Supabaseが設定されていません'
      ? 'Supabaseの設定が必要です。詳細はSUPABASE_SETUP.mdを参照してください。'
      : error;

    const actions = (
      <>
        <button
          onClick={() => window.location.reload()}
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
          再読み込み
        </button>
        {error === 'Supabaseが設定されていません' && (
          <button
            onClick={() => window.open('/SUPABASE_SETUP.md', '_blank')}
            className={css({
              px: '4',
              py: '2',
              bg: 'yellow.600',
              color: 'white',
              rounded: 'md',
              fontSize: 'sm',
              fontWeight: 'medium',
              _hover: {
                bg: 'yellow.700'
              }
            })}
          >
            設定手順を見る
          </button>
        )}
      </>
    );

    return (
      <ErrorMessage
        title="データの取得に問題があります"
        message={errorMessage}
        type="warning"
        actions={actions}
      />
    );
  }
  if (records.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="まだ学習記録がありません"
        description="左側のフォームから最初の学習記録を投稿してみましょう。日々の学習を記録することで、成長を振り返ることができます。"
      />
    );
  }

  return (
    <div className={css({
      display: 'grid',
      gridTemplateColumns: {
        base: '1fr',
        md: 'repeat(2, 1fr)',
        xl: 'repeat(2, 1fr)'
      },
      gap: '6',
      alignItems: 'start'
    })}>
      {records.map((_record) => (
        <StudyRecordCard key={_record.id} record={_record} onDelete={onDelete} />
      ))}
    </div>
  );
}
