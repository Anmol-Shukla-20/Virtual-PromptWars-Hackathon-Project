import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDb from '@/lib/mongodb';
import Activity from '@/models/Activity';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

// GET /api/tracker/summary — Get carbon footprint summary with breakdown and trend
export async function GET(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    const rawId = decoded.user.id;

    await connectToDb();

    const userId = mongoose.Types.ObjectId.isValid(rawId)
      ? new mongoose.Types.ObjectId(rawId)
      : null;

    const summary = { transportation: 0, electricity: 0, lifestyle: 0, shopping: 0, total: 0 };
    let breakdown: { _id: string; totalEmissions: number }[] = [];
    let trend: { _id: string; dailyTotal: number }[] = [];
