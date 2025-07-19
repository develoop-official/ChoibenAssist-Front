'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { css } from '../../styled-system/css';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useTodos } from '../hooks/useTodos';

export default function StudyListPage() {
  const { user, loading: authLoading } = useAuth();
  const { todos, loading: todosLoading } = useTodos();
  const router = useRouter();

  // 完了済みTODOのみをフィルタリング
  const completedTodos = todos.filter(todo => todo.status === 'completed');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
            onClick={() => router.push('/login')}
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
      maxW: '7xl',
      mx: 'auto',
      px: '6',
      py: '8'
    })}>
      <div className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: '6'
      })}>
        <h2 className={css({
          fontSize: '2xl',
          fontWeight: 'bold',
          color: 'gray.900'
        })}>
          学習記録一覧
        </h2>
        <div className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '4'
        })}>
          <span className={css({
            fontSize: 'sm',
            color: 'gray.500'
          })}>
            最新順
          </span>
        </div>
      </div>

      {/* 2カラムレイアウト */}
      <div className={css({
        display: 'grid',
        gridTemplateColumns: {
          base: '1fr',
          lg: '2fr 1fr'
        },
        gap: '8',
        alignItems: 'start'
      })}>
        {/* 左側: 全TODOリスト */}
        <div>
          <div className={css({
            bg: 'white',
            rounded: 'xl',
            shadow: 'md',
            border: '1px solid',
            borderColor: 'gray.200',
            p: '6'
          })}>
            <h3 className={css({
              fontSize: 'xl',
              fontWeight: 'bold',
              color: 'gray.900',
              mb: '4',
              display: 'flex',
              alignItems: 'center',
              gap: '2'
            })}>
              📋 全TODOリスト
              <span className={css({
                bg: 'blue.100',
                color: 'blue.700',
                px: '2',
                py: '1',
                rounded: 'full',
                fontSize: 'xs',
                fontWeight: 'bold'
              })}>
                {todos.length}
              </span>
            </h3>

            {todosLoading ? (
              <LoadingSpinner text="TODOを読み込み中..." />
            ) : todos.length === 0 ? (
              <div className={css({
                textAlign: 'center',
                py: '8',
                color: 'gray.500'
              })}>
                <div className={css({
                  fontSize: '2xl',
                  mb: '2'
                })}>
                  📝
                </div>
                <p className={css({
                  fontSize: 'sm'
                })}>
                  まだTODOがありません
                </p>
              </div>
            ) : (
              <div className={css({
                spaceY: '3'
              })}>
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    className={css({
                      p: '4',
                      bg: todo.status === 'completed' ? 'green.50' : 'gray.50',
                      border: '1px solid',
                      borderColor: todo.status === 'completed' ? 'green.200' : 'gray.200',
                      rounded: 'md',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '3'
                    })}
                  >
                    <div className={css({
                      w: '3',
                      h: '3',
                      bg: todo.status === 'completed' ? 'green.500' : 'gray.400',
                      rounded: 'full',
                      mt: '1',
                      flexShrink: '0'
                    })} />
                    <div className={css({
                      flex: '1',
                      minW: '0'
                    })}>
                      <div className={css({
                        fontSize: 'sm',
                        color: todo.status === 'completed' ? 'green.800' : 'gray.800',
                        fontWeight: 'medium',
                        lineHeight: '1.4',
                        textDecoration: todo.status === 'completed' ? 'line-through' : 'none'
                      })}>
                        {todo.task}
                      </div>
                      <div className={css({
                        fontSize: 'xs',
                        color: 'blue.600',
                        mt: '1',
                        fontWeight: 'medium'
                      })}>
                        学習時間: {todo.study_time}時間
                      </div>
                      <div className={css({
                        fontSize: 'xs',
                        color: todo.status === 'completed' ? 'green.600' : 'gray.500',
                        mt: '1'
                      })}>
                        {todo.status === 'completed' ? '完了日' : '作成日'}: {new Date(todo.created_at).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右側: 完了済みTODOリスト */}
        <div className={css({
          bg: 'white',
          rounded: 'xl',
          shadow: 'md',
          border: '1px solid',
          borderColor: 'gray.200',
          p: '6',
          h: 'fit-content',
          position: 'sticky',
          top: '8'
        })}>
          <h3 className={css({
            fontSize: 'xl',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '4',
            display: 'flex',
            alignItems: 'center',
            gap: '2'
          })}>
            ✅ 完了済みTODO
            <span className={css({
              bg: 'green.100',
              color: 'green.700',
              px: '2',
              py: '1',
              rounded: 'full',
              fontSize: 'xs',
              fontWeight: 'bold'
            })}>
              {completedTodos.length}
            </span>
          </h3>

          {todosLoading ? (
            <LoadingSpinner text="TODOを読み込み中..." />
          ) : completedTodos.length === 0 ? (
            <div className={css({
              textAlign: 'center',
              py: '8',
              color: 'gray.500'
            })}>
              <div className={css({
                fontSize: '2xl',
                mb: '2'
              })}>
                🎯
              </div>
              <p className={css({
                fontSize: 'sm'
              })}>
                まだ完了したTODOはありません
              </p>
            </div>
          ) : (
            <div className={css({
              spaceY: '3'
            })}>
              {completedTodos.map(todo => (
                <div
                  key={todo.id}
                  className={css({
                    p: '3',
                    bg: 'green.50',
                    border: '1px solid',
                    borderColor: 'green.200',
                    rounded: 'md',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '3'
                  })}
                >
                  <div className={css({
                    w: '2',
                    h: '2',
                    bg: 'green.500',
                    rounded: 'full',
                    mt: '2',
                    flexShrink: '0'
                  })} />
                  <div className={css({
                    flex: '1',
                    minW: '0'
                  })}>
                    <div className={css({
                      fontSize: 'sm',
                      color: 'green.800',
                      fontWeight: 'medium',
                      lineHeight: '1.4'
                    })}>
                      {todo.task}
                    </div>
                    <div className={css({
                      fontSize: 'xs',
                      color: 'green.600',
                      mt: '1'
                    })}>
                      完了日: {todo.updated_at.slice(0, 10)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={css({
            mt: '4',
            pt: '4',
            borderTop: '1px solid',
            borderColor: 'gray.200'
          })}>
            <button
              onClick={() => router.push('/todoList')}
              className={css({
                w: 'full',
                px: '3',
                py: '2',
                bg: 'blue.50',
                color: 'blue.700',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                border: '1px solid',
                borderColor: 'blue.200',
                _hover: {
                  bg: 'blue.100'
                },
                transition: 'all 0.2s'
              })}
            >
              📋 全TODOリストを見る
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
