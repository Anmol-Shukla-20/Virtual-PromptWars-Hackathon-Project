import { NextRequest, NextResponse } from 'next/server';
import connectToDb from '@/lib/mongodb';
import Activity from '@/models/Activity';
import User from '@/models/User';
import { EMISSION_FACTORS } from '@/lib/emissionFactors';
import { verifyAuth } from '@/lib/auth';

// POST /api/tracker/log — Log a new activity
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    const userId = decoded.user.id;

    const {
      activityType,
      mode,
      distance,
      unitsConsumed,
      billAmount,
      dietPreference,
      shoppingFrequency,
      date,
      isRenewableEV,
    } = await req.json();

    await connectToDb();

    let carbonEmission = 0;
    let co2Saved = 0;
    let earnedPoints = 0;
    let sustainScoreDelta = 0;
