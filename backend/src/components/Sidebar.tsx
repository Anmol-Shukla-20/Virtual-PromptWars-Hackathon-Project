"use client";

/**
 * Sidebar navigation component shared across all authenticated pages.
 * Handles nav links, logout, profile avatar, mobile toggle, and Ctrl+K search.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import SearchModal from "./SearchModal";

interface UserInfo {
  fullName: string;
  email: string;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }

    // Global Ctrl+K / Cmd+K shortcut
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profileComplete");
    router.push("/");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/log", label: "Log Activity", icon: "📝" },
    { href: "/planner", label: "Route Planner", icon: "🗺️" },
    { href: "/chat", label: "EcoBot AI", icon: "🤖" },
    { href: "/scoreboard", label: "Scoreboard", icon: "🏆" },
    { href: "/profile", label: "My Profile", icon: "👤" },
  ];

  const initial = user?.fullName?.charAt(0).toUpperCase() ?? "U";

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
        <span className="text-xl font-bold text-green-600">🌿 EcoPath AI</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

