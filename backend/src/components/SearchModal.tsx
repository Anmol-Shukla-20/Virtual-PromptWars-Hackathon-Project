"use client";

/**
 * Indexes all app pages and allows keyboard navigation.
 */
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchItem {
  title: string;
  description: string;
  href: string;
  icon: string;
}

const SEARCH_INDEX: SearchItem[] = [
  { title: "Dashboard", description: "View your EcoPoints, emissions summary, and charts", href: "/dashboard", icon: "📊" },
  { title: "Log Activity", description: "Log daily transportation, electricity, diet, and shopping", href: "/log", icon: "📝" },
  { title: "Log Transportation", description: "Add car, metro, EV, or bike trips", href: "/log", icon: "🚗" },
  { title: "Log Electricity", description: "Track your home energy consumption", href: "/log", icon: "⚡" },
  { title: "Log Diet", description: "Update your dietary preferences for today", href: "/log", icon: "🥗" },
  { title: "Scoreboard", description: "View global leaderboard and user rankings", href: "/scoreboard", icon: "🏆" },
  { title: "EcoBot AI Coach", description: "Chat with AI for personalised sustainability tips", href: "/chat", icon: "🤖" },
  { title: "My Profile", description: "Update your account details and goals", href: "/profile", icon: "👤" },
  { title: "Route Planner", description: "Compare emissions across different travel modes", href: "/planner", icon: "🗺️" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? SEARCH_INDEX.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_INDEX.slice(0, 5);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);


  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].href);
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, results, selectedIndex, router, onClose]);

