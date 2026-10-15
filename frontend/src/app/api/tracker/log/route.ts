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

    if (activityType === 'transportation') {
      const lowerMode = (mode ?? '').toLowerCase() as keyof typeof EMISSION_FACTORS.transportation;
      const factor = EMISSION_FACTORS.transportation[lowerMode] ?? 0;
      carbonEmission = (distance ?? 0) * factor;

      if (lowerMode === 'walking' || lowerMode === 'cycling') {
        sustainScoreDelta = 5;
      } else if (lowerMode === 'metro') {
        sustainScoreDelta = 4;
      } else if (lowerMode === 'ev') {
        if (isRenewableEV) {
          sustainScoreDelta = 3;
          carbonEmission = 0;
        } else {
          sustainScoreDelta = 2;
        }
      } else if (lowerMode === 'bus' || lowerMode === 'carpool') {
        sustainScoreDelta = 1;
      } else if (lowerMode === 'car' || lowerMode === 'scooty') {
        sustainScoreDelta = -2;
      } else if (lowerMode === 'motorbike') {
        sustainScoreDelta = -3;
      }
