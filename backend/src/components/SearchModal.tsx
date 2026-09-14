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
