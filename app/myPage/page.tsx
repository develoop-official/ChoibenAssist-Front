'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '../../styled-system/css';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { uploadAvatar, validateAvatarFile } from '../../lib/avatar-upload';

interface UserProfile {
  user_id: string;
  username?: string;
  full_name?: string;
  icon_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    icon_url: '',
    bio: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    console.log('マイページ: ユーザー状態変更:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasSupabase: !!supabase
    });
    
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!supabase || !user) {
      console.log('Supabaseまたはユーザーが存在しません:', { hasSupabase: !!supabase, hasUser: !!user });
      return;
    }

    try {
      setLoading(true);
      console.log('プロフィール取得開始:', { userId: user.id });
      
      // まずテーブルの存在を確認
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .limit(1);

      console.log('テーブル確認結果:', { tableCheck, tableError });

      if (tableError) {
        console.error('テーブルアクセスエラー:', tableError);
        if (tableError.code === '42P01' || tableError.message?.includes('relation "user_profiles" does not exist')) {
          setError('user_profilesテーブルが存在しません。Supabaseダッシュボードでテーブルを作成してください。');
          setLoading(false);
          return;
        }
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('プロフィール取得結果:', { data, error });

      if (error) {
        console.error('プロフィール取得エラー詳細:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === 'PGRST116') {
          // データが存在しない場合は作成
          console.log('プロフィールが存在しないため作成します');
          await createProfile();
          return;
        }
        
        throw error;
      }

      if (data) {
        console.log('プロフィール取得成功:', data);
        setProfile(data);
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          icon_url: data.icon_url || '',
          bio: data.bio || ''
        });
      } else {
        // プロフィールが存在しない場合は作成
        console.log('プロフィールが存在しないため作成します');
        await createProfile();
      }
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
      console.error('エラー詳細:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
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
        username: user.user_metadata?.username || '',
        full_name: user.user_metadata?.full_name || '',
        icon_url: user.user_metadata?.avatar_url || '',
        bio: ''
      };

      console.log('作成するプロフィールデータ:', profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      console.log('プロフィール作成結果:', { data, error });

      if (error) {
        console.error('プロフィール作成エラー詳細:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
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
      console.error('エラー詳細:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
      setError('プロフィールの作成に失敗しました');
    }
  };

  const handleSave = async () => {
    if (!supabase || !user) return;

    try {
      setSaving(true);
      setError('');

      const { error } = await supabase
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

    // ファイルバリデーション
    const validation = validateAvatarFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'ファイルの形式が正しくありません');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // アバター画像をアップロード
      const avatarUrl = await uploadAvatar(user.id, file);
      
      // フォームデータを更新
      setFormData(prev => ({ ...prev, icon_url: avatarUrl }));
      
      // プロフィールを即座に更新
      if (supabase) {
        await supabase
          .from('user_profiles')
          .update({
            icon_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }

      // プロフィール状態を更新
      setProfile(prev => prev ? {
        ...prev,
        icon_url: avatarUrl,
        updated_at: new Date().toISOString()
      } : null);

    } catch (err) {
      console.error('アバターアップロードエラー:', err);
      setError('アバター画像のアップロードに失敗しました');
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

  return (
    <main className={css({
      maxW: '4xl',
      mx: 'auto',
      px: '6',
      py: '8'
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
          マイページ
        </h1>
        <p className={css({
          fontSize: 'lg',
          color: 'gray.600'
        })}>
          プロフィール情報の確認・編集
        </p>
      </div>

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
          bg: 'white',
          rounded: '2xl',
          shadow: 'lg',
          border: '1px solid',
          borderColor: 'gray.100',
          p: '8'
        })}>
          {/* アバター・プロフィール画像 */}
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
                 bg: 'gray.100',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 border: '2px solid',
                 borderColor: 'gray.200'
               })}>
                                {profile?.icon_url ? (
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
                   fontSize: '4xl',
                   color: 'gray.400'
                 })}>
                   👤
                 </span>
               )}
               </div>
               
               {/* ファイルアップロードボタン */}
               <label className={css({
                 position: 'absolute',
                 bottom: '0',
                 right: '0',
                 w: '8',
                 h: '8',
                 bg: 'blue.600',
                 color: 'white',
                 rounded: 'full',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: 'pointer',
                 fontSize: 'sm',
                 border: '2px solid',
                 borderColor: 'white',
                 _hover: {
                   bg: 'blue.700'
                 }
               })}>
                 📷
                 <input
                   type="file"
                   accept="image/*"
                   onChange={handleFileUpload}
                   className={css({
                     display: 'none'
                   })}
                   disabled={uploading}
                 />
               </label>
             </div>
             
             {/* アップロード中の表示 */}
             {uploading && (
               <div className={css({
                 textAlign: 'center',
                 color: 'blue.600',
                 fontSize: 'sm',
                 mb: '4'
               })}>
                 アップロード中...
               </div>
             )}
             
             {/* URL入力フィールド（編集モード時） */}
             {editMode && (
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
                   className={css({
                     w: 'full',
                     px: '3',
                     py: '2',
                     border: '1px solid',
                     borderColor: 'gray.300',
                     rounded: 'md',
                     fontSize: 'sm',
                     _focus: {
                       outline: 'none',
                       ring: '2px',
                       ringColor: 'blue.500',
                       borderColor: 'blue.500'
                     }
                   })}
                 />
               </div>
             )}

             <div>
               <label className={css({
                 display: 'block',
                 fontSize: 'sm',
                 fontWeight: '600',
                 color: 'gray.700',
                 mb: '2'
               })}>
                 自己紹介
               </label>
               {editMode ? (
                 <textarea
                   value={formData.bio}
                   onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                   rows={3}
                   className={css({
                     w: 'full',
                     px: '3',
                     py: '2',
                     border: '1px solid',
                     borderColor: 'gray.300',
                     rounded: 'md',
                     fontSize: 'sm',
                     resize: 'vertical',
                     _focus: {
                       outline: 'none',
                       ring: '2px',
                       ringColor: 'blue.500',
                       borderColor: 'blue.500'
                     }
                   })}
                 />
               ) : (
                 <div className={css({
                   px: '3',
                   py: '2',
                   bg: 'gray.50',
                   border: '1px solid',
                   borderColor: 'gray.200',
                   rounded: 'md',
                   fontSize: 'sm',
                   color: 'gray.600',
                   minH: '60px'
                 })}>
                   {profile?.bio || '未設定'}
                 </div>
               )}
             </div>
          </div>

          {/* プロフィール情報 */}
          <div className={css({
            spaceY: '6'
          })}>
                         <div>
               <label className={css({
                 display: 'block',
                 fontSize: 'sm',
                 fontWeight: '600',
                 color: 'gray.700',
                 mb: '2'
               })}>
                 ユーザー名
               </label>
               {editMode ? (
                 <input
                   type="text"
                   value={formData.username}
                   onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                   className={css({
                     w: 'full',
                     px: '3',
                     py: '2',
                     border: '1px solid',
                     borderColor: 'gray.300',
                     rounded: 'md',
                     fontSize: 'sm',
                     _focus: {
                       outline: 'none',
                       ring: '2px',
                       ringColor: 'blue.500',
                       borderColor: 'blue.500'
                     }
                   })}
                 />
               ) : (
                 <div className={css({
                   px: '3',
                   py: '2',
                   bg: 'gray.50',
                   border: '1px solid',
                   borderColor: 'gray.200',
                   rounded: 'md',
                   fontSize: 'sm',
                   color: 'gray.600'
                 })}>
                   {profile?.username || '未設定'}
                 </div>
               )}
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

            <div>
              <label className={css({
                display: 'block',
                fontSize: 'sm',
                fontWeight: '600',
                color: 'gray.700',
                mb: '2'
              })}>
                表示名
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className={css({
                    w: 'full',
                    px: '3',
                    py: '2',
                    border: '1px solid',
                    borderColor: 'gray.300',
                    rounded: 'md',
                    fontSize: 'sm',
                    _focus: {
                      outline: 'none',
                      ring: '2px',
                      ringColor: 'blue.500',
                      borderColor: 'blue.500'
                    }
                  })}
                />
              ) : (
                <div className={css({
                  px: '3',
                  py: '2',
                  bg: 'gray.50',
                  border: '1px solid',
                  borderColor: 'gray.200',
                  rounded: 'md',
                  fontSize: 'sm',
                  color: 'gray.600'
                })}>
                  {profile?.full_name || '未設定'}
                </div>
              )}
            </div>

            <div>
              <label className={css({
                display: 'block',
                fontSize: 'sm',
                fontWeight: '600',
                color: 'gray.700',
                mb: '2'
              })}>
                アカウント作成日
              </label>
              <div className={css({
                px: '3',
                py: '2',
                bg: 'gray.50',
                border: '1px solid',
                borderColor: 'gray.200',
                rounded: 'md',
                fontSize: 'sm',
                color: 'gray.600'
              })}>
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') : '不明'}
              </div>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className={css({
              mt: '6',
              p: '3',
              bg: 'red.50',
              border: '1px solid',
              borderColor: 'red.200',
              rounded: 'md',
              color: 'red.700',
              fontSize: 'sm'
            })}>
              {error}
            </div>
          )}

          {/* アクションボタン */}
          <div className={css({
            mt: '8',
            display: 'flex',
            gap: '4',
            justifyContent: 'center'
          })}>
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={css({
                    px: '6',
                    py: '2',
                    bg: 'blue.600',
                    color: 'white',
                    rounded: 'md',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    _hover: {
                      bg: 'blue.700'
                    },
                    _disabled: {
                      opacity: '0.5',
                      cursor: 'not-allowed'
                    }
                  })}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className={css({
                    px: '6',
                    py: '2',
                    bg: 'gray.200',
                    color: 'gray.700',
                    rounded: 'md',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    _hover: {
                      bg: 'gray.300'
                    },
                    _disabled: {
                      opacity: '0.5',
                      cursor: 'not-allowed'
                    }
                  })}
                >
                  キャンセル
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className={css({
                  px: '6',
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
            )}
          </div>
        </div>
      )}
    </main>
  );
} 