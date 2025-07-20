'use client';

import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';

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
  todo?: {
    id: string;
    task: string;
    study_time: number;
    due_date?: string;
  };
}

interface StudyPostsProps {
  userId: string;
  limit?: number;
}

export default function StudyPosts({ userId, limit = 5 }: StudyPostsProps) {
  const [posts, setPosts] = useState<StudyPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudyPosts = useCallback(async () => {
    if (!supabase || !userId) return;

    try {
      setLoading(true);

      // まずtimeline_posts_with_statsビューから投稿を取得を試行
      const { data, error } = await supabase
        .from('timeline_posts_with_stats')
        .select(`
          *,
          todo_items (
            id,
            task,
            study_time,
            due_date
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // timeline_postsが存在しない場合、study_recordsから取得（フォールバック）
      if (error && error.message.includes('relation "timeline_posts_with_stats" does not exist')) {
        console.warn('タイムラインテーブルが未作成のため、study_recordsからデータを取得します');
        
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
        // TODO情報を含めて投稿データを設定
        const postsWithTodos = (data || []).map(post => ({
          ...post,
          todo: post.todo_items
        }));
        setPosts(postsWithTodos);
      }
    } catch (error) {
      console.error('学習投稿取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchStudyPosts();
  }, [fetchStudyPosts]);

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
      rounded: { base: 'lg', md: '2xl' },
      shadow: 'md',
      p: { base: '4', md: '6' },
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
          fontSize: { base: 'lg', md: 'xl' },
          fontWeight: 'bold',
          color: 'gray.900'
        })}>
          最近の学習投稿
        </h3>
        <span className={css({
          bg: 'primary.50',
          color: 'primary.700',
          px: { base: '2', md: '3' },
          py: '1',
          rounded: 'full',
          fontSize: { base: 'xs', md: 'sm' },
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
          maxH: { base: '80', md: '96' },
          overflowY: 'auto'
        })}>
          {posts.map((post) => (
            <article
              key={post.id}
              className={css({
                p: { base: '3', md: '4' },
                border: '1px solid',
                borderColor: 'gray.200',
                rounded: 'lg',
                _hover: { borderColor: 'primary.300', shadow: 'sm' },
                transition: 'all 0.2s'
              })}
            >
              {/* TODO完了バッジ */}
              {post.todo && (
                <div className={css({
                  mb: '3',
                  p: '2',
                  bg: 'green.50',
                  border: '1px solid',
                  borderColor: 'green.200',
                  rounded: 'md'
                })}>
                  <div className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    mb: '1'
                  })}>
                    <span className={css({
                      fontSize: { base: 'sm', md: 'md' }
                    })}>
                      ✅
                    </span>
                    <span className={css({
                      fontSize: { base: 'xs', md: 'sm' },
                      fontWeight: 'bold',
                      color: 'green.700'
                    })}>
                      Todo完了
                    </span>
                  </div>
                  <div className={css({
                    fontSize: { base: 'xs', md: 'sm' },
                    color: 'green.600'
                  })}>
                    <div><strong>タスク:</strong> {post.todo.task}</div>
                    <div><strong>学習時間:</strong> {post.todo.study_time}分</div>
                    {post.todo.due_date && (
                      <div><strong>期限:</strong> {post.todo.due_date}</div>
                    )}
                  </div>
                </div>
              )}

              <header className={css({ mb: '3' })}>
                <div className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '2'
                })}>
                  <time className={css({
                    fontSize: { base: 'xs', md: 'sm' },
                    color: 'gray.500'
                  })}>
                    {dayjs(post.created_at).format('YYYY/MM/DD HH:mm')}
                  </time>
                  
                  <div className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: { base: '2', md: '3' }
                  })}>
                    {/* いいね数 */}
                    <div className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1',
                      color: post.is_liked ? 'red.500' : 'gray.500',
                      fontSize: { base: 'xs', md: 'sm' }
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
                      fontSize: { base: 'xs', md: 'sm' }
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
                fontSize: { base: 'xs', md: 'sm' },
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
