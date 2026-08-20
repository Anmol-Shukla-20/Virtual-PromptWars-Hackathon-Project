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
