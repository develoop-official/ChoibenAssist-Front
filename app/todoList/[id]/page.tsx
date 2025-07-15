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

  useEffect(() => {
    if (!todoId) return;
    const fetchTodo = async () => {
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase
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

  if (loading) {
    return <LoadingSpinner text="TODOを取得中..." />;
  }
  if (error || !todo) {
    return <div className={css({ color: "red.500", textAlign: "center", py: "12" })}>{error || "TODOが見つかりません"}</div>;
  }

  return (
    <main className={css({ maxW: "md", mx: "auto", px: "4", py: "8" })}>
      <h2 className={css({ fontSize: "2xl", fontWeight: "bold", color: "primary.700", mb: "8" })}>TODO詳細</h2>
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
      </div>
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
      >
        ← TODOリストに戻る
      </button>
    </main>
  );
} 