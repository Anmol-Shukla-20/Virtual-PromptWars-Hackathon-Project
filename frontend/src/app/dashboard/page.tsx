"use client";

/**
 * Dashboard page — Shows sustainability metrics, charts, and onboarding modal.
 * Mirrors dashboard.html / dashboard.js functionality.
 */
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { trackerApi } from "@/lib/apiClient";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

interface SummaryData {
  breakdown: { transportation: number; electricity: number; lifestyle: number; shopping: number; total: number };
  trend: { _id: string; dailyTotal: number }[];
  ecoPoints: number;
  co2Saved: number;
  sustainabilityScore: number;
}

function getLevelFromPoints(points: number): string {
  if (points > 5000) return "🏆 Planet Protector";
  if (points > 3000) return "🌳 Carbon Warrior";
  if (points > 1000) return "🌿 Eco Explorer";
  return "🌱 Green Beginner";
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [obDiet, setObDiet] = useState("Vegetarian");
  const [obCommute, setObCommute] = useState("metro");
  const [obLoading, setObLoading] = useState(false);

  useEffect(() => {
    const profileComplete = localStorage.getItem("profileComplete");
    if (!profileComplete) {
      setShowOnboarding(true);
    } else {
      loadData();
    }
  }, []);
  
  async function loadData() {
    setLoading(true);
    try {
      const result = await trackerApi.getSummary();
      // Fallback dummy data if DB is empty (preserves hackathon behaviour)
      if (result.breakdown.total === 0) {
        result.breakdown = { transportation: 15, electricity: 22, lifestyle: 10, shopping: 0, total: 47 };
        result.trend = [
          { _id: new Date(Date.now() - 86400000).toISOString().split("T")[0], dailyTotal: 8 },
          { _id: new Date().toISOString().split("T")[0], dailyTotal: 15 },
        ];
      }
      setData(result);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleOnboardingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setObLoading(true);
    try {
      await trackerApi.logActivity({ activityType: "lifestyle", dietPreference: obDiet });
      await trackerApi.logActivity({ activityType: "transportation", mode: obCommute, distance: 0 });
      localStorage.setItem("profileComplete", "true");
      setShowOnboarding(false);
      loadData();
    } catch (err) {
      console.error("Onboarding failed", err);
    } finally {
      setObLoading(false);
    }
  }

  const ecoPoints = data?.ecoPoints ?? 0;
  const userLevel = getLevelFromPoints(ecoPoints);
  const co2Saved = data?.co2Saved ?? 0;
  const susScore = data?.sustainabilityScore ?? 0;
  const globalRank = `#${Math.max(1, Math.floor(10000 / (ecoPoints + 10)))}`;

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "CO₂ Saved", value: `${co2Saved.toFixed(1)} kg`, id: "co2Saved", icon: "🌍", color: "text-green-600" },
                { label: "EcoPoints", value: ecoPoints, id: "ecoPoints", icon: "⭐", color: "text-yellow-600" },
                { label: "Your Level", value: userLevel, id: "userLevel", icon: "🏅", color: "text-purple-600" },
                { label: "Global Rank", value: globalRank, id: "globalRank", icon: "🌐", color: "text-blue-600" },
              ].map((card) => (
                <div key={card.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 border border-gray-100">
                  <div className="text-3xl">{card.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{card.label}</p>
                    <p id={card.id} className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sustainability Score */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Sustainability Score</span>
                <span id="susScore" className="text-sm font-bold text-green-600">{susScore}/100</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2.5 bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${susScore}%` }}
                />
              </div>
            </div>

            {/* Charts */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
              </div>
            ) : data ? (
              <div id="chartsGrid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Footprint Breakdown</h3>
                  <div style={{ height: 240 }}>
                    <Doughnut
                      id="footprintChart"
                      data={{
                        labels: ["Transport", "Electricity", "Diet", "Shopping"],
                        datasets: [{
                          data: [data.breakdown.transportation, data.breakdown.electricity, data.breakdown.lifestyle, data.breakdown.shopping],
                          backgroundColor: ["#3b82f6", "#eab308", "#22c55e", "#a855f7"],
                          borderWidth: 0,
                        }],
                      }}
                      options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" } } }}
                    />
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Weekly Trend</h3>
                  <p id="weeklyTotal" className="text-xs text-gray-400 mb-4">
                    Total: {data.breakdown.total.toFixed(1)} kg CO₂
                  </p>
                  <div style={{ height: 240 }}>
                    <Bar
                      id="trendChart"
                      data={{
                        labels: data.trend.length ? data.trend.map((t) => t._id) : ["Today"],
                        datasets: [{
                          label: "Daily Emissions (kg CO₂)",
                          data: data.trend.length ? data.trend.map((t) => t.dailyTotal) : [0],
                          backgroundColor: "#16a34a",
                          borderRadius: 4,
                        }],
                      }}
                      options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div id="emptyStateContainer" className="text-center text-gray-400 py-16">
                No data yet. <a href="/log" className="text-green-600 underline">Log your first activity!</a>
              </div>
            )}
          </div>
        </main>
      </div>

