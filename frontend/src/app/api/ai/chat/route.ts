import { NextRequest, NextResponse } from 'next/server';
import connectToDb from '@/lib/mongodb';
import User from '@/models/User';
import Activity from '@/models/Activity';
import { getGroqChatCompletion } from '@/lib/aiService';
import { verifyAuth } from '@/lib/auth';

// POST /api/ai/chat — Send a message to EcoBot and get an AI reply
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    const userId = decoded.user.id;
    const { message } = await req.json();

    await connectToDb();

    // Load user context for personalised AI responses
    let user: { fullName?: string; sustainabilityScore?: number; totalCo2Saved?: number } | null = null;
    let recentActivities: Array<{ activityType: string; mode?: string; carbonEmission: number }> = [];

    try {
      user = await User.findById(userId).lean();
      const raw = await Activity.find({ user: userId }).sort({ date: -1 }).limit(5).lean();
      recentActivities = raw.map((a) => ({
        activityType: a.activityType,
        mode: a.mode,
        carbonEmission: a.carbonEmission,
      }));
    } catch (dbErr) {
      console.warn('DB offline – using mock context for AI chat');
      user = { fullName: 'User', sustainabilityScore: 0, totalCo2Saved: 0 };
    }
