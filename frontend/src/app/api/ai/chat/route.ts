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

    let systemPrompt = `You are EcoBot, an AI Sustainability Coach for the app EcoPath AI.
Your goal is to help the user reduce their carbon footprint.
The user's name is ${user?.fullName ?? 'User'}. They have a sustainability score of ${user?.sustainabilityScore ?? 0}/100 and have saved ${user?.totalCo2Saved ?? 0} kg of CO2.
Recent activities context: ${JSON.stringify(recentActivities)}.
Keep your responses concise, highly motivating, and highly actionable. Format nicely with markdown or plain text. Do not use more than 3 short paragraphs.`;

    if (recentActivities.length === 0) {
      systemPrompt = `You are EcoBot, an AI Sustainability Coach for the app EcoPath AI.
The user ${user?.fullName ?? 'User'} has just signed up and hasn't logged any activities yet.
Your goal is to warmly welcome them, introduce yourself, and ask them a simple engaging question to help them start tracking their carbon footprint. Keep it friendly, concise, and under 2 short paragraphs.`;
    }

      const reply = await getGroqChatCompletion(systemPrompt, message);
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = message.includes('token') || message.includes('authorization') ? 401 : 500;
    console.error('AI Chat Error:', message);
    return NextResponse.json({ error: message }, { status });
  }
}
