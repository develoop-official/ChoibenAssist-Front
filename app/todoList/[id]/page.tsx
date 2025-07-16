"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { css } from "../../../styled-system/css";
import { supabase } from "../../../lib/supabase";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { TodoItem } from "../../types/todo-item";

export default function TodoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const todoId = params.id as string;
  const [todo, setTodo] = useState<TodoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  useEffect(() => {
    if (todo) {
      setTask(todo.task);
      setDueDate(todo.due_date || "");
    }
  }, [todo]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);

  const handleSave = async (e: React.FormEvent) => {
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
      setEditMode(false);
      setTodo({ ...todo!, task: task.trim(), due_date: dueDate || undefined });
    } catch (err) {
      setError("TODOの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("このTODOを削除しますか？")) return;
    setDeleting(true);
    setError("");
    try {
      const response = await supabase?.from("todo_items")
        .delete()
        .eq("id", todoId);
      if (response?.error) throw response.error;
      router.push("/todoList");
    } catch (err) {
      setError("TODOの削除に失敗しました");
    } finally {
      setDeleting(false);
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
      <h2 className={css({ fontSize: "2xl", fontWeight: "bold", color: "primary.700", mb: "8" })}>TODO詳細</h2>
      {editMode ? (
        <form onSubmit={handleSave} className={css({ display: "flex", flexDirection: "column", gap: "6", mb: "8" })}>
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
          <div className={css({ display: "flex", gap: "4" })}>
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
            <button
              type="button"
              className={css({
                px: "6",
                py: "3",
                bg: "gray.400",
                color: "white",
                rounded: "md",
                fontWeight: "bold",
                fontSize: "md",
                _hover: { bg: "gray.500" },
                transition: "all 0.2s"
              })}
              onClick={handleCancel}
              disabled={saving}
            >
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <div className={css({
          bg: "white",
          border: "1px solid",
          borderColor: "gray.200",
          rounded: "xl",
          p: "6",
          shadow: "md",
          mb: "8"
        })}>
          <div className={css({ fontWeight: "bold", fontSize: "xl", color: "primary.800", mb: "2" })}>{todo.task}</div>
          <div className={css({ fontSize: "sm", color: "gray.600", mb: "2" })}>ステータス: {todo.status === "completed" ? "完了" : "未完了"}</div>
          {todo.due_date && <div className={css({ fontSize: "sm", color: "gray.500", mb: "2" })}>期限: {todo.due_date}</div>}
          <div className={css({ fontSize: "xs", color: "gray.400", mb: "2" })}>作成日: {todo.created_at.slice(0, 10)}</div>
          <div className={css({ fontSize: "xs", color: "gray.400" })}>更新日: {todo.updated_at.slice(0, 10)}</div>
          <div className={css({ display: "flex", gap: "4", mt: "6" })}>
            <button
              className={css({
                px: "6",
                py: "3",
                bg: "yellow.400",
                color: "white",
                rounded: "md",
                fontWeight: "bold",
                fontSize: "md",
                _hover: { bg: "yellow.500" },
                transition: "all 0.2s"
              })}
              onClick={handleEdit}
              disabled={deleting}
            >
              編集
            </button>
            <button
              className={css({
                px: "6",
                py: "3",
                bg: "red.500",
                color: "white",
                rounded: "md",
                fontWeight: "bold",
                fontSize: "md",
                _hover: { bg: "red.600" },
                transition: "all 0.2s"
              })}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "削除中..." : "削除"}
            </button>
          </div>
        </div>
      )}
      <button
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
        onClick={() => router.push("/todoList")}
        disabled={deleting || saving}
      >
        ← TODOリストに戻る
      </button>
    </main>
  );
} 