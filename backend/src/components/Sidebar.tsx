"use client";

/**
 * Sidebar navigation component shared across all authenticated pages.
 * Handles nav links, logout, profile avatar, mobile toggle, and Ctrl+K search.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import SearchModal from "./SearchModal";

interface UserInfo {
  fullName: string;
  email: string;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
