import { useState, useEffect } from 'react';
import { css } from '../../styled-system/css';
import { StudyRecord } from '../types/study-record';
import { cardStyles, buttonStyles } from '../styles/components';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  user_id: string;
  username?: string;
  full_name?: string;
  icon_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

interface StudyRecordCardProps {
  record: StudyRecord;
  onDelete?: (id: string) => Promise<void>;
}

export default function StudyRecordCard({ record, onDelete }: StudyRecordCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onDelete || !confirm('この学習記録を削除しますか？')) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete(record.id);
    } catch (error) {
      console.error('削除に失敗しました:', error);
      alert('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

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
    // 科目名からハッシュ値を生成して色を決定
    const hash = subject.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // ハッシュ値から色のインデックスを決定
    const colorIndex = Math.abs(hash) % 6;
    
    // 色のパレット（6色）
    const colorPalette = [
      { bg: 'blue.100', text: 'blue.700' },
      { bg: 'green.100', text: 'green.700' },
      { bg: 'purple.100', text: 'purple.700' },
      { bg: 'orange.100', text: 'orange.700' },
      { bg: 'pink.100', text: 'pink.700' },
      { bg: 'teal.100', text: 'teal.700' }
    ];
    
    return colorPalette[colorIndex];
  };

  const subjectColor = getSubjectColor(record.subject);

  // 投稿者のプロフィール情報を取得
  useEffect(() => {
    if (record.user_id && supabase) {
      fetchAuthorProfile();
    }
  }, [record.user_id]);

  const fetchAuthorProfile = async () => {
    if (!supabase || !record.user_id) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', record.user_id)
        .single();

      if (!error && data) {
        setAuthorProfile(data);
      }
    } catch (err) {
      console.error('投稿者プロフィール取得エラー:', err);
    }
  };

  // 投稿者の表示名を取得
  const getAuthorDisplayName = () => {
    if (authorProfile?.username) {
      return authorProfile.username;
    }
    if (authorProfile?.full_name) {
      return authorProfile.full_name;
    }
    if (record.user_name) {
      return record.user_name;
    }
    if (record.user_email) {
      return record.user_email;
    }
    return '不明なユーザー';
  };

  // 投稿者のアバターURLを取得
  const getAuthorAvatarUrl = () => {
    if (authorProfile?.icon_url) {
      return authorProfile.icon_url;
    }
    return null;
  };

  // 投稿者のアバター初期文字を取得
  const getAuthorAvatarInitial = () => {
    const avatarUrl = getAuthorAvatarUrl();
    if (avatarUrl) return '';

    const displayName = getAuthorDisplayName();
    if (displayName && displayName !== '不明なユーザー') {
      return displayName[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className={css({
      position: 'relative'
    })}>
      <Link href={`/studyList/${record.id}`} className={css({
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        _hover: {
          transform: 'translateY(-2px)',
          transition: 'transform 0.2s ease-in-out'
        }
      })}>
        <div className={cardStyles.base}>
          {/* Top accent line */}
          <div className={css({
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '3px',
            bg: 'gradient-to-r',
            bgGradient: 'from-primary.600 to-primary.800'
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
                flexDirection: 'column',
                gap: '2',
                flex: '1'
              })}>
                <div className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3'
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
                
                {/* 投稿者情報 */}
                <div className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2'
                })}>
                  <div className={css({
                    w: '4',
                    h: '4',
                    rounded: 'full',
                    bg: 'blue.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'xs',
                    fontWeight: 'medium',
                    color: 'blue.600',
                    overflow: 'hidden'
                  })}>
                    {getAuthorAvatarUrl() ? (
                      <img
                        src={getAuthorAvatarUrl()!}
                        alt="投稿者アバター"
                        className={css({
                          w: 'full',
                          h: 'full',
                          objectFit: 'cover'
                        })}
                      />
                    ) : (
                      getAuthorAvatarInitial()
                    )}
                  </div>
                  <span className={css({
                    fontSize: 'xs',
                    color: 'gray.600',
                    fontWeight: '500'
                  })}>
                    {getAuthorDisplayName()}
                  </span>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2'
            })}>
              <span className={css({
                fontSize: 'sm',
                color: 'gray.400'
              })}>
                ⏱️
              </span>
              <span className={css({
                fontSize: 'lg',
                fontWeight: 'bold',
                color: 'primary.700'
              })}>
                {record.duration}分
              </span>
            </div>
            
            {/* Notes */}
            {record.notes && (
              <p className={css({
                fontSize: 'sm',
                color: 'gray.600',
                lineHeight: 'relaxed',
                whiteSpace: 'pre-wrap',
                bg: 'gray.50',
                p: '3',
                rounded: 'md',
                border: '1px solid',
                borderColor: 'gray.200'
              })}>
                {record.notes}
              </p>
            )}

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
                gap: '3'
              })}>
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
        </div>
      </Link>
      
      {/* 削除ボタン - Linkの外に配置 */}
      {onDelete && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={css({
            position: 'absolute',
            top: '2',
            right: '2',
            px: '2',
            py: '1',
            bg: 'red.50',
            color: 'red.600',
            rounded: 'md',
            fontSize: 'xs',
            fontWeight: 'medium',
            border: '1px solid',
            borderColor: 'red.200',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: '10',
            _hover: {
              bg: 'red.100',
              borderColor: 'red.300'
            },
            _disabled: {
              opacity: '0.5',
              cursor: 'not-allowed'
            }
          })}
        >
          {deleting ? '削除中...' : '削除'}
        </button>
      )}
    </div>
  );
} 