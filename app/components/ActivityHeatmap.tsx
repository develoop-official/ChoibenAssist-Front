'use client';

import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';
import { css } from '../../styled-system/css';

interface ActivityData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // GitHub草風のレベル
}

interface ActivityHeatmapProps {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

export default function ActivityHeatmap({ userId, startDate, endDate }: ActivityHeatmapProps) {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [todoDetailsByDate, setTodoDetailsByDate] = useState<Record<string, any[]>>({});
  const [tooltip, setTooltip] = useState<{ 
    show: boolean; 
    content: any; 
    x: number; 
    y: number;
    insideTooltip: boolean;
  }>({
    show: false,
    content: null,
    x: 0,
    y: 0,
    insideTooltip: false
  });

  const fetchActivityData = useCallback(async () => {
    if (!supabase || !userId) {
      console.warn('ActivityHeatmap: SupabaseまたはuserIdが未設定', {
        hasSupabase: !!supabase,
        userId,
        supabaseClient: supabase ? 'initialized' : 'not initialized'
      });
      return;
    }

    try {
      setLoading(true);

      // Supabaseクライアントの状態を確認
      const { data: { user } } = await supabase.auth.getUser();
      console.log('ActivityHeatmap: 認証状態確認', {
        currentUserId: userId,
        authenticatedUser: user?.id,
        isAuthenticated: !!user,
        userEmail: user?.email
      });

      // デフォルトで現在の年の1年間を表示
      const currentYear = dayjs().year();
      const defaultStartDate = startDate || dayjs(`${currentYear}-01-01`).toDate();
      const defaultEndDate = endDate || dayjs(`${currentYear}-12-31`).toDate();
      
      console.log('ActivityHeatmap: 日付範囲設定', {
        defaultStartDate: dayjs(defaultStartDate).format('YYYY-MM-DD'),
        defaultEndDate: dayjs(defaultEndDate).format('YYYY-MM-DD'),
        currentDate: dayjs().format('YYYY-MM-DD')
      });
      
      // 日付範囲を状態に保存
      setDateRange({ start: defaultStartDate, end: defaultEndDate });

      console.log('ActivityHeatmap: データ取得開始', {
        userId,
        startDate: dayjs(defaultStartDate).format('YYYY-MM-DD'),
        endDate: dayjs(defaultEndDate).format('YYYY-MM-DD')
      });

      // TODO完了データを取得（完了済みのTODOのみ）
      const { data: todos, error } = await supabase
        .from('todo_items')
        .select('updated_at, created_at, status, task')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('updated_at', dayjs(defaultStartDate).format('YYYY-MM-DD'))
        .lte('updated_at', dayjs(defaultEndDate).format('YYYY-MM-DD'))
        .order('updated_at', { ascending: true });

      if (error) {
        console.error('ActivityHeatmap: Supabaseエラー詳細:', {
          error,
          errorMessage: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint
        });
        throw error;
      }

      console.log('ActivityHeatmap: データ取得成功', {
        todosCount: todos?.length || 0,
        firstTodo: todos?.[0],
        lastTodo: todos?.[todos.length - 1],
        firstTodoDate: todos?.[0] ? dayjs(todos[0].updated_at).format('YYYY-MM-DD') : null,
        sampleTodos: todos?.slice(0, 3).map(todo => ({
          updated_at: todo.updated_at,
          created_at: todo.created_at,
          task: todo.task,
          status: todo.status
        }))
      });

      // 日付範囲内のすべての日付を生成
      const dateRange: string[] = [];
      let currentDate = dayjs(defaultStartDate);
      while (currentDate.isBefore(dayjs(defaultEndDate)) || currentDate.isSame(dayjs(defaultEndDate), 'day')) {
        dateRange.push(currentDate.format('YYYY-MM-DD'));
        currentDate = currentDate.add(1, 'day');
      }

      // 日付ごとにTODO完了数を集計（updated_atを完了日として使用）
      const todoCountByDate: Record<string, number> = {};
      const todoDetailsByDate: Record<string, any[]> = {};
      
      todos?.forEach(todo => {
        if (todo.updated_at) {
          // UTC時間から日付部分のみを抽出（タイムゾーン変換を避ける）
          // 例: '2025-07-19T15:38:28.465733+00:00' → '2025-07-19'
          const utcDate = todo.updated_at.split('T')[0];
          todoCountByDate[utcDate] = (todoCountByDate[utcDate] || 0) + 1;
          
          // 詳細情報も記録
          if (!todoDetailsByDate[utcDate]) {
            todoDetailsByDate[utcDate] = [];
          }
          todoDetailsByDate[utcDate].push({
            updated_at: todo.updated_at,
            created_at: todo.created_at,
            status: todo.status,
            task: todo.task,
            formatted_date: utcDate
          });
        }
      });

      console.log('ActivityHeatmap: 日付別集計完了', {
        uniqueDates: Object.keys(todoCountByDate).length,
        sampleDates: Object.keys(todoCountByDate).slice(0, 5),
        totalDateRange: dateRange.length,
        sampleTodoDetails: Object.entries(todoDetailsByDate).slice(0, 3).map(([date, details]) => ({
          date,
          count: details.length,
          details: details.slice(0, 2) // 最初の2つのTODOの詳細
        }))
      });

      // アクティビティレベルを計算（0-4の5段階）
      const maxCount = Math.max(...Object.values(todoCountByDate), 1);
      const activityData: ActivityData[] = dateRange.map(date => {
        const count = todoCountByDate[date] || 0;
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        
        if (count > 0) {
          const ratio = count / maxCount;
          if (ratio >= 0.75) level = 4;
          else if (ratio >= 0.5) level = 3;
          else if (ratio >= 0.25) level = 2;
          else level = 1;
        }

        return { date, count, level };
      });

      setActivityData(activityData);
      setTodoDetailsByDate(todoDetailsByDate);

      console.log('ActivityHeatmap: アクティビティデータ生成完了', {
        totalDays: activityData.length,
        daysWithActivity: activityData.filter(d => d.count > 0).length,
        sampleActivityData: activityData.slice(0, 10),
        todoDetailsCount: Object.keys(todoDetailsByDate).length,
        sampleTodoDetails: Object.entries(todoDetailsByDate).slice(0, 3).map(([date, details]) => ({
          date,
          count: details.length,
          details: details.slice(0, 2)
        }))
      });
    } catch (error) {
      console.error('ActivityHeatmap: エラー詳細:', {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorStringified: JSON.stringify(error, null, 2)
      });
    } finally {
      setLoading(false);
    }
  }, [userId, startDate, endDate, supabase]);

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  const getColorForLevel = (level: number): string => {
    const colors = {
      0: '#ebedf0', // 薄いグレー
      1: '#9be9a8', // 薄い緑
      2: '#40c463', // 中程度の緑
      3: '#30a14e', // 濃い緑
      4: '#216e39'  // 最も濃い緑
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  const getTooltipContent = useCallback((data: ActivityData) => {
    const date = dayjs(data.date).format('YYYY年M月D日');
    const dayOfWeek = dayjs(data.date).format('ddd');
    
    if (data.count === 0) {
      return {
        date: `${date} (${dayOfWeek})`,
        summary: '学習記録なし',
        details: [],
        totalTime: 0
      };
    }
    
    // その日のTODO詳細を取得
    const dayTodos = todoDetailsByDate[data.date] || [];
    
    // 学習時間を計算（作成時間から完了時間までの差分）
    const todoDetails = dayTodos.map((todo: any) => {
      const completedTime = dayjs(todo.updated_at);
      const createdTime = dayjs(todo.created_at);
      const duration = completedTime.diff(createdTime, 'minute');
      const durationText = duration > 60 
        ? `${Math.floor(duration / 60)}時間${duration % 60}分`
        : `${duration}分`;
      
      return {
        time: completedTime.format('HH:mm'),
        task: todo.task || 'タスクなし',
        duration: durationText,
        durationMinutes: duration
      };
    });
    
    // 総学習時間を計算
    const totalMinutes = todoDetails.reduce((sum, todo) => sum + todo.durationMinutes, 0);
    const totalTimeText = totalMinutes > 60 
      ? `${Math.floor(totalMinutes / 60)}時間${totalMinutes % 60}分`
      : `${totalMinutes}分`;
    
    return {
      date: `${date} (${dayOfWeek})`,
      summary: `${data.count}個の学習を完了`,
      details: todoDetails,
      totalTime: totalTimeText,
      totalMinutes
    };
  }, []);

  const showTooltip = useCallback((event: any, data: ActivityData) => {
    if (!data.date) return;
    
    const content = getTooltipContent(data);
    
    // 画面幅を考慮してツールチップの位置を調整
    const tooltipWidth = 400; // ツールチップの推定幅
    const tooltipHeight = 200; // ツールチップの推定高さ
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let x = event.clientX + 10;
    let y = event.clientY - 10;
    
    // 右端に収まらない場合は左側に表示
    if (x + tooltipWidth > windowWidth) {
      x = event.clientX - tooltipWidth - 10;
    }
    
    // 下端に収まらない場合は上側に表示
    if (y + tooltipHeight > windowHeight) {
      y = event.clientY - tooltipHeight - 10;
    }
    
    // 最小位置を確保
    x = Math.max(10, x);
    y = Math.max(10, y);
    
    setTooltip({
      show: true,
      content,
      x,
      y,
      insideTooltip: false
    });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, show: false, insideTooltip: false }));
  }, []);

  // 週ごとにデータをグループ化
  const getWeeksData = () => {
    const weeks: ActivityData[][] = [];
    let currentWeek: ActivityData[] = [];
    
    activityData.forEach((data, index) => {
      const dayOfWeek = dayjs(data.date).day(); // 0 = 日曜日
      
      if (index === 0) {
        // 最初の週の場合、日曜日でない場合は空のセルで埋める
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: '', count: 0, level: 0 });
        }
      }
      
      currentWeek.push(data);
      
      // 土曜日（6）または最後のデータの場合、週を完成させる
      if (dayOfWeek === 6 || index === activityData.length - 1) {
        // 週を7日分に完成させる
        while (currentWeek.length < 7) {
          currentWeek.push({ date: '', count: 0, level: 0 });
        }
        weeks.push([...currentWeek]); // 配列のコピーを作成
        currentWeek = [];
      }
    });
    
    return weeks;
  };

  const totalContributions = activityData.reduce((sum, data) => sum + data.count, 0);
  const streakDays = calculateStreakDays();

  function calculateStreakDays(): number {
    let streak = 0;
    for (let i = activityData.length - 1; i >= 0; i--) {
      if (activityData[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

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
        <div className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          h: '40'
        })}>
          <div className={css({
            w: '8',
            h: '8',
            border: '2px solid',
            borderColor: 'primary.200',
            borderTopColor: 'primary.600',
            rounded: 'full'
          })} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  const weeksData = getWeeksData();
  
  // データがあるセルの総数を計算
  const cellsWithData = weeksData.flat().filter(data => data.date && data.count > 0);
  
  console.log('ActivityHeatmap: 週データ生成完了', {
    totalWeeks: weeksData.length,
    cellsWithData: cellsWithData.length,
    firstWeek: weeksData[0]?.map(d => ({ date: d.date, count: d.count })),
    lastWeek: weeksData[weeksData.length - 1]?.map(d => ({ date: d.date, count: d.count })),
    sampleCellsWithData: cellsWithData.slice(0, 5)
  });

  return (
    <div className={css({
      bg: 'white',
      rounded: '2xl',
      shadow: 'md',
      p: { base: '4', md: '6' },
      border: '1px solid',
      borderColor: 'gray.100',
      display: { base: 'block', md: 'block' } // モバイルでも表示
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
          {dayjs().year()}年 TODO完了アクティビティ
        </h3>
        <div className={css({
          display: { base: 'flex', md: 'flex' },
          flexDirection: { base: 'column', md: 'row' },
          gap: { base: '2', md: '4' },
          fontSize: { base: 'xs', md: 'sm' },
          color: 'gray.600'
        })}>
          <span>総完了: {totalContributions}個</span>
          <span>連続: {streakDays}日</span>
        </div>
      </div>

      {/* 月ラベルを絶対配置でグリッドの上に重ねる */}
      <div className={css({
        position: 'relative',
        border: '1px solid',
        borderColor: 'gray.200',
        rounded: 'md'
      })}>
        {/* スクロールコンテナ（月ラベル分の余白を追加） */}
        <div className={css({
          overflowX: 'auto',
          pt: '8', // 月ラベル分の余白
        })}>
        
        </div>

        {/* 月ラベル（絶対配置でグリッドの上に重ねる） */}
        {dateRange && (() => {
          const monthPositions: { month: string; weekIndex: number }[] = [];
          
          // 実際の完了済みデータに基づいて月の位置を計算
          if (activityData.length > 0) {
            const firstDate = dayjs(activityData[0].date);
            const lastDate = dayjs(activityData[activityData.length - 1].date);
            
            // 実際にデータがある月のみを特定
            const monthsWithData = new Set<string>();
            const monthFirstWeeks = new Map<string, number>();
            
            // 完了済みデータから月を抽出
            activityData.forEach((data) => {
              if (data.count > 0) { // 実際にデータがある日のみ
                const date = dayjs(data.date);
                const monthKey = date.format('YYYY-MM');
                monthsWithData.add(monthKey);
                
                // その日付が何週目かを計算（最初の日付からの差分）
                const daysDiff = date.diff(firstDate, 'day');
                const weekIndex = Math.floor(daysDiff / 7);
                
                console.log('ActivityHeatmap: 完了済みデータ月ラベル計算', {
                  date: data.date,
                  monthKey,
                  count: data.count,
                  daysDiff,
                  weekIndex,
                  firstDate: firstDate.format('YYYY-MM-DD')
                });
                
                if (!monthFirstWeeks.has(monthKey) || weekIndex < monthFirstWeeks.get(monthKey)!) {
                  monthFirstWeeks.set(monthKey, weekIndex);
                }
              }
            });
            
            // 実際にデータがある月のラベルを生成
            monthFirstWeeks.forEach((weekIndex, monthKey) => {
              const monthDate = dayjs(monthKey + '-01');
              monthPositions.push({
                month: monthDate.format('M月'),
                weekIndex
              });
              
              console.log('ActivityHeatmap: 完了済みデータ月ラベル生成', {
                monthKey,
                month: monthDate.format('M月'),
                weekIndex,
                hasData: monthsWithData.has(monthKey)
              });
            });
            
            // 週インデックスでソート
            monthPositions.sort((a, b) => a.weekIndex - b.weekIndex);
            
            console.log('ActivityHeatmap: 完了済みデータ月ラベル最終結果', {
              totalMonthsWithData: monthsWithData.size,
              monthPositions: monthPositions.map(m => ({ month: m.month, weekIndex: m.weekIndex })),
              monthsWithData: Array.from(monthsWithData)
            });
            

          } else {
            // データがない場合は日付範囲から生成
            let currentMonth = dayjs(dateRange.start).startOf('month');
            const endMonth = dayjs(dateRange.end).endOf('month');
            
            while (currentMonth.isBefore(endMonth) || currentMonth.isSame(endMonth, 'month')) {
              // 月の開始日が日付範囲内の何週目かを計算
              const monthStartDate = currentMonth.startOf('month');
              const daysDiff = monthStartDate.diff(dayjs(dateRange.start), 'day');
              const weekIndex = Math.max(0, Math.floor(daysDiff / 7));
              
              monthPositions.push({
                month: currentMonth.format('M月'),
                weekIndex
              });
              
              currentMonth = currentMonth.add(1, 'month');
            }
          }
          
          // データが少ない場合は、日付範囲ベースの月ラベルも追加
          if (activityData.length > 0 && monthPositions.length < 3) {
            const firstDate = dayjs(activityData[0].date);
            const lastDate = dayjs(activityData[activityData.length - 1].date);
            
            let currentMonth = firstDate.startOf('month');
            const endMonth = lastDate.endOf('month');
            
            while (currentMonth.isBefore(endMonth) || currentMonth.isSame(endMonth, 'month')) {
              const monthKey = currentMonth.format('YYYY-MM');
              const existingMonth = monthPositions.find(m => m.month === currentMonth.format('M月'));
              
              if (!existingMonth) {
                const monthStartDate = currentMonth.startOf('month');
                const daysDiff = monthStartDate.diff(firstDate, 'day');
                const weekIndex = Math.max(0, Math.floor(daysDiff / 7));
                
                monthPositions.push({
                  month: currentMonth.format('M月'),
                  weekIndex
                });
              }
              
              currentMonth = currentMonth.add(1, 'month');
            }
            
            // 週インデックスでソート
            monthPositions.sort((a, b) => a.weekIndex - b.weekIndex);
          }
          
          // 実際にデータがある月のみを表示
          const monthsWithData = monthPositions.filter(({ month }) => {
            // 実際にデータがある月のみを表示
            return monthPositions.some(m => m.month === month);
          });
          
          // 重複する位置の月を除外（後から来る月を優先）
          const finalMonths = monthsWithData.filter((month, index) => {
            if (index === 0) return true; // 最初の月は必ず表示
            const prevMonth = monthsWithData[index - 1];
            const minGap = 6; // 6週間の間隔（約1.5ヶ月）
            const gap = month.weekIndex - prevMonth.weekIndex;
            return gap >= minGap;
          });
          
          return (
            <div className={css({
              position: 'absolute',
              top: 0,
              left: '6', // 曜日ラベル幅分だけ右にずらす
              right: 0,
              height: '8',
              pointerEvents: 'none', // クリックをグリッドに透過させる
              zIndex: 20,
            })}>
              {finalMonths.map(({ month, weekIndex }, i) => {
                const leftPx = weekIndex * 35; // 1週あたり35px
                
                // 画面幅を考慮して位置を調整
                const maxLeft = window.innerWidth - 100; // 右端の余白
                const adjustedLeft = Math.min(leftPx, maxLeft);
                
                return (
                  <div
                    key={i}
                    style={{ position: 'absolute', left: `${adjustedLeft}px` }}
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'bold',
                      color: 'blue.600',
                      bg: 'white',
                      px: '2',
                      py: '1',
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: 'blue.300',
                      boxShadow: 'sm',
                      whiteSpace: 'nowrap'
                    })}
                    title={`${month}の開始週 (週${weekIndex})`}
                  >
                    {month}
                  </div>
                );
              })}
            </div>
          );
        })()}

                  {/* ヒートマップグリッド */}
          <div className={css({
            display: 'flex',
            gap: '1',
            py: '2',
          })}>
        {/* 曜日ラベル */}
        <div className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '1',
          mr: '2'
        })}>
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div
              key={index}
              className={css({
                w: '3',
                h: '3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'xs',
                color: 'gray.400'
              })}
            >
              {index % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        {/* 週ごとのグリッド */}
        {weeksData.map((week, weekIndex) => (
          <div key={weekIndex} className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '1',

          })}>
            {week.map((data, dayIndex) => {
              return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                tabIndex={data.date ? 0 : -1}
                
                className={css({
                  w: '4',
                  h: '4',
                  rounded: 'sm',
                  cursor: data.date ? 'pointer' : 'default',
                  position: 'relative',
                  border: data.date ? '1px solid' : 'none',
                  borderColor: data.count > 0 ? 'gray.300' : 'gray.200',
                  _hover: data.date ? { 
                    opacity: '0.8',
                    transform: 'scale(1.1)',
                    zIndex: 10
                  } : {},
                  transition: 'all 0.2s ease-in-out'
                })}
                style={{
                  backgroundColor: data.date ? getColorForLevel(data.level) : 'transparent'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (data.date) {
                    showTooltip(e, data);
                  }
                }}
                onMouseEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (data.date) {
                    showTooltip(e, data);
                  }
                }}

                onMouseLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // 少し遅延を入れて、ツールチップの onMouseEnter を待つ
                  setTimeout(() => {
                    if (!tooltip.insideTooltip) {
                      hideTooltip();
                    }
                  }, 100);
                }}
              />
            );
            })}
          </div>
        ))}
        </div>
      </div>

      {/* レベル説明 */}
      <div className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '2',
        mt: '4',
        fontSize: 'xs',
        color: 'gray.500'
      })}>
        <span>少ない</span>
        <div className={css({ display: 'flex', gap: '1' })}>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={css({
                w: '2.5',
                h: '2.5',
                rounded: 'sm'
              })}
              style={{ backgroundColor: getColorForLevel(level) }}
            />
          ))}
        </div>
        <span>多い</span>
      </div>

      {/* カスタムツールチップ */}
      {tooltip.show && tooltip.content && (
        <div
          onMouseEnter={() => {
            setTooltip(t => ({ ...t, insideTooltip: true }));
          }}
          onMouseLeave={() => {
            setTooltip(t => ({ ...t, insideTooltip: false }));
            hideTooltip();
          }}
          className={css({
            position: 'fixed',
            top: tooltip.y,
            left: tooltip.x,
            bg: 'white',
            color: 'gray.900',
            p: '4',
            rounded: 'lg',
            fontSize: 'sm',
            zIndex: 9999,
            maxW: '96',
            boxShadow: 'xl',
            border: '1px solid',
            borderColor: 'gray.200',
            pointerEvents: 'auto'
          })}
          style={{
            zIndex: 9999,
            position: 'fixed'
          }}
        >
          {/* 日付とサマリー */}
          <div className={css({
            borderBottom: '1px solid',
            borderColor: 'gray.200',
            pb: '2',
            mb: '3'
          })}>
            <div className={css({
              fontWeight: 'bold',
              fontSize: 'md',
              color: 'gray.900',
              mb: '1'
            })}>
              {tooltip.content.date}
            </div>
            <div className={css({
              color: 'gray.600',
              fontSize: 'sm'
            })}>
              {tooltip.content.summary}
            </div>
            {tooltip.content.totalTime && (
              <div className={css({
                color: 'blue.600',
                fontWeight: 'bold',
                fontSize: 'sm',
                mt: '1'
              })}>
                総学習時間: {tooltip.content.totalTime}
              </div>
            )}
          </div>

          {/* 詳細リスト */}
          {tooltip.content.details && tooltip.content.details.length > 0 && (
            <div className={css({
              spaceY: '2'
            })}>
              {tooltip.content.details.map((detail: any, index: number) => (
                <div key={index} className={css({
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '2',
                  p: '2',
                  bg: 'gray.50',
                  rounded: 'md'
                })}>
                  <div className={css({
                    color: 'blue.600',
                    fontWeight: 'bold',
                    fontSize: 'xs',
                    minW: '12',
                    textAlign: 'center'
                  })}>
                    {detail.time}
                  </div>
                  <div className={css({
                    flex: '1',
                    fontSize: 'xs'
                  })}>
                    <div className={css({
                      fontWeight: 'medium',
                      mb: '1'
                    })}>
                      {detail.task}
                    </div>
                    <div className={css({
                      color: 'green.600',
                      fontSize: 'xs'
                    })}>
                      {detail.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
