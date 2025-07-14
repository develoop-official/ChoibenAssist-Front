"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useRouter } from "next/navigation";
import { css } from "../../styled-system/css";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import dayjs from "dayjs";

// 型定義
interface RecordItem {
  created_at: string;
  duration: number;
}

interface ChartData {
  date: string;
  total: number;
}

export default function StudyGraphPage() {
  const supabase = createClientComponentClient();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      const { data: records, error } = await supabase
        .from("study_records")
        .select("created_at, duration")
        .returns<RecordItem[]>()
        .order("created_at", { ascending: true });

      if (error) {
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

      // --- 日付ごとに合計 duration を集計 ---
      const grouped = records?.reduce<Record<string, number>>((acc, r) => {
        const date = dayjs(r.created_at).format("YYYY-MM-DD");
        acc[date] = (acc[date] || 0) + r.duration;
        return acc;
      }, {});

      // --- すべての日付でChartDataを作成（0埋め）---
      const chartData: ChartData[] = allDates.map(date => ({
        date,
        total: grouped?.[date] || 0
      }));

      setData(chartData);
      setLoading(false);
    }
    fetchRecords();
  }, [supabase]);

  // --- カスタムツールチップ ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = dayjs(label);
      return (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>{d.format("M/D")}</div>
          <div style={{ color: "#3b82f6" }}>{payload[0].value} 分</div>
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
          <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "primary.700" })}>学習時間の推移</h2>
        </div>
        <div className={css({ flex: 1, minH: "12rem", minWidth: { base: "600px", md: "1000px" } })}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} minTickGap={10} />
                <YAxis label={{ value: "分", angle: -90, position: "insideLeft" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 7, fill: "#3b82f6" }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className={css({ textAlign: "center", py: "8", color: "gray.500" })}>学習記録がありません</div>
          )}
        </div>
      </div>
    </main>
  );
} 