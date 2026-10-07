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
