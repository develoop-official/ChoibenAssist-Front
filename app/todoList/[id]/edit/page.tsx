"use client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { supabase } from "../../../../lib/supabase";
import { css } from "../../../../styled-system/css";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { TodoItem } from "../../../types/todo-item";

export default function TodoEditPage() {
  const router = useRouter();
  const params = useParams();
  const todoId = params.id as string;
  const [todo, setTodo] = useState<TodoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    task: "",
    due_date: "",
    study_time: 60,
    priority: 3,
    goal: "",
    notes: ""
  });

  useEffect(() => {
    if (!todoId) return;
    const fetchTodo = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase!
          .from("todo_items")
          .select("*")
          .eq("id", todoId)
          .single();
        if (error) {
          setError("TODOが見つかりません");
          setTodo(null);
        } else {
          setTodo(data);
          setFormData({
            task: data.task,
            due_date: data.due_date || "",
            study_time: data.study_time || 60,
            priority: data.priority || 3,
            goal: data.goal || "",
            notes: data.notes || ""
          });
        }
      } catch {
        setError("TODOの取得に失敗しました");
        setTodo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTodo();
  }, [todoId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.task.trim()) {
      setError("タスク内容を入力してください");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { error } = await supabase!.from("todo_items")
        .update({
          task: formData.task.trim(),
          due_date: formData.due_date || null,
          study_time: formData.study_time,
          priority: formData.priority,
          goal: formData.goal.trim() || null,
          notes: formData.notes.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", todoId);
      if (error) throw error;
      router.push(`/todoList/${todoId}`);
    } catch {
      setError("TODOの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/todoList/${todoId}`);
  };

  if (loading) {
    return <LoadingSpinner text="TODOを取得中..." />;
  }
  if (error || !todo) {
    return <div className={css({ color: "red.500", textAlign: "center", py: "12" })}>{error || "TODOが見つかりません"}</div>;
  }

  return (
    <main className={css({ maxW: "2xl", mx: "auto", px: "4", py: "8" })}>
      <div className={css({ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: "6" })}>
        <Link
          href={`/todoList/${todoId}`}
          className={css({
            px: "4",
            py: "2",
            bg: "gray.500",
            color: "white",
            rounded: "md",
            fontWeight: "bold",
            fontSize: "sm",
            _hover: { bg: "gray.600" },
            transition: "all 0.2s",
            textDecoration: "none",
            display: "inline-block"
          })}
        >
          ← 詳細に戻る
        </Link>
      </div>

      <form onSubmit={handleSave} className={css({
        bg: "white",
        border: "1px solid",
        borderColor: "gray.200",
        rounded: "xl",
        p: "6",
        shadow: "md",
        spaceY: "6"
      })}>
        {/* タスク内容 */}
        <div>
          <label className={css({ fontWeight: "bold", color: "gray.700", mb: "2", display: "block" })}>
            タスク内容 *
          </label>
          <input
            type="text"
            value={formData.task}
            onChange={e => setFormData({ ...formData, task: e.target.value })}
            className={css({
              w: "full",
              px: "4",
              py: "3",
              border: "1px solid",
              borderColor: "gray.300",
              rounded: "lg",
              fontSize: "md",
              _focus: { outline: "none", ring: "2px", ringColor: "primary.400", borderColor: "primary.400" }
            })}
            placeholder="例: レポート提出、買い物、勉強..."
            required
          />
        </div>

        {/* 期限 */}
        <div>
          <label className={css({ fontWeight: "bold", color: "gray.700", mb: "2", display: "block" })}>
            期限
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
            className={css({
              w: "full",
              px: "4",
              py: "3",
              border: "1px solid",
              borderColor: "gray.300",
              rounded: "lg",
              fontSize: "md",
              _focus: { outline: "none", ring: "2px", ringColor: "primary.400", borderColor: "primary.400" }
            })}
          />
        </div>

        {/* 学習時間 */}
        <div>
          <label className={css({ fontWeight: "bold", color: "gray.700", mb: "2", display: "block" })}>
            学習時間（時間）
          </label>
          <input
            type="number"
            min="0.5"
            max="24"
            step="0.5"
            value={formData.study_time}
            onChange={e => setFormData({ ...formData, study_time: parseFloat(e.target.value) || 1 })}
            className={css({
              w: "full",
              px: "4",
              py: "3",
              border: "1px solid",
              borderColor: "gray.300",
              rounded: "lg",
              fontSize: "md",
              _focus: { outline: "none", ring: "2px", ringColor: "primary.400", borderColor: "primary.400" }
            })}
          />
        </div>

        {/* 優先度 */}
        <div>
          <label className={css({ fontWeight: "bold", color: "gray.700", mb: "2", display: "block" })}>
            優先度
          </label>
          <select
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            className={css({
              w: "full",
              px: "4",
              py: "3",
              border: "1px solid",
              borderColor: "gray.300",
              rounded: "lg",
              fontSize: "md",
              _focus: { outline: "none", ring: "2px", ringColor: "primary.400", borderColor: "primary.400" }
            })}
          >
            <option value={1}>高</option>
            <option value={2}>中</option>
            <option value={3}>低</option>
          </select>
        </div>

        {/* 目標 */}
        <div>
          <label className={css({ fontWeight: "bold", color: "gray.700", mb: "2", display: "block" })}>
            目標
          </label>
          <input
            type="text"
            value={formData.goal}
            onChange={e => setFormData({ ...formData, goal: e.target.value })}
            className={css({
              w: "full",
              px: "4",
              py: "3",
              border: "1px solid",
              borderColor: "gray.300",
              rounded: "lg",
              fontSize: "md",
              _focus: { outline: "none", ring: "2px", ringColor: "primary.400", borderColor: "primary.400" }
            })}
            placeholder="例: 80点以上を取る、完璧に仕上げる"
          />
        </div>

        {/* メモ */}
        <div>
          <label className={css({ fontWeight: "bold", color: "gray.700", mb: "2", display: "block" })}>
            メモ
          </label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className={css({
              w: "full",
              px: "4",
              py: "3",
              border: "1px solid",
              borderColor: "gray.300",
              rounded: "lg",
              fontSize: "md",
              resize: "vertical",
              _focus: { outline: "none", ring: "2px", ringColor: "primary.400", borderColor: "primary.400" }
            })}
            placeholder="追加のメモや注意事項があれば記入してください"
          />
        </div>

        {error && <div className={css({ color: "red.500", fontSize: "sm" })}>{error}</div>}

        {/* ボタン */}
        <div className={css({ display: "flex", gap: "4", pt: "4" })}>
          <button
            type="submit"
            className={css({
              px: "8",
              py: "3",
              bg: "primary.600",
              color: "white",
              rounded: "md",
              fontWeight: "bold",
              fontSize: "md",
              _hover: { bg: "primary.700" },
              transition: "all 0.2s",
              flex: "1"
            })}
            disabled={saving}
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            className={css({
              px: "8",
              py: "3",
              bg: "gray.400",
              color: "white",
              rounded: "md",
              fontWeight: "bold",
              fontSize: "md",
              _hover: { bg: "gray.500" },
              transition: "all 0.2s",
              flex: "1"
            })}
            onClick={handleCancel}
            disabled={saving}
          >
            キャンセル
          </button>
        </div>
      </form>
    </main>
  );
}
