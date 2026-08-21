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
