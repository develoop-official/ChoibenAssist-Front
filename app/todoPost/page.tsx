"use client";
import React from 'react';
import { useRouter } from "next/navigation";
import { useState } from "react";

import { css } from "../../styled-system/css";
import { useTodos } from "../hooks/useTodos";

export default function TodoPostPage() {
  const router = useRouter();
  const { addTodo } = useTodos();
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) {
      setError("タスク内容を入力してください");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await addTodo({ task: task.trim(), due_date: dueDate || undefined });
      router.push("/todoList");
    } catch {
      setError("TODOの作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={css({ maxW: "md", mx: "auto", px: "4", py: "8" })}>
      <h2 className={css({ fontSize: "2xl", fontWeight: "bold", color: "primary.700", mb: "8" })}>TODO作成</h2>
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
          disabled={loading}
        >
          {loading ? "作成中..." : "作成"}
        </button>
      </form>
    </main>
  );
}
