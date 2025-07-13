'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { buttonStyles, formStyles, cardStyles } from '../styles/components';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name?: string;
  icon_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  username: string;
  full_name: string;
  icon_url: string;
  bio: string;
}

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    full_name: '',
    icon_url: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!supabase || !user) {
      console.log('fetchProfile: Supabaseまたはユーザーが存在しません');
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

      console.log('プロフィール取得結果:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('プロフィールが存在しないため作成します');
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          icon_url: data.icon_url || '',
          bio: data.bio || ''
        });
      }
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
      setError('プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!supabase || !user) {
      console.log('プロフィール作成: Supabaseまたはユーザーが存在しません');
      return;
    }

    try {
      console.log('プロフィール作成開始:', {
        userId: user.id,
        email: user.email,
        metadata: user.user_metadata
      });

      const profileData = {
        user_id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        full_name: user.user_metadata?.full_name || '',
        icon_url: user.user_metadata?.avatar_url || '',
        bio: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('作成するプロフィールデータ:', profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('プロフィール作成エラー:', error);
        throw error;
      }

      console.log('プロフィール作成成功:', data);
      setProfile(data);
      setFormData({
        username: data.username || '',
        full_name: data.full_name || '',
        icon_url: data.icon_url || '',
        bio: data.bio || ''
      });
    } catch (err) {
      console.error('プロフィール作成エラー:', err);
      setError('プロフィールの作成に失敗しました');
    }
  };

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
        bio: profile.bio || ''
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
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase!.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase!.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, icon_url: publicUrl }));
    } catch (err) {
      console.error('画像アップロードエラー:', err);
      setError('画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
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
        ) : !editMode && profile ? (
          // 非編集時のコンパクト表示
          <div className={css({
            bg: 'white',
            borderRadius: 'xl',
            p: '6',
            shadow: 'md',
            border: '1px solid',
            borderColor: 'primary.100',
            maxW: '2xl',
            mx: 'auto'
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
                  <img
                    src={profile.icon_url}
                    alt="プロフィール画像"
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
            p: '8'
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
                      <img
                        src={formData.icon_url}
                        alt="プロフィール画像"
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
                  <label className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: '600',
                    color: 'gray.700'
                  })}>
                    または、画像URLを直接入力
                  </label>
                  <input
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
                  <label className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: '600',
                    color: 'gray.700',
                    mb: '2'
                  })}>
                    ユーザー名 *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className={formStyles.input}
                    required
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
                    フルネーム
                  </label>
                  <input
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
                  <label className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: '600',
                    color: 'gray.700',
                    mb: '2'
                  })}>
                    自己紹介
                  </label>
                  <textarea
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
    </main>
  );
}
