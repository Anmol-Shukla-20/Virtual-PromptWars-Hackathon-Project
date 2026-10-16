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

      sustainScoreDelta = Math.max(-3, Math.min(5, sustainScoreDelta));
      if (sustainScoreDelta > 0) earnedPoints = sustainScoreDelta * 2;

      const worstEmission = (distance ?? 0) * EMISSION_FACTORS.transportation.car;
      if (worstEmission > carbonEmission) {
        co2Saved = worstEmission - carbonEmission;
      }
    } else if (activityType === 'electricity') {
      carbonEmission = (unitsConsumed ?? 0) * EMISSION_FACTORS.electricity;
    } else if (activityType === 'lifestyle') {
      const factor = EMISSION_FACTORS.diet[dietPreference as keyof typeof EMISSION_FACTORS.diet] ?? 0;
      carbonEmission = factor;
    } else if (activityType === 'shopping') {
      const factor = EMISSION_FACTORS.shopping[shoppingFrequency as keyof typeof EMISSION_FACTORS.shopping] ?? 0;
      carbonEmission = factor;
    }
