'use client';

import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { supabase } from '../../../lib/supabase';
import { css } from '../../../styled-system/css';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { StudyRecord } from '../../types/study-record';

interface UserProfile {
  user_id: string;
  username?: string;
  full_name?: string;
  icon_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export default function StudyRecordDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;

  const [record, setRecord] = useState<StudyRecord | null>(null);
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && recordId) {
      fetchRecord();
    }
  }, [user, recordId]);

  const fetchRecord = async () => {
    if (!supabase || !user || !recordId) return;

    try {
      setLoading(true);
      setError(null);

      // 学習記録を取得
      const { data: recordData, error: recordError } = await supabase
        .from('study_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (recordError) {
        if (recordError.code === 'PGRST116') {
          setError('学習記録が見つかりません');
        } else {
          setError('学習記録の取得に失敗しました');
        }
        return;
      }

      if (recordData) {
        const studyRecord: StudyRecord = {
          id: recordData.id,
          subject: recordData.subject,
          duration: recordData.duration,
          notes: recordData.notes,
          createdAt: new Date(recordData.created_at),
          updatedAt: new Date(recordData.updated_at),
          user_id: recordData.user_id,
          user_email: recordData.user_email,
          user_name: recordData.user_name
        };
        setRecord(studyRecord);

        // 投稿者のプロフィール情報を取得
        await fetchAuthorProfile(recordData.user_id);
      }
    } catch (err) {
      console.error('学習記録取得エラー:', err);
      setError('学習記録の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorProfile = async (authorId: string) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authorId)
        .single();

      if (!error && data) {
        setAuthorProfile(data);
      }
    } catch (err) {
      console.error('投稿者プロフィール取得エラー:', err);
    }
  };

  const handleDelete = async () => {
    if (!record || !supabase || !confirm('この学習記録を削除しますか？')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('study_records')
        .delete()
        .eq('id', record.id);

      if (error) {
        throw error;
      }

      router.push('/studyList');
    } catch (err) {
      console.error('削除エラー:', err);
      alert('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  // 投稿者の表示名を取得
  const getAuthorDisplayName = () => {
    if (authorProfile?.username) {
      return authorProfile.username;
    }
    if (authorProfile?.full_name) {
      return authorProfile.full_name;
    }
    if (record?.user_name) {
      return record.user_name;
    }
    if (record?.user_email) {
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
    if (avatarUrl) return null;

    const displayName = getAuthorDisplayName();
    if (displayName && displayName !== '不明なユーザー') {
      return displayName[0].toUpperCase();
    }
    return 'U';
  };

  if (authLoading || loading) {
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

  if (error) {
    return (
      <div className={css({
        maxW: '4xl',
        mx: 'auto',
        px: '6',
        py: '8'
      })}>
        <ErrorMessage
          title="エラーが発生しました"
          message={error}
          type="error"
          actions={
            <button
              onClick={() => router.push('/studyList')}
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
              学習記録一覧に戻る
            </button>
          }
        />
      </div>
    );
  }

  if (!record) {
    return (
      <div className={css({
        maxW: '4xl',
        mx: 'auto',
        px: '6',
        py: '8'
      })}>
        <ErrorMessage
          title="学習記録が見つかりません"
          message="指定された学習記録は存在しないか、削除された可能性があります。"
          type="warning"
          actions={
            <button
              onClick={() => router.push('/studyList')}
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
              学習記録一覧に戻る
            </button>
          }
        />
      </div>
    );
  }

  const subjectColor = getSubjectColor(record.subject);

  return (
    <main className={css({
      maxW: '4xl',
      mx: 'auto',
      px: '6',
      py: '8'
    })}>
      {/* ヘッダー */}
      <div className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: '6'
      })}>
        <button
          onClick={() => router.push('/studyList')}
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            px: '3',
            py: '2',
            bg: 'gray.100',
            color: 'gray.700',
            rounded: 'md',
            fontSize: 'sm',
            fontWeight: 'medium',
            _hover: {
              bg: 'gray.200'
            }
          })}
        >
          ← 一覧に戻る
        </button>

        {user.id === record.user_id && (
          <div className={css({
            display: 'flex',
            gap: '3'
          })}>
            <button
              onClick={() => router.push(`/studyList/${record.id}/edit`)}
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
              編集
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={css({
                px: '4',
                py: '2',
                bg: 'red.600',
                color: 'white',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                _hover: {
                  bg: 'red.700'
                },
                _disabled: {
                  opacity: '0.5',
                  cursor: 'not-allowed'
                }
              })}
            >
              {deleting ? '削除中...' : '削除'}
            </button>
          </div>
        )}
      </div>

      {/* 学習記録詳細 */}
      <div className={css({
        bg: 'white',
        rounded: '2xl',
        shadow: 'lg',
        border: '1px solid',
        borderColor: 'gray.100',
        overflow: 'hidden'
      })}>
        {/* トップアクセントライン */}
        <div className={css({
          height: '4px',
          bg: 'gradient-to-r',
          bgGradient: 'from-primary.600 to-primary.800'
        })} />

        <div className={css({
          p: '8'
        })}>
          {/* ヘッダー情報 */}
          <div className={css({
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: '6'
          })}>
            <div className={css({
              flex: '1'
            })}>
              <div className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                mb: '4'
              })}>
                <span className={css({
                  px: '4',
                  py: '2',
                  rounded: 'full',
                  fontSize: 'sm',
                  fontWeight: '600',
                  bg: subjectColor.bg,
                  color: subjectColor.text
                })}>
                  {record.subject}
                </span>
                <span className={css({
                  fontSize: 'sm',
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
                gap: '3',
                mb: '6'
              })}>
                <div className={css({
                  w: '10',
                  h: '10',
                  rounded: 'full',
                  bg: 'blue.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'blue.600',
                  overflow: 'hidden'
                })}>
                  {getAuthorAvatarUrl() ? (
                    <Image
                      src={getAuthorAvatarUrl() || ''}
                      alt="投稿者アバター"
                      width={16}
                      height={16}
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
                <div className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1'
                })}>
                  <span className={css({
                    fontSize: 'lg',
                    fontWeight: '600',
                    color: 'gray.900'
                  })}>
                    {getAuthorDisplayName()}
                  </span>
                  <span className={css({
                    fontSize: 'sm',
                    color: 'gray.500'
                  })}>
                    投稿者
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 学習時間 */}
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '3',
            mb: '6',
            p: '4',
            bg: 'primary.50',
            rounded: 'lg',
            border: '1px solid',
            borderColor: 'primary.200'
          })}>
            <span className={css({
              fontSize: 'xl',
              color: 'primary.600'
            })}>
              ⏱️
            </span>
            <div className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '1'
            })}>
              <span className={css({
                fontSize: '2xl',
                fontWeight: 'bold',
                color: 'primary.700'
              })}>
                {record.duration}分
              </span>
              <span className={css({
                fontSize: 'sm',
                color: 'primary.600'
              })}>
                学習時間
              </span>
            </div>
          </div>

          {/* 学習内容 */}
          {record.notes && (
            <div className={css({
              mb: '6'
            })}>
              <h3 className={css({
                fontSize: 'lg',
                fontWeight: '600',
                color: 'gray.900',
                mb: '3'
              })}>
                学習内容
              </h3>
              <div className={css({
                p: '4',
                bg: 'gray.50',
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'gray.200'
              })}>
                <p className={css({
                  fontSize: 'md',
                  color: 'gray.700',
                  lineHeight: 'relaxed',
                  whiteSpace: 'pre-wrap'
                })}>
                  {record.notes}
                </p>
              </div>
            </div>
          )}

          {/* メタ情報 */}
          <div className={css({
            pt: '6',
            borderTop: '1px solid',
            borderColor: 'gray.200'
          })}>
            <div className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '6',
              fontSize: 'sm',
              color: 'gray.500'
            })}>
              <div className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2'
              })}>
                <span>📅</span>
                <span>作成日: {formatDate(record.createdAt)}</span>
              </div>
              {record.updatedAt.getTime() !== record.createdAt.getTime() && (
                <div className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2'
                })}>
                  <span>✏️</span>
                  <span>更新日: {formatDate(record.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
