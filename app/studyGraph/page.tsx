"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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
  subject: string;
}

// 日付ごとに各科目の合計を持つ
type ChartData = {
  date: string;
  [subject: string]: string | number;
};

export default function StudyGraphPage() {
  const [data, setData] = useState<ChartData[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: records, error } = await supabase
        .from("study_records")
        .select("created_at, duration, subject")
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

      // --- 科目一覧を抽出 ---
      const subjectSet = new Set<string>();
      records?.forEach(r => subjectSet.add(r.subject));
      const subjectList = Array.from(subjectSet);
      setSubjects(subjectList);

      // --- 日付×科目ごとにdurationを集計 ---
      const grouped: Record<string, Record<string, number>> = {};
      records?.forEach(r => {
        const date = dayjs(r.created_at).format("YYYY-MM-DD");
        if (!grouped[date]) grouped[date] = {};
        grouped[date][r.subject] = (grouped[date][r.subject] || 0) + r.duration;
      });

      // --- すべての日付でChartDataを作成（0埋め）---
      const chartData: ChartData[] = allDates.map(date => {
        const row: ChartData = { date };
        subjectList.forEach(sub => {
          row[sub] = grouped[date]?.[sub] || 0;
        });
        return row;
      });

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
          {payload.map((p: any) => (
            <div key={p.dataKey} style={{ color: p.fill, fontWeight: 600 }}>
              {p.value} 分 <span style={{ fontSize: 12, marginLeft: 8 }}>{p.dataKey}</span>
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

  // --- 科目ごとに色を決める ---
  const getSubjectColor = (subject: string) => {
    const hash = subject.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const colorPalette = [
      "#3b82f6", // blue
      "#22c55e", // green
      "#a21caf", // purple
      "#f59e42", // orange
      "#ec4899", // pink
      "#14b8a6"  // teal
    ];
    return colorPalette[Math.abs(hash) % colorPalette.length];
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
          <h2 className={css({ fontSize: "xl", fontWeight: "bold", color: "primary.700" })}>学習時間の推移</h2>
        </div>
        <div className={css({ flex: 1, minH: "12rem", minWidth: { base: "600px", md: "1000px" } })}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} minTickGap={10} />
                <YAxis label={{ value: "分", angle: -90, position: "insideLeft" }} />
                <Tooltip content={<CustomTooltip />} />
                {subjects.map(sub => (
                  <Bar key={sub} dataKey={sub} stackId="a" fill={getSubjectColor(sub)} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={css({ textAlign: "center", py: "8", color: "gray.500" })}>学習記録がありません</div>
          )}
        </div>
      </div>
    </main>
  );
} 