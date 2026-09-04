"use client";

/**
 * Profile page — User profile form with personal details, goals, and age calculator.
 */
import React, { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

interface ProfileData {
  name: string;
  gender: string;
  dob: string;
  weight: string;
  height: string;
  goalCo2: string;
  goalPts: string;
}

function calculateAge(dob: string): string {
  if (!dob) return "--";
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? `${age} yrs` : "--";
}

const DEFAULT_PROFILE: ProfileData = {
  name: "",
  gender: "",
  dob: "",
  weight: "",
  height: "",
  goalCo2: "",
  goalPts: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("profileData");
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        // Pre-fill name from auth user object
        const userStored = localStorage.getItem("user");
        if (userStored) {
          const user = JSON.parse(userStored);
          setProfile((prev) => ({ ...prev, name: user.fullName ?? "" }));
        }
      }
    } catch {}
  }, []);

  const handleChange = (field: keyof ProfileData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("profileData", JSON.stringify(profile));

    // Also update user object so Avatar updates across all pages
    try {
      const userStored = localStorage.getItem("user");
      if (userStored && profile.name) {
        const user = JSON.parse(userStored);
        user.fullName = profile.name;
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch {}

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const age = calculateAge(profile.dob);

  const inputClass = "eco-input";

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile 👤</h1>

            <form id="profileForm" onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-700 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      id="profName"
                      type="text"
                      value={profile.name}
                      onChange={handleChange("name")}
                      className={inputClass}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      id="profGender"
                      value={profile.gender}
                      onChange={handleChange("gender")}
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      id="profDob"
                      type="date"
                      value={profile.dob}
                      onChange={handleChange("dob")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <div
                      id="profAge"
                      className="eco-input bg-gray-50 text-gray-700 cursor-default"
                    >
                      {age}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input
                      id="profWeight"
                      type="number"
                      value={profile.weight}
                      onChange={handleChange("weight")}
                      className={inputClass}
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input
                      id="profHeight"
                      type="number"
                      value={profile.height}
                      onChange={handleChange("height")}
                      className={inputClass}
                      placeholder="175"
                    />
                  </div>
                </div>
              </div>

              {/* Eco Goals */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-700 mb-4">Eco Goals 🎯</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CO₂ Reduction Goal (kg/month)
                    </label>
                    <input
                      id="profGoalCo2"
                      type="number"
                      value={profile.goalCo2}
                      onChange={handleChange("goalCo2")}
                      className={inputClass}
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      EcoPoints Goal (monthly)
                    </label>
                    <input
                      id="profGoalPts"
                      type="number"
                      value={profile.goalPts}
                      onChange={handleChange("goalPts")}
                      className={inputClass}
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>
