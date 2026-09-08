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

export default function ScoreboardPage() {
  const [myPoints, setMyPoints] = useState(0);
  const [myCo2, setMyCo2] = useState(0);
  const [totalWeeklyPoints, setTotalWeeklyPoints] = useState(0);
  const [dailyBars, setDailyBars] = useState<DailyBar[]>([]);
  const [allActivities, setAllActivities] = useState<ActivityRecord[]>([]);
  const [selectedDay, setSelectedDay] = useState<{ date: string; dayName: string; pts: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await trackerApi.getSummary();
      const pts = data.ecoPoints ?? 0;
      setMyPoints(pts);
      setMyCo2(data.co2Saved ?? 0);
      setTotalWeeklyPoints(pts);

      if (data.trend.length > 0) {
        let maxPts = 0;
        const bars: DailyBar[] = data.trend.map((day) => {
          const p = 50 + Math.floor(day.dailyTotal * 2);
          if (p > maxPts) maxPts = p;
          const dayName = new Date(day._id + "T00:00:00Z").toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: "UTC",
          });
          return { date: day._id, dayName, pts: p };
        });
        setDailyBars(bars);
      }

      try {
        const acts = await trackerApi.getActivities();
        setAllActivities(acts as ActivityRecord[]);
      } catch {}
    } catch (err) {
      console.error("Failed to load scoreboard data", err);
    } finally {
      setLoading(false);
    }
  }


