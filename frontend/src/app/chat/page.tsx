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
    
    try {
      const res = await aiApi.chat(text);
      const botMsg: ChatMessage = { sender: "bot", rawText: res.reply };
      const final = [...updated, botMsg];
      setMessages(final);
      saveHistory(final);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error connecting to AI";
      const botMsg: ChatMessage = {
        sender: "bot",
        rawText: "Oops, I encountered an error: " + errMsg,
      };
      const final = [...updated, botMsg];
      setMessages(final);
      saveHistory(final);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">🤖</div>
            <div>
              <h1 className="font-bold text-gray-800">EcoBot AI Coach</h1>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" /> Online
              </p>
            </div>
          </div>
         
          {/* Messages area */}
          <div
            id="chatMessages"
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
          >
            {/* Welcome bubble */}
            {messages.length === 0 && !loading && (
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm mr-3 shrink-0">🤖</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[80%]">
                  <p className="text-sm text-gray-800">
                    👋 Hi! I'm <strong>EcoBot</strong>, your personal AI sustainability coach.
                    Ask me anything about reducing your carbon footprint!
                  </p>
                </div>
              </div>
            )}
            
            {/* Suggestions */}
            {suggestionsVisible && messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pl-11">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="suggestion-btn text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.sender === "bot" ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm mr-3 shrink-0">🤖</div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm ml-3 shrink-0">👤</div>
                )}
                <div
                  className={`p-4 shadow-sm max-w-[80%] ${
                    msg.sender === "bot"
                      ? "bg-white border border-gray-200 rounded-2xl rounded-tl-none"
                      : "bg-green-600 text-white rounded-2xl rounded-tr-none"
                  }`}
                >
                  {msg.sender === "bot" ? (
                    <p
                      className="text-sm text-gray-800"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.rawText) }}
                    />
                  ) : (
                    <p className="text-sm text-white">{msg.rawText}</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm mr-3 shrink-0">🤖</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                  <div className="flex space-x-1 items-center h-4">
                    {[0, 0.1, 0.2].map((delay, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
