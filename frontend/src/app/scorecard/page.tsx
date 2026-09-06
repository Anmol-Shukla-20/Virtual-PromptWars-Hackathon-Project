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
