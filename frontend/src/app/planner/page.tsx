"use client";

/**
 * Route Planner page — Calculates and compares carbon emissions,
 * travel time, and cost for different transport modes.
 */
import React, { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

const EMISSION_FACTORS: Record<string, number> = {
  car: 0.192,
  bike: 0.103,
  bus: 0.089,
  metro: 0.041,
  walking: 0,
  cycling: 0,
};

const MODE_DETAILS: Record<string, { icon: string; name: string; speedKmh: number; costPerKm: number }> = {
  car: { icon: "🚗", name: "Car", speedKmh: 40, costPerKm: 10 },
  bike: { icon: "🏍️", name: "Motorbike", speedKmh: 35, costPerKm: 4 },
  bus: { icon: "🚌", name: "Bus", speedKmh: 25, costPerKm: 2 },
  metro: { icon: "🚇", name: "Metro", speedKmh: 45, costPerKm: 3 },
  cycling: { icon: "🚲", name: "Cycling", speedKmh: 15, costPerKm: 0 },
  walking: { icon: "🚶", name: "Walking", speedKmh: 5, costPerKm: 0 },
};

interface RouteOption {
  mode: string;
  name: string;
  icon: string;
  emission: number;
  timeMins: number;
  cost: number;
}

function formatTime(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function PlannerPage() {
  const [distance, setDistance] = useState("");
  const [results, setResults] = useState<RouteOption[] | null>(null);

  const calculateRoutes = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseFloat(distance);
    if (!d || d <= 0) return;

    const options: RouteOption[] = Object.keys(EMISSION_FACTORS).map((mode) => {
      const details = MODE_DETAILS[mode];
      const emission = d * EMISSION_FACTORS[mode];
      const timeMins = Math.round((d / details.speedKmh) * 60);
      const cost = d * details.costPerKm;
      return { mode, name: details.name, icon: details.icon, emission, timeMins, cost };
    });

    setResults(options);
  };

  const greenest = results ? [...results].sort((a, b) => a.emission - b.emission)[0] : null;
  const fastest = results ? [...results].sort((a, b) => a.timeMins - b.timeMins)[0] : null;
  const cheapest = results ? [...results].sort((a, b) => a.cost - b.cost)[0] : null;

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Route Planner 🗺️</h1>
            <p className="text-gray-500 text-sm mb-6">
              Compare carbon footprint, time, and cost for your journey.
            </p>

            <form id="travelForm" onSubmit={calculateRoutes} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance (km)
              </label>
              <div className="flex gap-3">
                <input
                  id="distance"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  required
                  placeholder="e.g. 15"
                  className="eco-input"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 transition-colors font-semibold text-sm"
                >
                  Calculate
                </button>
              </div>
            </form>

