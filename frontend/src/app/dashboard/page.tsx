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
