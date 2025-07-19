'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useCallback, Suspense } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';
import TimelinePostForm from '../components/TimelinePostForm';
import { useAuth } from '../hooks/useAuth';

interface Post {
  id: string;
  user_id: string;
  content: string;
  hashtags: string[];
  is_public: boolean;
  todo_id: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: {
    username: string;
    full_name: string;
    icon_url: string;
  };
  todo_item?: {
    task: string;
    study_time: number;
    due_date: string;
  };
}

function TimelineContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const completedTodoId = searchParams.get('completed_todo');

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedCompletedTodo, setSelectedCompletedTodo] = useState<Post | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase!
        .from('timeline_posts')
        .select(`
          *,
          user_profile:user_profiles(username, full_name, icon_url),
          todo_item:todo_items(task, study_time, due_date)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('投稿取得エラー:', error);
        return;
      }

      setPosts(data || []);
    } catch (err) {
      console.error('投稿取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  // 完了したTODOの情報を取得して投稿フォームを表示
  useEffect(() => {
    const handleCompletedTodo = async () => {
      if (!completedTodoId) return;

      try {
        const { data, error } = await supabase!
          .from('todo_items')
          .select('*')
          .eq('id', completedTodoId)
          .single();

        if (error) {
          console.error('完了TODO取得エラー:', error);
          return;
        }

        // 完了したTODOの情報を投稿フォームに渡す
        setSelectedCompletedTodo(data);
        setShowPostForm(true);
      } catch (err) {
        console.error('完了TODO取得エラー:', err);
      }
    };

    handleCompletedTodo();
  }, [completedTodoId]);

  // Markdownの基本的なレンダリング
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>');
  };

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
          <h1 className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '4'
          })}>
            ログインが必要です
          </h1>
          <Link
            href="/login"
            className={css({
              display: 'inline-block',
              px: '6',
              py: '3',
              bg: 'blue.600',
              color: 'white',
              rounded: 'lg',
              fontSize: 'md',
              fontWeight: 'medium',
              textDecoration: 'none',
              transition: 'all 0.2s',
              _hover: { bg: 'blue.700' }
            })}
          >
            ログインする
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={css({
      minH: '100vh',
      bg: 'gray.50',
      py: '8'
    })}>
      <div className={css({
        maxW: '4xl',
        mx: 'auto',
        px: '6'
      })}>
        {/* ヘッダー */}
        <div className={css({
          mb: '8',
          textAlign: 'center'
        })}>
          <h1 className={css({
            fontSize: '3xl',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '2'
          })}>
            学習タイムライン
          </h1>
          <p className={css({
            fontSize: 'lg',
            color: 'gray.600',
            mb: '6'
          })}>
            他の学習者の成果を見て、モチベーションを高めましょう
          </p>
          <button
            onClick={() => setShowPostForm(true)}
            className={css({
              px: '6',
              py: '3',
              bg: 'blue.600',
              color: 'white',
              rounded: 'lg',
              fontSize: 'md',
              fontWeight: 'medium',
              transition: 'all 0.2s',
              _hover: { bg: 'blue.700' }
            })}
          >
            投稿する
          </button>
        </div>

        {/* 投稿フォーム */}
        {showPostForm && (
          <div className={css({
            mb: '8'
          })}>
            <TimelinePostForm
              completedTodoId={selectedCompletedTodo?.id}
              onClose={() => {
                setShowPostForm(false);
                setSelectedCompletedTodo(null);
              }}
            />
          </div>
        )}

        {/* 投稿一覧 */}
        {isLoading ? (
          <div className={css({
            textAlign: 'center',
            py: '12'
          })}>
            <div className={css({
              fontSize: 'lg',
              color: 'gray.600'
            })}>
              読み込み中...
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className={css({
            textAlign: 'center',
            py: '12'
          })}>
            <div className={css({
              fontSize: 'lg',
              color: 'gray.600',
              mb: '4'
            })}>
              まだ投稿がありません
            </div>
            <p className={css({
              color: 'gray.500'
            })}>
              最初の投稿をしてみましょう！
            </p>
          </div>
        ) : (
          <div className={css({
            spaceY: '6'
          })}>
            {posts.map((post) => (
              <div
                key={post.id}
                className={css({
                  bg: 'white',
                  rounded: 'lg',
                  shadow: 'md',
                  overflow: 'hidden'
                })}
              >
                {/* 投稿ヘッダー */}
                <div className={css({
                  p: '6',
                  borderBottom: '1px solid',
                  borderColor: 'gray.200',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                })}>
                  <div className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4'
                  })}>
                    <div className={css({
                      w: '12',
                      h: '12',
                      bg: 'blue.100',
                      rounded: 'full',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'lg',
                      fontWeight: 'bold',
                      color: 'blue.600'
                    })}>
                      {post.user_profile?.icon_url ? (
                        <img
                          src={post.user_profile.icon_url}
                          alt="ユーザーアイコン"
                          className={css({
                            w: 'full',
                            h: 'full',
                            rounded: 'full',
                            objectFit: 'cover'
                          })}
                        />
                      ) : (
                        post.user_profile?.username?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <h2 className={css({
                        fontSize: 'lg',
                        fontWeight: 'bold',
                        color: 'gray.900'
                      })}>
                        {post.user_profile?.full_name || post.user_profile?.username || '匿名ユーザー'}
                      </h2>
                      <p className={css({
                        fontSize: 'sm',
                        color: 'gray.600'
                      })}>
                        {new Date(post.created_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* TODO完了バッジ */}
                {post.todo_item && (
                  <div className={css({
                    p: '4',
                    bg: 'green.50',
                    borderBottom: '1px solid',
                    borderColor: 'green.200'
                  })}>
                    <div className={css({
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2',
                      px: '3',
                      py: '1',
                      bg: 'green.100',
                      color: 'green.800',
                      rounded: 'full',
                      fontSize: 'sm',
                      fontWeight: 'medium'
                    })}>
                      <span>✅</span>
                      <span>完了したTODO: {post.todo_item.task}</span>
                    </div>
                  </div>
                )}

                {/* 投稿内容 */}
                <div className={css({
                  p: '6'
                })}>
                  <div
                    className={css({
                      maxW: 'none',
                      '& h1, & h2, & h3': {
                        color: 'gray.900',
                        fontWeight: 'bold'
                      },
                      '& strong': {
                        color: 'gray.900'
                      },
                      '& code': {
                        bg: 'gray.200',
                        px: '1',
                        py: '0.5',
                        rounded: 'sm',
                        fontSize: 'sm'
                      },
                      '& p': {
                        mb: '4',
                        lineHeight: '1.6'
                      }
                    })}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
                  />
                </div>

                {/* アクションボタン */}
                <div className={css({
                  p: '6',
                  borderTop: '1px solid',
                  borderColor: 'gray.200',
                  bg: 'gray.50'
                })}>
                  <div className={css({
                    display: 'flex',
                    gap: '4',
                    justifyContent: 'center'
                  })}>
                    <button className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      px: '4',
                      py: '2',
                      bg: 'white',
                      color: 'gray.700',
                      rounded: 'md',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      border: '1px solid',
                      borderColor: 'gray.300',
                      transition: 'all 0.2s',
                      _hover: {
                        bg: 'gray.50'
                      }
                    })}>
                      <span>❤️</span>
                      いいね
                    </button>
                    <button className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      px: '4',
                      py: '2',
                      bg: 'white',
                      color: 'gray.700',
                      rounded: 'md',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      border: '1px solid',
                      borderColor: 'gray.300',
                      transition: 'all 0.2s',
                      _hover: {
                        bg: 'gray.50'
                      }
                    })}>
                      <span>💬</span>
                      コメント
                    </button>
                    <Link
                      href={`/timeline/${post.id}`}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        px: '4',
                        py: '2',
                        bg: 'white',
                        color: 'gray.700',
                        rounded: 'md',
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        border: '1px solid',
                        borderColor: 'gray.300',
                        transition: 'all 0.2s',
                        textDecoration: 'none',
                        _hover: {
                          bg: 'gray.50'
                        }
                      })}
                    >
                      <span>👁️</span>
                      詳細を見る
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimelinePage() {
  return (
    <Suspense fallback={
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
            fontSize: 'lg',
            color: 'gray.600'
          })}>
            読み込み中...
          </div>
        </div>
      </div>
    }>
      <TimelineContent />
    </Suspense>
  );
}
