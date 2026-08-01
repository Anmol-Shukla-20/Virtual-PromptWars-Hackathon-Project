"use client";

import React, { useState, useEffect, useRef } from "react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { aiApi } from "@/lib/apiClient";

interface ChatMessage {
  sender: "user" | "bot";
  rawText: string;
}

/** Converts basic markdown (**bold**, *italic*, newlines) to JSX-safe HTML string */
function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}
