"use client";

/**
 * Profile page — User profile form with personal details, goals, and age calculator.
 * Persists to localStorage (same as original profile.html / profile.js).
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
