import { css } from '../../styled-system/css';
import { StudyRecord } from '../types/study-record';

interface StudyRecordCardProps {
  record: StudyRecord;
}

export default function StudyRecordCard({ record }: StudyRecordCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '今日';
    } else if (diffDays === 2) {
      return '昨日';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}日前`;
    } else {
      return new Intl.DateTimeFormat('ja-JP', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      '数学': { bg: 'blue.100', text: 'blue.700' },
      '英語': { bg: 'green.100', text: 'green.700' },
      '国語': { bg: 'red.100', text: 'red.700' },
      '理科': { bg: 'purple.100', text: 'purple.700' },
      '社会': { bg: 'orange.100', text: 'orange.700' },
      'プログラミング': { bg: 'indigo.100', text: 'indigo.700' },
    };
    
    return colors[subject as keyof typeof colors] || { bg: 'gray.100', text: 'gray.700' };
  };

  const subjectColor = getSubjectColor(record.subject);

  return (
    <div className={css({
      bg: 'white',
      rounded: '2xl',
      shadow: 'sm',
      border: '1px solid',
      borderColor: 'gray.100',
      p: '6',
      transition: 'all 0.2s ease-in-out',
      _hover: {
        shadow: 'lg',
        transform: 'translateY(-2px)',
        borderColor: 'gray.200'
      },
      position: 'relative',
      overflow: 'hidden'
    })}>
      {/* Top accent line */}
      <div className={css({
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '3px',
        bg: 'gradient-to-r',
        bgGradient: 'from-blue.500 to-purple.600'
      })} />
      
      <div className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4'
      })}>
        {/* Header */}
        <div className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '3'
        })}>
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '3',
            flex: '1'
          })}>
            <span className={css({
              px: '3',
              py: '1',
              rounded: 'full',
              fontSize: 'xs',
              fontWeight: '600',
              bg: subjectColor.bg,
              color: subjectColor.text
            })}>
              {record.subject}
            </span>
            <span className={css({
              fontSize: 'xs',
              color: 'gray.500',
              fontWeight: '500'
            })}>
              {formatDate(record.createdAt)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className={css({
          fontSize: 'lg',
          fontWeight: 'bold', 
          color: 'gray.900',
          lineHeight: 'tight'
        })}>
          {record.title}
        </h3>
        
        {/* Content */}
        <p className={css({
          fontSize: 'sm',
          color: 'gray.600',
          lineHeight: 'relaxed',
          whiteSpace: 'pre-wrap'
        })}>
          {record.content}
        </p>

        {/* Footer */}
        <div className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: '3',
          borderTop: '1px solid',
          borderColor: 'gray.100'
        })}>
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2'
          })}>
            <span className={css({
              fontSize: 'xs',
              color: 'gray.400'
            })}>
              📚
            </span>
            <span className={css({
              fontSize: 'xs',
              color: 'gray.500'
            })}>
              学習記録
            </span>
          </div>
          
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '1'
          })}>
            <div className={css({
              w: '2',
              h: '2',
              bg: 'green.400',
              rounded: 'full'
            })} />
            <span className={css({
              fontSize: 'xs',
              color: 'gray.500'
            })}>
              完了
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 