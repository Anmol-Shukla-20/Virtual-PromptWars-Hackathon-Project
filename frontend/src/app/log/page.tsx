"use client";

/**
 * Log Activity page — Tabbed interface for logging transportation,
 * electricity, lifestyle, and shopping activities.
 */
import React, { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { trackerApi } from "@/lib/apiClient";

type TabKey = "transportation" | "electricity" | "lifestyle" | "shopping";

interface FeedbackState {
  type: "success" | "error";
  message: string;
} 

export default function LogPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("transportation");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [loading, setLoading] = useState(false);

  // Transportation
  const [transportMode, setTransportMode] = useState("car");
  const [transportDistance, setTransportDistance] = useState("");
  const [evRenewable, setEvRenewable] = useState(false);

  // Electricity
  const [electricityUnits, setElectricityUnits] = useState("");

  // Lifestyle
  const [dietPreference, setDietPreference] = useState("Vegetarian");

  // Shopping
  const [shoppingFrequency, setShoppingFrequency] = useState("low");

  const submitLog = async (data: Record<string, unknown>, resetFn: () => void) => {
    setLoading(true);
    setFeedback(null);
    try {
      const result = await trackerApi.logActivity(data);
      const act = result.activity as Record<string, number>;
      let extra = "";
      if (result.co2Saved > 0) {
        extra = ` 🌟 You saved ${result.co2Saved.toFixed(2)} kg CO₂ and earned +${result.earnedPoints} Bonus Points!`;
      }
      setFeedback({
        type: "success",
        message: `✅ Logged! You emitted approximately ${(act.carbonEmission as number).toFixed(2)} kg CO₂.${extra}`,
      });
      resetFn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to log";
      setFeedback({ type: "error", message: "❌ " + msg });
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "transportation", label: "Transportation", icon: "🚗" },
    { key: "electricity", label: "Electricity", icon: "⚡" },
    { key: "lifestyle", label: "Lifestyle", icon: "🥗" },
    { key: "shopping", label: "Shopping", icon: "🛍️" },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Log Activity</h1>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-gray-200 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  id={`tab-${tab.key}`}
                  onClick={() => { setActiveTab(tab.key); setFeedback(null); }}
                  className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Transportation Form */}
              {activeTab === "transportation" && (
                <form
                  id="transportForm"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitLog(
                      { activityType: "transportation", mode: transportMode, distance: parseFloat(transportDistance), isRenewableEV: evRenewable },
                      () => { setTransportDistance(""); setEvRenewable(false); }
                    );
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Transport</label>
                    <select
                      id="transportMode"
                      value={transportMode}
                      onChange={(e) => setTransportMode(e.target.value)}
                      className="eco-input"
                    >
                      <option value="car">🚗 Car</option>
                      <option value="bus">🚌 Bus</option>
                      <option value="metro">🚇 Metro</option>
                      <option value="motorbike">🏍️ Motorbike</option>
                      <option value="scooty">🛵 Scooty</option>
                      <option value="cycling">🚲 Cycling</option>
                      <option value="walking">🚶 Walking</option>
                      <option value="ev">🔋 Electric Vehicle</option>
                      <option value="carpool">🚐 Carpool</option>
                    </select>
                  </div>
                  {transportMode === "ev" && (
                    <div id="evCheckboxContainer" className="flex items-center gap-2">
                      <input
                        id="evRenewable"
                        type="checkbox"
                        checked={evRenewable}
                        onChange={(e) => setEvRenewable(e.target.checked)}
                        className="w-4 h-4 accent-green-600"
                      />
                      <label htmlFor="evRenewable" className="text-sm text-gray-700">Charged with renewable energy?</label>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                    <input
                      id="transportDistance"
                      type="number"
                      min="0"
                      step="0.1"
                      value={transportDistance}
                      onChange={(e) => setTransportDistance(e.target.value)}
                      required
                      className="eco-input"
                      placeholder="e.g. 12.5"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
                    {loading ? "Logging…" : "Log Trip"}
                  </button>
                </form>
              )}

              {/* Electricity Form */}
              {activeTab === "electricity" && (
                <form
                  id="electricityForm"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitLog(
                      { activityType: "electricity", unitsConsumed: parseFloat(electricityUnits) },
                      () => setElectricityUnits("")
                    );
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Units Consumed (kWh)</label>
                    <input
                      id="electricityUnits"
                      type="number"
                      min="0"
                      step="0.1"
                      value={electricityUnits}
                      onChange={(e) => setElectricityUnits(e.target.value)}
                      required
                      className="eco-input"
                      placeholder="e.g. 5"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
                    {loading ? "Logging…" : "Log Electricity"}
                  </button>
                </form>
              )}

              {/* Lifestyle Form */}
              {activeTab === "lifestyle" && (
                <form
                  id="lifestyleForm"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitLog({ activityType: "lifestyle", dietPreference }, () => {});
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diet Preference Today</label>
                    <select
                      id="dietPreference"
                      value={dietPreference}
                      onChange={(e) => setDietPreference(e.target.value)}
                      className="eco-input"
                    >
                      <option value="Vegetarian">🥦 Vegetarian</option>
                      <option value="Eggetarian">🥚 Eggetarian</option>
                      <option value="Non-Vegetarian">🍗 Non-Vegetarian</option>
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
                    {loading ? "Logging…" : "Log Diet"}
                  </button>
                </form>
              )}
