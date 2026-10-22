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

    if (userId) {
      breakdown = await Activity.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$activityType', totalEmissions: { $sum: '$carbonEmission' } } },
      ]);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      trend = await Activity.aggregate([
        { $match: { user: userId, date: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            dailyTotal: { $sum: '$carbonEmission' },
          },
        },
        { $sort: { _id: 1 } },
      ]);
    }

    // Map aggregation result into summary object
    breakdown.forEach((item) => {
      if (item._id in summary) {
        (summary as Record<string, number>)[item._id] = item.totalEmissions;
        summary.total += item.totalEmissions;
      }
    });

    let ecoPoints = 0;
    let co2Saved = 0;
    let sustainabilityScore = 0;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        ecoPoints = user.ecoPoints ?? 0;
        co2Saved = user.totalCo2Saved ?? 0;
        sustainabilityScore = user.sustainabilityScore ?? 0;
      }
    }
