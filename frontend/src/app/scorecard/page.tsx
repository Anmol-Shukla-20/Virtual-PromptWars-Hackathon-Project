"use client";

/**
 * Scoreboard page — Global leaderboard with weekly points breakdown
 * and per-day activity drill-down. 
 */
import React, { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { trackerApi } from "@/lib/apiClient";

interface LeaderboardUser {
  name: string;
  level: string;
  co2: number;
  points: number;
  isMe?: boolean;
}

interface DailyBar {
  date: string;
  dayName: string;
  pts: number;
}

interface ActivityRecord {
  activityType: string;
  mode?: string;
  distance?: number;
  unitsConsumed?: number;
  dietPreference?: string;
  shoppingFrequency?: string;
  carbonEmission: number;
  date: string;
}

function getLevelFromPoints(points: number): string {
  if (points > 5000) return "🏆 Planet Protector";
  if (points > 3000) return "🌳 Carbon Warrior";
  if (points > 1000) return "🌿 Eco Explorer";
  return "🌱 Green Beginner";
}

const DUMMY_USERS: LeaderboardUser[] = [
  { name: "Sarah Jenkins", level: "🏆 Planet Protector", co2: 845, points: 5200 },
  { name: "Rahul Sharma", level: "🌳 Carbon Warrior", co2: 620, points: 4100 },
  { name: "Emily Chen", level: "🌳 Carbon Warrior", co2: 590, points: 3850 },
  { name: "Michael Doe", level: "🌱 Green Beginner", co2: 45, points: 300 },
];

