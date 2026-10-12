import { NextRequest, NextResponse } from 'next/server';
import connectToDb from '@/lib/mongodb';
import Activity from '@/models/Activity';
import { verifyAuth } from '@/lib/auth';

// GET /api/tracker/activities — Get the 50 most recent activities for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    const userId = decoded.user.id;

    await connectToDb();

    const activities = await Activity.find({ user: userId }).sort({ date: -1 }).limit(50).lean();

    return NextResponse.json(activities);

     } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    const status = message.includes('token') || message.includes('authorization') ? 401 : 500;
    console.error('Activities Error:', message);
    return NextResponse.json({ error: message }, { status });
  }
}
