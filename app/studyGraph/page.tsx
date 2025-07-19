"use client";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { supabase } from "../../lib/supabase";
import { css } from "../../styled-system/css";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// 型定義
interface TodoItem {
  created_at: string;
  title: string;
  priority: string;
  user_id: string;
}

// 日付ごとに各優先度の合計を持つ
type ChartData = {
  date: string;
  [priority: string]: string | number;
};

export default function StudyGraphPage() {
  const [data, setData] = useState<ChartData[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodos() {
      setLoading(true);
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: todos, error } = await supabase
        .from("todo_items")
        .select("created_at, title, priority, user_id")
        .returns<TodoItem[]>()
        .order("created_at", { ascending: true });

      if (error) {
        console.error("TODO取得エラー:", error);
        setLoading(false);
        return;
      }

      // --- 今月の1日〜月末までの日付リストを生成 ---
      const today = dayjs();
      const startOfMonth = today.startOf("month");
      const endOfMonth = today.endOf("month");
      const daysInMonth = endOfMonth.date();
      const allDates: string[] = [];
      for (let i = 1; i <= daysInMonth; i++) {
        allDates.push(startOfMonth.date(i).format("YYYY-MM-DD"));
      }

      // --- 優先度一覧を抽出 ---
      const prioritySet = new Set<string>();
      todos?.forEach(t => prioritySet.add(t.priority));
      const priorityList = Array.from(prioritySet);
      setPriorities(priorityList);

      // --- 日付×優先度ごとにTODO数を集計 ---
      const grouped: Record<string, Record<string, number>> = {};
      todos?.forEach(t => {
        const date = dayjs(t.created_at).format("YYYY-MM-DD");
        if (!grouped[date]) grouped[date] = {};
        grouped[date][t.priority] = (grouped[date][t.priority] || 0) + 1;
      });

      // --- すべての日付でChartDataを作成（0埋め）---
      const chartData: ChartData[] = allDates.map(date => {
        const row: ChartData = { date };
        priorityList.forEach(priority => {
          row[priority] = grouped[date]?.[priority] || 0;
        });
        return row;
      });

      setData(chartData);
      setLoading(false);
    }
    fetchTodos();
  }, []);

  // --- カスタムツールチップ ---
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      value: number;
      fill: string;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const d = dayjs(label);
      return (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>{d.format("M/D")}</div>
          {payload.map((p) => (
            <div key={p.dataKey} style={{ color: p.fill, fontWeight: 600 }}>
              {p.value} 件 <span style={{ fontSize: 12, marginLeft: 8 }}>{p.dataKey}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // --- X軸ラベルを6/1形式で表示 ---
  const formatXAxis = (tick: string) => dayjs(tick).format("M/D");

  if (loading) {
    return (
      <div className={css({ minH: "60vh", display: "flex", alignItems: "center", justifyContent: "center" })}>
        <LoadingSpinner />
      </div>
    );
  }

  // --- 優先度ごとに色を決める ---
  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      "高": "#ef4444", // red
      "中": "#f59e0b", // amber
      "低": "#10b981", // emerald
    };
    return colorMap[priority] || "#6b7280"; // gray as default
  };

  return (
    <main className={css({ maxW: "full", mx: "auto", px: "2", py: "4" })}>
      <div className={css({
        w: "100vw",
        maxW: "100vw",
        mx: "auto",
        bg: "white",
        rounded: "2xl",
        shadow: "lg",
        p: { base: "2", md: "6" },
        minH: "20rem",
        display: "flex",
        flexDirection: "column",
        gap: "4",
        mb: "8",
        overflowX: "auto"
      })}>
        <div className={css({ mb: "4" })}>
          <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "primary.700" })}>TODO作成数の推移</h2>
        </div>
        <div className={css({ flex: 1, minH: "12rem", minWidth: { base: "600px", md: "1000px" } })}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} minTickGap={10} />
                <YAxis label={{ value: "件数", angle: -90, position: "insideLeft" }} />
                <Tooltip content={<CustomTooltip />} />
                {priorities.map(priority => (
                  <Bar key={priority} dataKey={priority} stackId="a" fill={getPriorityColor(priority)} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={css({ textAlign: "center", py: "8", color: "gray.500" })}>TODO記録がありません</div>
          )}
        </div>
      </div>
    </main>
  );
}
