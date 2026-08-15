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
