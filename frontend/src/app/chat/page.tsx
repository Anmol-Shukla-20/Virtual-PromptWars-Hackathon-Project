"use client";

import React, { useState, useEffect, useRef } from "react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { aiApi } from "@/lib/apiClient";

interface ChatMessage {
  sender: "user" | "bot";
  rawText: string;
}

/** Converts basic markdown (**bold**, *italic*, newlines) to JSX-safe HTML string */
function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

const SUGGESTIONS = [
  "How can I reduce my carbon footprint?",
  "What's the greenest way to commute?",
  "Give me 3 eco tips for today",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ecopath_chat_history");
      if (stored) {
        const history: ChatMessage[] = JSON.parse(stored);
        setMessages(history);
        if (history.length > 0) setSuggestionsVisible(false);
      }
    } catch {}
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveHistory = (msgs: ChatMessage[]) => {
    localStorage.setItem("ecopath_chat_history", JSON.stringify(msgs));
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setSuggestionsVisible(false);

    const userMsg: ChatMessage = { sender: "user", rawText: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveHistory(updated);
    setInput("");
    setLoading(true);

