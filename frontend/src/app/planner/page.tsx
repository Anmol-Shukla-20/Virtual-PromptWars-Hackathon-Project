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

            {results && (
              <div id="resultsSection">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Available Options for {parseFloat(distance).toFixed(1)} km
                </h2>
                <div id="optionsContainer" className="space-y-3">
                  {results.map((opt) => {
                    const isGreenest = opt.mode === greenest?.mode;
                    const isFastest = opt.mode === fastest?.mode;
                    const isCheapest = opt.mode === cheapest?.mode;

                    return (
                      <div
                        key={opt.mode}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{opt.icon}</div>
                          <div>
                            <div className="flex items-center flex-wrap gap-1">
                              <h4 className="font-bold text-gray-900 text-lg">{opt.name}</h4>
                              {isGreenest && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                  🌱 Greenest
                                </span>
                              )}
                              {isFastest && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                  ⚡ Fastest
                                </span>
                              )}
                              {isCheapest && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                  💰 Cheapest
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              ⏱️ {formatTime(opt.timeMins)} • 💵 ₹{opt.cost.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">Carbon Footprint</div>
                          <div
                            className={`text-xl font-bold ${
                              opt.emission === 0 ? "text-green-600" : "text-gray-900"
                            }`}
                          >
                            {opt.emission.toFixed(2)}{" "}
                            <span className="text-sm font-medium text-gray-500">kg CO₂</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

