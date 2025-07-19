'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { supabase } from '../../../../lib/supabase';
import { css } from '../../../../styled-system/css';
import ErrorMessage from '../../../components/ui/ErrorMessage';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useAuth } from '../../../hooks/useAuth';
import { StudyRecord, CreateStudyRecord } from '../../../types/study-record';

export default function StudyRecordEditPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const recordId = params.id as string;

  const [record, setRecord] = useState<StudyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateStudyRecord>({
    subject: '',
    duration: 0,
    notes: ''
  });

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
        // 自分の学習記録かチェック
        if (recordData.user_id !== user.id) {
          setError('この学習記録を編集する権限がありません');
          return;
        }

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
        setFormData({
          subject: studyRecord.subject,
          duration: studyRecord.duration,
          notes: studyRecord.notes || ''
        });
      }
    } catch (err) {
      console.error('学習記録取得エラー:', err);
      setError('学習記録の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !record) return;

    try {
      setSaving(true);
      setError('');

      const { error } = await supabase
        .from('study_records')
        .update({
          subject: formData.subject,
          duration: formData.duration,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);

      if (error) throw error;

      // 詳細ページにリダイレクト
      router.push(`/studyList/${record.id}`);
    } catch (err) {
      console.error('更新エラー:', err);
      setError('学習記録の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/studyList/${recordId}`);
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
          onClick={() => router.push(`/studyList/${recordId}`)}
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
          ← 詳細に戻る
        </button>
      </div>

      {/* 編集フォーム */}
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
          bgGradient: 'from-blue.600 to-blue.800'
        })} />

        <div className={css({
          p: '8'
        })}>
          <div className={css({
            mb: '8'
          })}>
            <h1 className={css({
              fontSize: '3xl',
              fontWeight: 'bold',
              color: 'gray.900',
              mb: '2'
            })}>
              学習記録を編集
            </h1>
            <p className={css({
              fontSize: 'lg',
              color: 'gray.600'
            })}>
              学習内容を修正しましょう
            </p>
          </div>

          <form onSubmit={handleSubmit} className={css({
            spaceY: '6'
          })}>
            {/* 科目 */}
            <div>
              <label className={css({
                display: 'block',
                fontSize: 'sm',
                fontWeight: '600',
                color: 'gray.700',
                mb: '2'
              })}>
                科目 *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
                className={css({
                  w: 'full',
                  px: '4',
                  py: '3',
                  border: '1px solid',
                  borderColor: 'gray.300',
                  rounded: 'lg',
                  fontSize: 'md',
                  _focus: {
                    outline: 'none',
                    ring: '2px',
                    ringColor: 'blue.500',
                    borderColor: 'blue.500'
                  }
                })}
                placeholder="例: 数学、英語、プログラミング"
              />
            </div>

            {/* 学習時間 */}
            <div>
              <label className={css({
                display: 'block',
                fontSize: 'sm',
                fontWeight: '600',
                color: 'gray.700',
                mb: '2'
              })}>
                学習時間（分） *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                required
                min="1"
                max="1440"
                className={css({
                  w: 'full',
                  px: '4',
                  py: '3',
                  border: '1px solid',
                  borderColor: 'gray.300',
                  rounded: 'lg',
                  fontSize: 'md',
                  _focus: {
                    outline: 'none',
                    ring: '2px',
                    ringColor: 'blue.500',
                    borderColor: 'blue.500'
                  }
                })}
                placeholder="例: 60"
              />
            </div>

            {/* 学習内容 */}
            <div>
              <label className={css({
                display: 'block',
                fontSize: 'sm',
                fontWeight: '600',
                color: 'gray.700',
                mb: '2'
              })}>
                学習内容
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={6}
                className={css({
                  w: 'full',
                  px: '4',
                  py: '3',
                  border: '1px solid',
                  borderColor: 'gray.300',
                  rounded: 'lg',
                  fontSize: 'md',
                  resize: 'vertical',
                  _focus: {
                    outline: 'none',
                    ring: '2px',
                    ringColor: 'blue.500',
                    borderColor: 'blue.500'
                  }
                })}
                placeholder="学習した内容や感想を記録しましょう"
              />
            </div>

            {/* ボタン */}
            <div className={css({
              display: 'flex',
              gap: '4',
              pt: '6',
              borderTop: '1px solid',
              borderColor: 'gray.200'
            })}>
              <button
                type="button"
                onClick={handleCancel}
                className={css({
                  px: '6',
                  py: '3',
                  bg: 'gray.100',
                  color: 'gray.700',
                  rounded: 'lg',
                  fontSize: 'md',
                  fontWeight: 'medium',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: 'gray.200'
                  }
                })}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={saving || !formData.subject || formData.duration <= 0}
                className={css({
                  px: '6',
                  py: '3',
                  bg: 'blue.600',
                  color: 'white',
                  rounded: 'lg',
                  fontSize: 'md',
                  fontWeight: 'medium',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: {
                    bg: 'blue.700'
                  },
                  _disabled: {
                    opacity: '0.5',
                    cursor: 'not-allowed'
                  }
                })}
              >
                {saving ? '更新中...' : '更新する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
