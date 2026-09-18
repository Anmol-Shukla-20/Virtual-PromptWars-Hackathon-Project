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

  // Reset selection when results change
  useEffect(() => setSelectedIndex(0), [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-24 pb-4 px-4 bg-gray-900/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="relative flex items-center px-4 border-b border-gray-100">
          <svg className="w-6 h-6 text-gray-400 absolute left-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            id="globalSearchInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-5 text-lg text-gray-900 bg-transparent border-none focus:outline-none placeholder-gray-400"
            placeholder="Search pages, activities, features..."
            autoComplete="off"
          />
          <button
            id="closeSearchModalBtn"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2" id="searchResultsContainer">
          {results.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No matching features found for &quot;{query}&quot;
            </div>
          ) : (
            results.map((item, index) => (
              <button
                key={`${item.href}-${index}`}
                id={`search-result-${index}`}
                onClick={() => { router.push(item.href); onClose(); }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center p-4 rounded-xl cursor-pointer transition-colors text-left ${
                  index === selectedIndex
                    ? "bg-green-50 border-l-4 border-green-500"
                    : "hover:bg-gray-50 border-l-4 border-transparent"
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl mr-4">
                  {item.icon}
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${index === selectedIndex ? "text-green-800" : "text-gray-900"}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              </button>
            ))
          )}
        </div>

