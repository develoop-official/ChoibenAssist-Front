'use client';

import Image from 'next/image';
import React, { useState } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import { buttonStyles, formStyles } from '../styles/components';

import LoadingSpinner from './ui/LoadingSpinner';
import MarkdownRenderer from './ui/MarkdownRenderer';

interface UserProfile {
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

interface User {
  id: string;
}

interface ProfileCardProps {
  profile: UserProfile | null;
  user: User;
  onProfileUpdate: (_updatedProfile: UserProfile) => void;
}

export default function ProfileCard({ profile, user, onProfileUpdate }: ProfileCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    icon_url: profile?.icon_url || '',
    bio: profile?.bio || '',
    scrapbox_project_name: profile?.scrapbox_project_name || ''
  });

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

      const updatedProfile = {
        ...profile!,
        username: formData.username,
        full_name: formData.full_name,
        icon_url: formData.icon_url,
        bio: formData.bio,
        scrapbox_project_name: formData.scrapbox_project_name,
        updated_at: new Date().toISOString()
      };

      onProfileUpdate(updatedProfile);
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
    setError('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

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

  if (!profile) return null;

  return (
    <div className={css({
      bg: 'white',
      rounded: '2xl',
      shadow: 'xl',
      border: '1px solid',
      borderColor: 'gray.100',
      overflow: 'hidden'
    })}>
      {/* Header */}
      <div className={css({
        bg: 'gradient-to-r',
        bgGradient: 'to-r',
        gradientFrom: 'primary.500',
        gradientTo: 'primary.600',
        px: '6',
        py: '4',
        color: 'white'
      })}>
        <div className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        })}>
          <h2 className={css({
            fontSize: '2xl',
            fontWeight: 'bold'
          })}>
            プロフィール
          </h2>
          {!editMode && (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className={css({
                px: '4',
                py: '2',
                bg: 'white',
                color: 'primary.600',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                _hover: { bg: 'primary.50' },
                border: 'none',
                cursor: 'pointer'
              })}
            >
              編集
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={css({ p: '6' })}>
        {error && (
          <div className={css({
            mb: '4',
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

        {!editMode ? (
          // Display Mode
          <div className={css({
            display: 'flex',
            alignItems: 'start',
            gap: '6'
          })}>
            {/* Avatar */}
            <div className={css({
              w: '24',
              h: '24',
              rounded: 'full',
              overflow: 'hidden',
              bg: 'primary.50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid',
              borderColor: 'primary.200',
              flexShrink: '0'
            })}>
              {profile.icon_url ? (
                <Image
                  src={profile.icon_url}
                  alt="プロフィール画像"
                  width={96}
                  height={96}
                  priority
                  className={css({
                    w: 'full',
                    h: 'full',
                    objectFit: 'cover'
                  })}
                />
              ) : (
                <span className={css({
                  fontSize: '4xl',
                  color: 'primary.300'
                })}>
                  👤
                </span>
              )}
            </div>

            {/* Profile Info */}
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
                  mb: '3',
                  fontWeight: 'medium'
                })}>
                  {profile.full_name}
                </p>
              )}

              {profile.bio && (
                <div className={css({
                  mb: '4'
                })}>
                  <MarkdownRenderer 
                    content={profile.bio}
                    className={css({
                      color: 'gray.600',
                      lineHeight: 'relaxed'
                    })}
                  />
                </div>
              )}

              {profile.scrapbox_project_name && (
                <div className={css({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2',
                  bg: 'green.50',
                  color: 'green.700',
                  px: '3',
                  py: '1',
                  rounded: 'full',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  border: '1px solid',
                  borderColor: 'green.200'
                })}>
                  📚 Scrapbox: {profile.scrapbox_project_name}
                </div>
              )}

              <div className={css({
                display: 'flex',
                gap: '6',
                fontSize: 'sm',
                color: 'gray.500',
                mt: '4'
              })}>
                <span>登録日: {new Date(profile.created_at).toLocaleDateString('ja-JP')}</span>
                <span>更新日: {new Date(profile.updated_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit}>
            {/* Avatar Upload */}
            <div className={css({
              textAlign: 'center',
              mb: '6'
            })}>
              <div className={css({
                position: 'relative',
                w: '24',
                h: '24',
                mx: 'auto',
                mb: '4'
              })}>
                <div className={css({
                  w: 'full',
                  h: 'full',
                  rounded: 'full',
                  overflow: 'hidden',
                  bg: 'primary.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid',
                  borderColor: 'primary.200'
                })}>
                  {formData.icon_url ? (
                    <Image
                      src={formData.icon_url}
                      alt="プロフィール画像"
                      width={96}
                      height={96}
                      priority
                      className={css({
                        w: 'full',
                        h: 'full',
                        objectFit: 'cover'
                      })}
                    />
                  ) : (
                    <span className={css({
                      fontSize: '4xl',
                      color: 'primary.300'
                    })}>
                      👤
                    </span>
                  )}
                </div>

                <input
                  id="file_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className={css({
                    position: 'absolute',
                    inset: '0',
                    w: 'full',
                    h: 'full',
                    opacity: '0',
                    cursor: 'pointer'
                  })}
                />
              </div>

              {uploading && (
                <div className={css({ mb: '2' })}>
                  <LoadingSpinner />
                </div>
              )}

              <div className={css({ spaceY: '2' })}>
                <label htmlFor="icon_url_input" className={formStyles.label}>
                  画像URL（直接入力）
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

            {/* Form Fields */}
            <div className={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6',
              mb: '6'
            })}>
              <div>
                <label htmlFor="username_input" className={formStyles.label}>
                  ユーザー名 <span className={css({ color: 'red.500' })}>*</span>
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
                <label htmlFor="full_name_input" className={formStyles.label}>
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

              <div className={css({ gridColumn: 'span 2' })}>
                <label htmlFor="scrapbox_project_name_input" className={formStyles.label}>
                  Scrapboxプロジェクト名
                </label>
                <input
                  id="scrapbox_project_name_input"
                  type="text"
                  placeholder="例: my-study-project"
                  value={formData.scrapbox_project_name}
                  onChange={e => setFormData(prev => ({ ...prev, scrapbox_project_name: e.target.value }))}
                  className={formStyles.input}
                />
                <p className={css({
                  fontSize: 'xs',
                  color: 'gray.500',
                  mt: '1'
                })}>
                  設定するとTODO提案機能でScrapboxの情報を活用できます
                </p>
              </div>

              <div className={css({ gridColumn: 'span 2' })}>
                <label htmlFor="bio_input" className={formStyles.label}>
                  自己紹介
                </label>
                <textarea
                  id="bio_input"
                  placeholder="自己紹介を入力してください&#10;&#10;**マークダウン記法**が使用できます：&#10;- **太字**、*斜体*&#10;- # 見出し&#10;- [リンク](https://example.com)&#10;- `コード`&#10;- > 引用&#10;- - リスト"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={5}
                  className={formStyles.textarea}
                />
                <p className={css({
                  fontSize: 'xs',
                  color: 'gray.500',
                  mt: '1'
                })}>
                  マークダウン記法（**太字**、*斜体*、# 見出し、リンクなど）がサポートされています
                </p>
              </div>
            </div>

            {/* Action Buttons */}
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
        )}
      </div>
    </div>
  );
}
