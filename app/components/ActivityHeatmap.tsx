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

      // デフォルトで過去365日を表示
      const defaultStartDate = startDate || dayjs().subtract(365, 'days').toDate();
      const defaultEndDate = endDate || new Date();
      
      // 日付範囲を状態に保存
      setDateRange({ start: defaultStartDate, end: defaultEndDate });

      console.log('ActivityHeatmap: データ取得開始', {
        userId,
        startDate: dayjs(defaultStartDate).format('YYYY-MM-DD'),
        endDate: dayjs(defaultEndDate).format('YYYY-MM-DD')
      });

      // TODO完了データを取得
      const { data: todos, error } = await supabase
        .from('todo_items')
        .select('updated_at, created_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('updated_at', dayjs(defaultStartDate).format('YYYY-MM-DD'))
        .lte('updated_at', dayjs(defaultEndDate).format('YYYY-MM-DD'));

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
        lastTodo: todos?.[todos.length - 1]
      });

      // 日付範囲内のすべての日付を生成
      const dateRange: string[] = [];
      let currentDate = dayjs(defaultStartDate);
      while (currentDate.isBefore(dayjs(defaultEndDate)) || currentDate.isSame(dayjs(defaultEndDate), 'day')) {
        dateRange.push(currentDate.format('YYYY-MM-DD'));
        currentDate = currentDate.add(1, 'day');
      }

      // 日付ごとにTODO完了数を集計
      const todoCountByDate: Record<string, number> = {};
      todos?.forEach(todo => {
        if (todo.updated_at) {
          const date = dayjs(todo.updated_at).format('YYYY-MM-DD');
          todoCountByDate[date] = (todoCountByDate[date] || 0) + 1;
        }
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
  }, [userId, startDate, endDate]);

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

  const getTooltipText = (data: ActivityData): string => {
    const date = dayjs(data.date).format('YYYY年M月D日');
    if (data.count === 0) {
      return `${date}: TODO完了なし`;
    }
    return `${date}: ${data.count}個のTODOを完了`;
  };

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
      
      if (dayOfWeek === 6 || index === activityData.length - 1) {
        // 土曜日または最後のデータの場合、週を完成させる
        while (currentWeek.length < 7) {
          currentWeek.push({ date: '', count: 0, level: 0 });
        }
        weeks.push(currentWeek);
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
          学習アクティビティ
        </h3>
        <div className={css({
          display: 'flex',
          gap: '4',
          fontSize: 'sm',
          color: 'gray.600'
        })}>
          <span>総完了: {totalContributions}個</span>
          <span>連続: {streakDays}日</span>
        </div>
      </div>

      {/* 月ラベル */}
      <div className={css({
        display: 'flex',
        gap: '1',
        mb: '2',
        fontSize: 'xs',
        color: 'gray.500',
        justifyContent: 'space-between'
      })}>
        {dateRange && Array.from({ length: 12 }, (_, i) => {
          const month = dayjs(dateRange.start).add(i, 'month');
          return (
            <span key={i} className={css({ minW: '8', textAlign: 'center' })}>
              {month.format('M月')}
            </span>
          );
        })}
      </div>

      {/* ヒートマップグリッド */}
      <div className={css({
        display: 'flex',
        gap: '1',
        overflowX: 'auto',
        pb: '2'
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
            gap: '1'
          })}>
            {week.map((data, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={css({
                  w: '3',
                  h: '3',
                  rounded: 'sm',
                  cursor: data.date ? 'pointer' : 'default',
                  position: 'relative',
                  _hover: data.date ? { opacity: '0.8' } : {}
                })}
                style={{
                  backgroundColor: data.date ? getColorForLevel(data.level) : 'transparent'
                }}
                title={data.date ? getTooltipText(data) : ''}
              />
            ))}
          </div>
        ))}
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
    </div>
  );
}
