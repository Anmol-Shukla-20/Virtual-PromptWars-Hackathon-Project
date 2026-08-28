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
