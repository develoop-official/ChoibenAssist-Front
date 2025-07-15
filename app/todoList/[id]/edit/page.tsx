"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { css } from "../../../../styled-system/css";
import { supabase } from "../../../../lib/supabase";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { TodoItem } from "../../../types/todo-item";

export default function TodoEditPage() {
  const router = useRouter();
  const params = useParams();
  const todoId = params.id as string;
  const [todo, setTodo] = useState<TodoItem | null>(null);
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!todoId) return;
    const fetchTodo = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await supabase?.from("todo_items")
          .select("*")
          .eq("id", todoId)
          .single();
        if (response?.error) {
          setError("TODOが見つかりません");
          setTodo(null);
        } else if (response?.data) {
          setTodo(response.data);
          setTask(response.data.task);
          setDueDate(response.data.due_date || "");
        }
      } catch (err) {
        setError("TODOの取得に失敗しました");
        setTodo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTodo();
  }, [todoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) {
      setError("タスク内容を入力してください");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await supabase?.from("todo_items")
        .update({ task: task.trim(), due_date: dueDate || null })
        .eq("id", todoId)
        .single();
      if (response?.error) throw response.error;
      router.push(`/todoList/${todoId}`);
    } catch (err) {
      setError("TODOの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="TODOを取得中..." />;
  }
  if (error || !todo) {
    return <div className={css({ color: "red.500", textAlign: "center", py: "12" })}>{error || "TODOが見つかりません"}</div>;
  }

  return (
    <main className={css({ maxW: "md", mx: "auto", px: "4", py: "8" })}>
      <h2 className={css({ fontSize: "2xl", fontWeight: "bold", color: "primary.700", mb: "8" })}>TODO編集</h2>
      <form onSubmit={handleSubmit} className={css({ display: "flex", flexDirection: "column", gap: "6" })}>
        <div>
          <label className={css({ fontWeight: "bold", color: "gray.700", mb: "2", display: "block" })}>タスク内容 *</label>
          <input
            type="text"
            value={task}
            onChange={e => setTask(e.target.value)}
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
        <div>
          <label className={css({ fontWeight: "bold", color: "gray.700", mb: "2", display: "block" })}>期限</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
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
        {error && <div className={css({ color: "red.500", fontSize: "sm" })}>{error}</div>}
        <button
          type="submit"
          className={css({
            px: "6",
            py: "3",
            bg: "primary.600",
            color: "white",
            rounded: "md",
            fontWeight: "bold",
            fontSize: "md",
            _hover: { bg: "primary.700" },
            transition: "all 0.2s"
          })}
          disabled={saving}
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </form>
    </main>
  );
} 