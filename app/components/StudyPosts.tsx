'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { css } from '../../styled-system/css';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from './ui/LoadingSpinner';
import MarkdownRenderer from './ui/MarkdownRenderer';

interface StudyPost {
  id: string;
  user_id: string;
  content: string;
  hashtags: string[];
  is_public: boolean;
  todo_id: string | null;
  created_at: string;
  updated_at: string;
  username: string | null;
  full_name: string | null;
  icon_url: string | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

interface StudyPostsProps {
  userId: string;
  limit?: number;
}

export default function StudyPosts({ userId, limit = 5 }: StudyPostsProps) {
  const [posts, setPosts] = useState<StudyPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudyPosts();
  }, [userId, limit]);

  const fetchStudyPosts = async () => {
    if (!supabase || !userId) return;

    try {
      setLoading(true);

      // まずtimeline_posts_with_statsビューから投稿を取得を試行
      let { data, error } = await supabase
        .from('timeline_posts_with_stats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // timeline_postsが存在しない場合、study_recordsから取得（フォールバック）
      if (error && error.message.includes('relation "timeline_posts_with_stats" does not exist')) {
        console.log('タイムラインテーブルが未作成のため、study_recordsからデータを取得します');
        
        const fallbackResult = await supabase
          .from('study_records')
          .select('id, title, content, created_at, updated_at, tags')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fallbackResult.error) throw fallbackResult.error;

        // study_recordsデータをStudyPost形式に変換
        const convertedData = (fallbackResult.data || []).map(record => ({
          id: record.id,
          user_id: userId,
          content: record.content,
          hashtags: record.tags || [],
          is_public: true,
          todo_id: null,
          created_at: record.created_at,
          updated_at: record.updated_at,
          username: null,
          full_name: null,
          icon_url: null,
          likes_count: 0,
          comments_count: 0,
          is_liked: false
        }));

        setPosts(convertedData);
      } else if (error) {
        throw error;
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('学習投稿取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className={css({
        bg: 'white',
        rounded: '2xl',
        shadow: 'md',
        p: '6',
        border: '1px solid',
        borderColor: 'gray.100'
      })}>
        <h3 className={css({
          fontSize: 'xl',
          fontWeight: 'bold',
          color: 'gray.900',
          mb: '4'
        })}>
          最近の学習投稿
        </h3>
        <div className={css({
          display: 'flex',
          justifyContent: 'center',
          py: '8'
        })}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className={css({
      bg: 'white',
      rounded: '2xl',
      shadow: 'md',
      p: '6',
      border: '1px solid',
      borderColor: 'gray.100'
    })}>
      <div className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: '4'
      })}>
        <h3 className={css({
          fontSize: 'xl',
          fontWeight: 'bold',
          color: 'gray.900'
        })}>
          最近の学習投稿
        </h3>
        <span className={css({
          bg: 'primary.50',
          color: 'primary.700',
          px: '3',
          py: '1',
          rounded: 'full',
          fontSize: 'sm',
          fontWeight: 'medium'
        })}>
          {posts.length}件
        </span>
      </div>

      {posts.length === 0 ? (
        <div className={css({
          textAlign: 'center',
          py: '8',
          color: 'gray.500'
        })}>
          <div className={css({
            fontSize: '3xl',
            mb: '2'
          })}>
            📚
          </div>
          <p>学習投稿がありません</p>
          <p className={css({
            fontSize: 'sm',
            mt: '1'
          })}>
            学習記録を投稿すると、ここに表示されます
          </p>
        </div>
      ) : (
        <div className={css({
          spaceY: '4',
          maxH: '96',
          overflowY: 'auto'
        })}>
          {posts.map((post) => (
            <article
              key={post.id}
              className={css({
                p: '4',
                border: '1px solid',
                borderColor: 'gray.200',
                rounded: 'lg',
                _hover: { borderColor: 'primary.300', shadow: 'sm' },
                transition: 'all 0.2s'
              })}
            >
              <header className={css({ mb: '3' })}>
                <div className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '2'
                })}>
                  <time className={css({
                    fontSize: 'sm',
                    color: 'gray.500'
                  })}>
                    {dayjs(post.created_at).format('YYYY/MM/DD HH:mm')}
                  </time>
                  
                  <div className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3'
                  })}>
                    {/* いいね数 */}
                    <div className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1',
                      color: post.is_liked ? 'red.500' : 'gray.500',
                      fontSize: 'sm'
                    })}>
                      <span>{post.is_liked ? '❤️' : '🤍'}</span>
                      <span>{post.likes_count}</span>
                    </div>
                    
                    {/* コメント数 */}
                    <div className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1',
                      color: 'gray.500',
                      fontSize: 'sm'
                    })}>
                      <span>💬</span>
                      <span>{post.comments_count}</span>
                    </div>
                  </div>
                </div>
                
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className={css({
                    display: 'flex',
                    gap: '1',
                    flexWrap: 'wrap',
                    mt: '2'
                  })}>
                    {post.hashtags.slice(0, 3).map((tag: string, index: number) => (
                      <span
                        key={index}
                        className={css({
                          px: '2',
                          py: '0.5',
                          bg: 'primary.50',
                          color: 'primary.700',
                          rounded: 'md',
                          fontSize: 'xs',
                          fontWeight: 'medium'
                        })}
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.hashtags.length > 3 && (
                      <span className={css({
                        fontSize: 'xs',
                        color: 'gray.500'
                      })}>
                        +{post.hashtags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </header>

              <div className={css({
                color: 'gray.600',
                fontSize: 'sm',
                lineHeight: 'relaxed'
              })}>
                <MarkdownRenderer content={truncateContent(post.content)} />
              </div>

              {post.content.length > 150 && (
                <button
                  className={css({
                    mt: '2',
                    color: 'primary.600',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    _hover: { color: 'primary.800' },
                    border: 'none',
                    bg: 'transparent',
                    cursor: 'pointer'
                  })}
                >
                  続きを読む
                </button>
              )}

              {post.updated_at !== post.created_at && (
                <div className={css({
                  mt: '2',
                  pt: '2',
                  borderTop: '1px solid',
                  borderTopColor: 'gray.100',
                  fontSize: 'xs',
                  color: 'gray.500'
                })}>
                  更新: {dayjs(post.updated_at).format('YYYY/MM/DD HH:mm')}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {posts.length >= limit && (
        <div className={css({
          textAlign: 'center',
          mt: '4',
          pt: '4',
          borderTop: '1px solid',
          borderTopColor: 'gray.200'
        })}>
          <button
            onClick={() => fetchStudyPosts()}
            className={css({
              px: '4',
              py: '2',
              bg: 'primary.50',
              color: 'primary.700',
              rounded: 'md',
              fontSize: 'sm',
              fontWeight: 'medium',
              _hover: { bg: 'primary.100' },
              border: 'none',
              cursor: 'pointer'
            })}
          >
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
}
