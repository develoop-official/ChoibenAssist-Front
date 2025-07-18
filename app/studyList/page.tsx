'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '../../styled-system/css';
import StudyRecordList from '../components/StudyRecordList';
import { useStudyRecords } from '../hooks/useStudyRecords';
import { useTodos } from '../hooks/useTodos';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function StudyListPage() {
  const { user, loading: authLoading } = useAuth();
  const { records, loading: recordsLoading, error, deleteRecord } = useStudyRecords();
  const { todos, loading: todosLoading } = useTodos();
  const router = useRouter();

  // 完了済みTODOのみをフィルタリング
  const completedTodos = todos.filter(todo => todo.status === 'completed');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
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
          <button
            onClick={() => router.push('/post')}
            className={css({
              px: '4',
              py: '2',
              bg: '#90EE90', // 薄緑色
              color: 'white',
              rounded: 'md',
              fontSize: 'sm',
              fontWeight: 'medium',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              _hover: {
                bg: '#7FDD7F' // 少し濃い薄緑色
              }
            })}
          >
            📝 新規投稿
          </button>
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
        {/* 左側: 学習記録一覧 */}
        <div>
          <StudyRecordList records={records} loading={recordsLoading} error={error} onDelete={deleteRecord} />
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
