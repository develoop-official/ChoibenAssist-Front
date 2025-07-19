"use client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import { supabase } from "../../../lib/supabase";
import { css } from "../../../styled-system/css";
import ShareButton from "../../components/ShareButton";
import TodoCompletionModal from "../../components/TodoCompletionModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { TodoItem } from "../../types/todo-item";
import { createPostShareData } from "../../utils/share-utils";

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
  const [completing, setCompleting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

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
      } catch {
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
    } catch {
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
      router.push("/");
    } catch {
      setError("TODOの削除に失敗しました");
    } finally {
      setDeleting(false);
    }
  };

  const handleComplete = async () => {
    if (!todo || todo.status === "completed") return;
    setCompleting(true);
    try {
      await supabase?.from("todo_items")
        .update({ status: "completed" })
        .eq("id", todoId);
      setTodo({ ...todo, status: "completed" });
      
      // 完了アニメーションを表示してからタイムラインに遷移
      setTimeout(() => {
        router.push(`/timeline?completed_todo=${todoId}`);
      }, 1000);
    } catch (error) {
      console.error("TODO完了エラー:", error);
      alert("TODOの完了に失敗しました");
    } finally {
      setCompleting(false);
    }
  };

  const handlePostCreated = () => {
    console.warn('投稿が完了しました');
  };

  if (loading) {
    return <LoadingSpinner text="TODOを取得中..." />;
  }
  if (error || !todo) {
    return <div className={css({ color: "red.500", textAlign: "center", py: "12" })}>{error || "TODOが見つかりません"}</div>;
  }

  const shareData = createPostShareData({
    content: `✅ TODO完了: ${todo.task}`,
    hashtags: ["ちょい勉", "TODO完了"]
  }, window.location.href);

  return (
    <main className={css({ maxW: "2xl", mx: "auto", px: "4", py: "8" })}>
      <div className={css({ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: "6" })}>
        <div className={css({ display: "flex", gap: "3" })}>
          <Link
            href="/"
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
            ← ダッシュボードに戻る
          </Link>
          <Link
            href={`/todoList/${todoId}/edit`}
            className={css({
              px: "4",
              py: "2",
              bg: "yellow.400",
              color: "white",
              rounded: "md",
              fontWeight: "bold",
              fontSize: "sm",
              _hover: { bg: "yellow.500" },
              transition: "all 0.2s",
              textDecoration: "none",
              display: "inline-block"
            })}
          >
            編集
          </Link>
        </div>
      </div>

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
          borderColor: todo.status === "completed" ? "green.200" : "gray.200",
          rounded: "xl",
          p: "6",
          shadow: "md",
          mb: "8"
        })}>
          {/* ステータスバッジ */}
          <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "4" })}>
            <div className={css({
              px: "3",
              py: "1",
              bg: todo.status === "completed" ? "green.100" : "blue.100",
              color: todo.status === "completed" ? "green.800" : "blue.800",
              rounded: "full",
              fontSize: "sm",
              fontWeight: "bold"
            })}>
              {todo.status === "completed" ? "✅ 完了" : "⏳ 未完了"}
            </div>
            <ShareButton shareData={shareData} />
          </div>

          {/* タスク内容 */}
          <div className={css({ fontWeight: "bold", fontSize: "xl", color: "primary.800", mb: "4" })}>
            {todo.task}
          </div>

          {/* 詳細情報 */}
          <div className={css({ spaceY: "3", mb: "6" })}>
            {todo.due_date && (
              <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
                <span className={css({ fontSize: "lg" })}>📅</span>
                <span className={css({ fontSize: "sm", color: "gray.600" })}>期限: {todo.due_date}</span>
              </div>
            )}
            <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
              <span className={css({ fontSize: "lg" })}>⏱️</span>
              <span className={css({ fontSize: "sm", color: "blue.600" })}>学習時間: {todo.study_time}時間</span>
            </div>
            {todo.priority && (
              <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
                <span className={css({ fontSize: "lg" })}>⭐</span>
                <span className={css({
                  fontSize: "sm",
                  color: todo.priority === 1 ? "red.600" : todo.priority === 2 ? "orange.600" : "blue.600"
                })}>
                  優先度: {todo.priority === 1 ? "高" : todo.priority === 2 ? "中" : "低"}
                </span>
              </div>
            )}
            {todo.goal && (
              <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
                <span className={css({ fontSize: "lg" })}>🎯</span>
                <span className={css({ fontSize: "sm", color: "purple.600" })}>目標: {todo.goal}</span>
              </div>
            )}
            {todo.notes && (
              <div className={css({ display: "flex", alignItems: "flex-start", gap: "2" })}>
                <span className={css({ fontSize: "lg", mt: "1" })}>📝</span>
                <span className={css({ fontSize: "sm", color: "gray.600" })}>メモ: {todo.notes}</span>
              </div>
            )}
            <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
              <span className={css({ fontSize: "lg" })}>📅</span>
              <span className={css({ fontSize: "xs", color: "gray.400" })}>
                作成日: {todo.created_at.slice(0, 10)}
              </span>
            </div>
            <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
              <span className={css({ fontSize: "lg" })}>🔄</span>
              <span className={css({ fontSize: "xs", color: "gray.400" })}>
                更新日: {todo.updated_at.slice(0, 10)}
              </span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className={css({ spaceY: "4", pt: "4", borderTop: "1px solid", borderColor: "gray.200" })}>
            {/* デバッグ情報 */}
            <div className={css({ fontSize: "xs", color: "gray.500" })}>
              デバッグ: ステータス = {todo.status}, 完了ボタン表示 = {todo.status !== "completed" ? "true" : "false"}
            </div>

            {/* ボタンコンテナ */}
            <div className={css({ display: "flex", gap: "4" })}>
              {todo.status !== "completed" && (
                <button
                  className={css({
                    px: "6",
                    py: "3",
                    bg: "green.500",
                    color: "white",
                    rounded: "md",
                    fontWeight: "bold",
                    fontSize: "md",
                    _hover: { bg: "green.600" },
                    transition: "all 0.2s",
                    flex: "1"
                  })}
                  onClick={handleComplete}
                  disabled={completing}
                >
                  {completing ? "完了中..." : "✅ 完了して投稿する"}
                </button>
              )}
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
                  transition: "all 0.2s",
                  flex: "1"
                })}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "削除中..." : "🗑️ 削除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Todo完了モーダル */}
      <TodoCompletionModal
        todo={todo}
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onPostCreated={handlePostCreated}
      />
    </main>
  );
}

