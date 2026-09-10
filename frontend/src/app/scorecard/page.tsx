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

  // Build full leaderboard merging current user
  const myName = (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored).fullName ?? "You" : "You";
    } catch {
      return "You";
    }
  })();

  const myLevel = getLevelFromPoints(myPoints);
  const allUsers: LeaderboardUser[] = [
    ...DUMMY_USERS,
    { name: myName, level: myLevel, co2: myCo2, points: myPoints, isMe: true },
  ].sort((a, b) => b.points - a.points);

  const activitiesForDay = selectedDay
    ? allActivities.filter((a) => a.date && a.date.startsWith(selectedDay.date))
    : [];

  function activityIcon(type: string) {
    if (type === "transportation") return "🚴";
    if (type === "electricity") return "⚡";
    if (type === "lifestyle") return "🥗";
    if (type === "shopping") return "🛍️";
    return "📝";
  }

  function activityDesc(a: ActivityRecord) {
    if (a.activityType === "transportation") return `${a.mode} (${a.distance} km)`;
    if (a.activityType === "electricity") return `${a.unitsConsumed} kWh used`;
    if (a.activityType === "lifestyle") return `${a.dietPreference} Diet`;
    if (a.activityType === "shopping") return `${a.shoppingFrequency} Frequency`;
    return a.activityType;
  }

  const rankBadge = (rank: number, isMe: boolean, points: number) => {
    if (isMe && points === 0) return <span className="text-xs font-bold text-gray-400">Unranked</span>;
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="font-bold text-gray-500">#{rank}</span>;
  };

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Scoreboard 🏆</h1>

            {/* Weekly Points Bar Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-gray-700">Your Weekly EcoPoints</h2>
                <span id="totalWeeklyPoints" className="text-xl font-bold text-yellow-600">{totalWeeklyPoints} pts</span>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                </div>
              ) : dailyBars.length === 0 ? (
                <p id="weeklyPointsContainer" className="text-sm text-gray-400 text-center py-8">No data to display yet.</p>
              ) : (
                <div id="weeklyPointsContainer" className="flex items-end justify-around gap-2 h-40">
                  {dailyBars.map((bar) => {
                    const maxPts = Math.max(...dailyBars.map((b) => b.pts));
                    const heightPct = Math.max(10, (bar.pts / maxPts) * 100);
                    return (
                      <button
                        key={bar.date}
                        onClick={() => setSelectedDay(bar)}
                        className="flex flex-col items-center w-full max-w-[40px] group cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors"
                      >
                        <span className="text-xs font-bold text-green-700 mb-1">{bar.pts}</span>
                        <div
                          className="w-full bg-green-200 rounded-t-md group-hover:bg-green-400 transition-colors"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-xs font-medium text-gray-500 mt-2">{bar.dayName}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>




