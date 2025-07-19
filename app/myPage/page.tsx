'use client';

import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import { generateTodo, generateGeneralTodo } from '../actions/todo-actions';
import AiTodoSuggestion from '../components/AiTodoSuggestion';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useTodos } from '../hooks/useTodos';
import { buttonStyles, formStyles } from '../styles/components';
import { CreateTodoItem } from '../types/todo-item';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name?: string;
  icon_url?: string;
  bio?: string;
  scrapbox_project_name?: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  username: string;
  full_name: string;
  icon_url: string;
  bio: string;
  scrapbox_project_name: string;
}

interface TodoSuggestionForm {
  time_available: number;
  recent_progress: string;
  weak_areas: string; // カンマ区切りで入力
  daily_goal: string;
}

interface TodoSuggestionResponse {
  success: boolean;
  content: string;
  response_type: string;
}

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const { addTodos } = useTodos();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    full_name: '',
    icon_url: '',
    bio: '',
    scrapbox_project_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [useScrapbox, setUseScrapbox] = useState<boolean>(false);

  // TODO提案フォーム用の状態
  const [todoSuggestionForm, setTodoSuggestionForm] = useState<TodoSuggestionForm>({
    time_available: 60,
    recent_progress: '',
    weak_areas: '',
    daily_goal: ''
  });
  const [todoSuggestionLoading, setTodoSuggestionLoading] = useState(false);
  const [todoSuggestionResult, setTodoSuggestionResult] = useState<TodoSuggestionResponse | null>(null);
  const [todoSuggestionError, setTodoSuggestionError] = useState('');


  const fetchProfile = useCallback(async () => {
    if (!supabase || !user) {
      // console.log('fetchProfile: Supabaseまたはユーザーが存在しません');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // console.log('プロフィール取得結果:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          // console.log('プロフィールが存在しないため作成します');
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          icon_url: data.icon_url || formData.icon_url || profile?.icon_url || '',
          bio: data.bio || '',
          scrapbox_project_name: data.scrapbox_project_name || ''
        });
      }
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
      setError('プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, formData.icon_url, profile?.icon_url]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchProfile]);

  useEffect(() => {
    if (profile?.scrapbox_project_name) {
      setUseScrapbox(true);
    } else {
      setUseScrapbox(false);
    }
  }, [profile?.scrapbox_project_name]);

  const createProfile = useCallback(async () => {
    if (!supabase || !user) {
      // console.log('プロフィール作成: Supabaseまたはユーザーが存在しません');
      return;
    }

    try {
      // console.log('プロフィール作成開始:', {
      //   userId: user.id,
      //   email: user.email,
      //   metadata: user.user_metadata
      // });

      const profileData = {
        user_id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        full_name: user.user_metadata?.full_name || '',
        icon_url: formData.icon_url || profile?.icon_url || '',
        bio: '',
        scrapbox_project_name: formData.scrapbox_project_name || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // console.log('作成するプロフィールデータ:', profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('プロフィール作成エラー:', error);
        throw error;
      }

      // console.log('プロフィール作成成功:', data);
      setProfile(data);
      setFormData({
        username: data.username || '',
        full_name: data.full_name || '',
        icon_url: data.icon_url || '',
        bio: data.bio || '',
        scrapbox_project_name: data.scrapbox_project_name || ''
      });
    } catch (err) {
      console.error('プロフィール作成エラー:', err);
      // より詳細なエラー情報を表示
      if (err instanceof Error) {
        setError(`プロフィールの作成に失敗しました: ${err.message}`);
      } else {
        setError(`プロフィールの作成に失敗しました: ${JSON.stringify(err)}`);
      }
    }
  }, [user, formData.icon_url, profile?.icon_url, formData.scrapbox_project_name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !formData.username.trim()) {
      setError('ユーザー名は必須です');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const { error } = await supabase!
        .from('user_profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          icon_url: formData.icon_url,
          bio: formData.bio,
          scrapbox_project_name: formData.scrapbox_project_name,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        username: formData.username,
        full_name: formData.full_name,
        icon_url: formData.icon_url,
        bio: formData.bio,
        scrapbox_project_name: formData.scrapbox_project_name,
        updated_at: new Date().toISOString()
      } : null);

      setEditMode(false);
    } catch (err) {
      console.error('プロフィール更新エラー:', err);
      setError('プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        icon_url: profile.icon_url || '',
        bio: profile.bio || '',
        scrapbox_project_name: profile.scrapbox_project_name || ''
      });
    }
    setEditMode(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // デバッグ用ログ
      // console.log('アップロードユーザーID:', user.id);
      // console.log('ファイルパス:', filePath);

      const { error: uploadError } = await supabase!.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase!.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, icon_url: publicUrl }));
    } catch (err) {
      console.error('画像アップロードエラー:', err);
      setError('画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleTodoSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoSuggestionForm.time_available || todoSuggestionForm.time_available < 1 || todoSuggestionForm.time_available > 480) {
      setTodoSuggestionError('勉強時間は1分〜480分の間で指定してください。');
      return;
    }
    try {
      setTodoSuggestionLoading(true);
      setTodoSuggestionError('');
      setTodoSuggestionResult(null);

      let result: TodoSuggestionResponse;

      if (useScrapbox && profile?.scrapbox_project_name) {
        // Scrapbox連携API
        result = await generateTodo(
          profile.scrapbox_project_name,
          todoSuggestionForm.time_available,
          todoSuggestionForm.daily_goal
        );
      } else {
        // 通常AI提案API
        const weakAreasArray = todoSuggestionForm.weak_areas
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        result = await generateGeneralTodo(
          todoSuggestionForm.time_available,
          todoSuggestionForm.recent_progress,
          weakAreasArray,
          todoSuggestionForm.daily_goal
        );
      }
      setTodoSuggestionResult(result);
    } catch (_err) {
      console.error('TODO提案エラー:', _err);
      setTodoSuggestionError('TODO提案の取得に失敗しました。');
    } finally {
      setTodoSuggestionLoading(false);
    }
  };

  const handleAddToTodoList = async (todos: CreateTodoItem[]) => {
    try {
      await addTodos(todos);
      alert('TODOリストに追加しました！');
    } catch (_err) {
      console.error('TODO追加エラー:', _err);
      alert('TODOリストへの追加に失敗しました');
    }
  };

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
        </div>
      </div>
    );
  }

  return (
    <main className={css({
      bg: 'primary.50',
      minH: '100vh',
      py: '8',
      px: '4'
    })}>
      <div className={css({
        maxW: '4xl',
        mx: 'auto'
      })}>
        <h1 className={css({
          fontSize: '3xl',
          fontWeight: 'bold',
          color: 'primary.800',
          mb: '2'
        })}>
          マイページ
        </h1>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <div className={css({
            display: 'flex',
            justifyContent: 'center',
            py: '16'
          })}>
            <LoadingSpinner />
          </div>
        ) : (
          <div className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', lg: '1fr 1fr' },
            gap: '8',
            maxW: '6xl',
            mx: 'auto'
          })}>
            {/* プロフィールセクション */}
            <div>
              {!editMode && profile ? (
                // 非編集時のコンパクト表示
                <div className={css({
                  bg: 'white',
                  borderRadius: 'xl',
                  p: '6',
                  shadow: 'md',
                  border: '1px solid',
                  borderColor: 'primary.100',
                  h: 'fit-content'
                })}>
                  <div className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: '4'
                  })}>
                    <h2 className={css({
                      fontSize: '2xl',
                      fontWeight: 'bold',
                      color: 'primary.800'
                    })}>
                      プロフィール
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className={buttonStyles.secondary}
                    >
                      編集
                    </button>
                  </div>

                  <div className={css({
                    display: 'flex',
                    alignItems: 'start',
                    gap: '6'
                  })}>
                    {/* プロフィール画像 */}
                    <div className={css({
                      w: '20',
                      h: '20',
                      rounded: 'full',
                      overflow: 'hidden',
                      bg: 'primary.50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid',
                      borderColor: 'primary.200',
                      flexShrink: '0'
                    })}>
                      {profile.icon_url ? (
                        <Image
                          src={profile.icon_url}
                          alt="プロフィール画像"
                          width={80}
                          height={80}
                          className={css({
                            w: 'full',
                            h: 'full',
                            objectFit: 'cover'
                          })}
                        />
                      ) : (
                        <span className={css({
                          fontSize: '3xl',
                          color: 'primary.300'
                        })}>
                          👤
                        </span>
                      )}
                    </div>

                    {/* プロフィール情報 */}
                    <div className={css({ flex: '1' })}>
                      <h3 className={css({
                        fontSize: '2xl',
                        fontWeight: 'bold',
                        color: 'gray.900',
                        mb: '2'
                      })}>
                        {profile.username}
                      </h3>

                      {profile.full_name && (
                        <p className={css({
                          fontSize: 'lg',
                          color: 'primary.600',
                          mb: '2'
                        })}>
                          {profile.full_name}
                        </p>
                      )}

                      {profile.bio && (
                        <p className={css({
                          color: 'gray.700',
                          lineHeight: '1.5',
                          mb: '3'
                        })}>
                          {profile.bio}
                        </p>
                      )}

                      <div className={css({
                        display: 'flex',
                        gap: '4',
                        fontSize: 'sm',
                        color: 'gray.500'
                      })}>
                        <span>
                          作成日: {new Date(profile.created_at).toLocaleDateString('ja-JP')}
                        </span>
                        {profile.updated_at && profile.updated_at !== profile.created_at && (
                          <span>
                            更新日: {new Date(profile.updated_at).toLocaleDateString('ja-JP')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 編集時の詳細フォーム表示
                <div className={css({
                  bg: 'white',
                  rounded: '2xl',
                  shadow: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.100',
                  p: '8',
                  h: 'fit-content'
                })}>
                  <div className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: '6',
                    pb: '4',
                    borderBottom: '1px solid',
                    borderBottomColor: 'gray.200'
                  })}>
                    <h2 className={css({
                      fontSize: '2xl',
                      fontWeight: 'bold',
                      color: 'primary.800'
                    })}>
                      プロフィール編集
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* プロフィール画像編集 */}
                    <div className={css({
                      textAlign: 'center',
                      mb: '8'
                    })}>
                      <div className={css({
                        position: 'relative',
                        w: '24',
                        h: '24',
                        mx: 'auto',
                        mb: '4'
                      })}>
                        <div className={css({
                          w: '24',
                          h: '24',
                          rounded: 'full',
                          overflow: 'hidden',
                          bg: 'primary.50',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid',
                          borderColor: 'primary.200'
                        })}>
                          {formData.icon_url ? (
                            <Image
                              src={formData.icon_url}
                              alt="プロフィール画像"
                              width={80}
                              height={80}
                              className={css({
                                w: 'full',
                                h: 'full',
                                objectFit: 'cover'
                              })}
                            />
                          ) : (
                            <span className={css({
                              fontSize: '3xl',
                              color: 'primary.300'
                            })}>
                              👤
                            </span>
                          )}
                        </div>

                        <label className={css({
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          w: '8',
                          h: '8',
                          bg: 'primary.600',
                          color: 'white',
                          rounded: 'full',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: 'sm',
                          border: '2px solid',
                          borderColor: 'white',
                          shadow: 'sm',
                          _hover: {
                            bg: 'primary.700'
                          }
                        })}>
                          📷
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className={css({
                              position: 'absolute',
                              opacity: '0',
                              w: 'full',
                              h: 'full',
                              cursor: 'pointer'
                            })}
                          />
                        </label>
                      </div>

                      {uploading && (
                        <div className={css({
                          color: 'primary.600',
                          fontSize: 'sm',
                          mb: '4'
                        })}>
                          アップロード中...
                        </div>
                      )}

                      <div className={css({
                        spaceY: '2'
                      })}>
                        <label htmlFor="icon_url_input" className={css({
                          display: 'block',
                          fontSize: 'sm',
                          fontWeight: '600',
                          color: 'gray.700'
                        })}>
                          または、画像URLを直接入力
                        </label>
                        <input
                          id="icon_url_input"
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={formData.icon_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, icon_url: e.target.value }))}
                          className={formStyles.input}
                        />
                      </div>
                    </div>

                    {/* フォームフィールド */}
                    <div className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '6',
                      mb: '6'
                    })}>
                      <div>
                        <label htmlFor="username_input" className={css({
                          display: 'block',
                          fontSize: 'sm',
                          fontWeight: '600',
                          color: 'gray.700',
                          mb: '2'
                        })}>
                          ユーザー名 *
                        </label>
                        <input
                          id="username_input"
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          className={formStyles.input}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="full_name_input" className={css({
                          display: 'block',
                          fontSize: 'sm',
                          fontWeight: '600',
                          color: 'gray.700',
                          mb: '2'
                        })}>
                          フルネーム
                        </label>
                        <input
                          id="full_name_input"
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                          className={formStyles.input}
                        />
                      </div>

                      <div>
                        <label className={css({
                          display: 'block',
                          fontSize: 'sm',
                          fontWeight: '600',
                          color: 'gray.700',
                          mb: '2'
                        })}>
                          メールアドレス
                        </label>
                        <div className={css({
                          w: 'full',
                          px: '3',
                          py: '2',
                          bg: 'gray.50',
                          border: '1px solid',
                          borderColor: 'gray.200',
                          rounded: 'md',
                          fontSize: 'sm',
                          color: 'gray.600'
                        })}>
                          {user.email}
                        </div>
                      </div>

                      <div className={css({ gridColumn: 'span 2' })}>
                        <label htmlFor="scrapbox_project_name_input" className={css({
                          display: 'block',
                          fontSize: 'sm',
                          fontWeight: '600',
                          color: 'gray.700',
                          mb: '2'
                        })}>
                          Scrapboxプロジェクト名（任意）
                        </label>
                        <input
                          id="scrapbox_project_name_input"
                          type="text"
                          placeholder="例: my-study-project"
                          value={formData.scrapbox_project_name}
                          onChange={e => setFormData(prev => ({ ...prev, scrapbox_project_name: e.target.value }))}
                          className={formStyles.input}
                        />
                        <div className={css({ fontSize: 'xs', color: 'gray.500', mt: '1' })}>
                          Scrapboxのプロジェクト名を設定すると、AI TODO提案で活用されます
                        </div>
                      </div>

                      <div className={css({ gridColumn: 'span 2' })}>
                        <label htmlFor="bio_input" className={css({
                          display: 'block',
                          fontSize: 'sm',
                          fontWeight: '600',
                          color: 'gray.700',
                          mb: '2'
                        })}>
                          自己紹介
                        </label>
                        <textarea
                          id="bio_input"
                          placeholder="自己紹介を入力してください"
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          rows={3}
                          className={formStyles.textarea}
                        />
                      </div>


                    </div>

                    {/* アクションボタン */}
                    <div className={css({
                      display: 'flex',
                      gap: '3',
                      justifyContent: 'flex-end',
                      pt: '4',
                      borderTop: '1px solid',
                      borderTopColor: 'gray.200'
                    })}>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className={buttonStyles.secondary}
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        disabled={saving || !formData.username.trim()}
                        className={buttonStyles.primary}
                      >
                        {saving ? '保存中...' : '保存'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* TODO提案セクション */}
            <div>
              <div className={css({
                bg: 'white',
                borderRadius: 'xl',
                p: '6',
                shadow: 'md',
                border: '1px solid',
                borderColor: 'primary.100',
                h: 'fit-content'
              })}>
                <h2 className={css({
                  fontSize: '2xl',
                  fontWeight: 'bold',
                  color: 'primary.800',
                  mb: '4'
                })}>
                  今日のTODOリスト提案
                </h2>

                {/* モード切り替えUI */}
                {useScrapbox && profile?.scrapbox_project_name ? (
                  <div className={css({ mb: '4', display: 'flex', alignItems: 'center', gap: '3' })}>
                    <span className={css({ bg: 'green.100', color: 'green.700', px: '3', py: '1', rounded: 'full', fontSize: 'xs', fontWeight: 'bold' })}>
                      Scrapbox連携中
                    </span>
                    <button type="button" onClick={() => setUseScrapbox(false)} className={css({ ml: 'auto', fontSize: 'xs', color: 'blue.600', bg: 'blue.50', px: '2', py: '1', rounded: 'md', border: 'none', cursor: 'pointer', _hover: { bg: 'blue.100' } })}>
                      Scrapboxを使わないで詳細入力する
                    </button>
                  </div>
                ) : (
                  <div className={css({ mb: '4', display: 'flex', alignItems: 'center', gap: '3' })}>
                    <span className={css({ bg: 'gray.100', color: 'gray.700', px: '3', py: '1', rounded: 'full', fontSize: 'xs', fontWeight: 'bold' })}>
                      詳細入力モード
                    </span>
                    <span className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      Scrapboxを設定すると「時間」と「今日の目標」だけでTODOリストを提案できます
                    </span>
                    {profile?.scrapbox_project_name && (
                      <button type="button" onClick={() => setUseScrapbox(true)} className={css({ ml: 'auto', fontSize: 'xs', color: 'green.700', bg: 'green.50', px: '2', py: '1', rounded: 'md', border: 'none', cursor: 'pointer', _hover: { bg: 'green.100' } })}>
                        Scrapboxを使う
                      </button>
                    )}
                  </div>
                )}
                <form onSubmit={handleTodoSuggestion} className={css({ spaceY: '4' })}>
                  <div>
                    <label htmlFor="todo_time_available" className={css({ display: 'block', fontSize: 'sm', fontWeight: '600', color: 'gray.700', mb: '2' })}>
                      勉強に使える時間（分）<span className={css({ color: 'red.500' })}>*</span>
                    </label>
                    <input
                      id="todo_time_available"
                      type="number"
                      min="1"
                      max="480"
                      step="1"
                      value={todoSuggestionForm.time_available}
                      onChange={e => setTodoSuggestionForm(prev => ({ ...prev, time_available: parseInt(e.target.value) || 1 }))}
                      className={formStyles.input}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="todo_recent_progress" className={css({ display: 'block', fontSize: 'sm', fontWeight: '600', color: 'gray.700', mb: '2' })}>
                      最近の課題・進捗（任意）
                    </label>
                    <textarea
                      id="todo_recent_progress"
                      placeholder="例: 英単語の暗記が進んだ、数学の微分が苦手"
                      value={todoSuggestionForm.recent_progress}
                      onChange={e => setTodoSuggestionForm(prev => ({ ...prev, recent_progress: e.target.value }))}
                      rows={2}
                      className={formStyles.textarea}
                    />
                  </div>
                  <div>
                    <label htmlFor="todo_weak_areas" className={css({ display: 'block', fontSize: 'sm', fontWeight: '600', color: 'gray.700', mb: '2' })}>
                      弱点（カンマ区切りで複数入力可・任意）
                    </label>
                    <input
                      id="todo_weak_areas"
                      type="text"
                      placeholder="例: リスニング, 文法, 計算ミス"
                      value={todoSuggestionForm.weak_areas}
                      onChange={e => setTodoSuggestionForm(prev => ({ ...prev, weak_areas: e.target.value }))}
                      className={formStyles.input}
                    />
                    <div className={css({ fontSize: 'xs', color: 'gray.500', mt: '1' })}>
                      カンマ区切りで複数入力できます（例: リスニング, 文法, 計算ミス）
                    </div>
                  </div>
                  <div>
                    <label htmlFor="todo_daily_goal" className={css({ display: 'block', fontSize: 'sm', fontWeight: '600', color: 'gray.700', mb: '2' })}>
                      今日の目標（任意）
                    </label>
                    <textarea
                      id="todo_daily_goal"
                      placeholder="例: リスニング問題を10問解く"
                      value={todoSuggestionForm.daily_goal}
                      onChange={e => setTodoSuggestionForm(prev => ({ ...prev, daily_goal: e.target.value }))}
                      rows={2}
                      className={formStyles.textarea}
                    />
                  </div>
                  {todoSuggestionError && (
                    <div className={css({ p: '3', bg: 'red.50', border: '1px solid', borderColor: 'red.200', rounded: 'md', color: 'red.700', fontSize: 'sm' })}>
                      {todoSuggestionError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={todoSuggestionLoading || !todoSuggestionForm.time_available}
                    className={css({ w: 'full', py: '3', px: '4', bg: 'primary.600', color: 'white', rounded: 'md', fontSize: 'sm', fontWeight: 'medium', _hover: { bg: 'primary.700' }, _disabled: { opacity: '0.5', cursor: 'not-allowed' } })}
                  >
                    {todoSuggestionLoading ? '提案生成中...' : 'TODOリストを提案してもらう'}
                  </button>
                </form>

                {/* 提案結果表示 */}
                {todoSuggestionResult && (
                  <div className={css({
                    mt: '6',
                    p: '4',
                    bg: 'green.50',
                    border: '1px solid',
                    borderColor: 'green.200',
                    rounded: 'md'
                  })}>
                    <AiTodoSuggestion
                      content={todoSuggestionResult.content}
                      onAddTodos={handleAddToTodoList}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
