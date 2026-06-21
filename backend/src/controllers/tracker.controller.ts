import { Request, Response } from 'express';
import Activity from '../models/Activity';
import User from '../models/User';
import { EMISSION_FACTORS } from '../utils/emissionFactors';
import mongoose from 'mongoose';

export const logActivity = async (req: Request, res: Response) => {
    try {
        const { activityType, mode, distance, unitsConsumed, billAmount, dietPreference, shoppingFrequency, date, isRenewableEV } = req.body;
        const userId = req.user.id;

        let carbonEmission = 0;
        let co2Saved = 0;
        let earnedPoints = 0;
        let sustainScoreDelta = 0;

        if (activityType === 'transportation') {
            const lowerMode = (mode || '').toLowerCase();
            const factor = EMISSION_FACTORS.transportation[lowerMode as keyof typeof EMISSION_FACTORS.transportation] || 0;
            carbonEmission = (distance || 0) * factor;

            if (lowerMode === 'walking' || lowerMode === 'cycling') {
                sustainScoreDelta = 5;
            } else if (lowerMode === 'metro') {
                sustainScoreDelta = 4;
            } else if (lowerMode === 'ev') {
                if (isRenewableEV) {
                    sustainScoreDelta = 3;
                    carbonEmission = 0; // No reported carbon footprint from grid
                } else {
                    sustainScoreDelta = 2; // EV with some carbon footprint
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

            const worstFactor = EMISSION_FACTORS.transportation['car'];
            const worstEmission = (distance || 0) * worstFactor;
            if (worstEmission > carbonEmission) {
                co2Saved = worstEmission - carbonEmission;
            }
        } else if (activityType === 'electricity') {
            carbonEmission = (unitsConsumed || 0) * EMISSION_FACTORS.electricity;
        } else if (activityType === 'lifestyle') {
            const factor = EMISSION_FACTORS.diet[dietPreference as keyof typeof EMISSION_FACTORS.diet] || 0;
            carbonEmission = factor; 
        } else if (activityType === 'shopping') {
            const factor = EMISSION_FACTORS.shopping[shoppingFrequency as keyof typeof EMISSION_FACTORS.shopping] || 0;
            carbonEmission = factor; 
        }

        const activity = new Activity({
            user: userId,
            activityType,
            mode,
            distance,
            unitsConsumed,
            billAmount,
            dietPreference,
            shoppingFrequency,
            carbonEmission,
            date: date ? new Date(date) : new Date()
        });

        try {
            await activity.save();
            const userDoc = await User.findById(userId);
            if (userDoc) {
                userDoc.ecoPoints = (userDoc.ecoPoints || 0) + (earnedPoints || 0);
                userDoc.totalCo2Saved = (userDoc.totalCo2Saved || 0) + (co2Saved || 0);
                let newScore = (userDoc.sustainabilityScore || 0) + sustainScoreDelta;
                if (newScore > 100) newScore = 100;
                if (newScore < 0) newScore = 0;
                userDoc.sustainabilityScore = newScore;
                await userDoc.save();
            }
        } catch (dbErr: any) {
            console.error('⚠️ Activity Save Error:', dbErr);
            return res.status(500).json({ error: 'DB Save failed: ' + dbErr.message });
        }

        res.status(201).json({ 
            message: 'Activity logged successfully (Offline Mode)', 
            activity,
            co2Saved,
            earnedPoints
        });
    } catch (err: any) {
        console.error('Tracker Error:', err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

export const getActivities = async (req: Request, res: Response) => {
    try {
        let activities: any[] = [];
        try {
            activities = await Activity.find({ user: req.user.id }).sort({ date: -1 }).limit(50);
        } catch (dbErr) {
            console.warn('⚠️ DB offline, returning empty activities list.');
        }
        res.json(activities);
    } catch (err: any) {
        console.error('Tracker Error:', err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

export const getFootprintSummary = async (req: Request, res: Response) => {
    try {
        let userId;
        const isDummy = req.user.id === 'dummy-user-id' || !mongoose.Types.ObjectId.isValid(req.user.id);
        
        if (!isDummy) {
            userId = new mongoose.Types.ObjectId(req.user.id);
        }

        const summary = {
            transportation: 0,
            electricity: 0,
            lifestyle: 0,
            shopping: 0,
            total: 0
        };

        let breakdown: any[] = [];
        let dailyTrendRaw: any[] = [];

        try {
            if (isDummy) throw new Error("Offline Dummy User");
            
            // Aggregate breakdown by activity type
            breakdown = await Activity.aggregate([
                { $match: { user: userId } },
                { $group: { _id: '$activityType', totalEmissions: { $sum: '$carbonEmission' } } }
            ]);

            // Get daily trend for the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            dailyTrendRaw = await Activity.aggregate([
                { $match: { user: userId, date: { $gte: sevenDaysAgo } } },
                { $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
                    dailyTotal: { $sum: '$carbonEmission' } 
                }},
                { $sort: { _id: 1 } }
            ]);
        } catch (dbErr) {
            console.warn('⚠️ DB offline, returning MOCK footprint summary for UI.');
            breakdown = [
                { _id: 'transportation', totalEmissions: 15 },
                { _id: 'electricity', totalEmissions: 22 },
                { _id: 'lifestyle', totalEmissions: 10 }
            ];
            
            const today = new Date().toISOString().split('T')[0];
            dailyTrendRaw = [
                { _id: '2023-10-01', dailyTotal: 5 },
                { _id: today, dailyTotal: 12 }
            ];
        }

        breakdown.forEach(item => {
            if (item._id in summary) {
                // @ts-ignore
                summary[item._id] = item.totalEmissions;
                summary.total += item.totalEmissions;
            }
        });

        let userEcoPoints = 0;
        let userCo2Saved = 0;
        let userScore = 0;
        try {
            const user = await User.findById(userId);
            if (user) {
                userEcoPoints = user.ecoPoints || 0;
                userCo2Saved = user.totalCo2Saved || 0;
                userScore = user.sustainabilityScore || 0;
            }
        } catch (e) {
            userEcoPoints = dailyTrendRaw.length * 50; // fallback calculation
        }

        res.json({ breakdown: summary, trend: dailyTrendRaw, ecoPoints: userEcoPoints, co2Saved: userCo2Saved, sustainabilityScore: userScore });
    } catch (err: any) {
        console.error('Tracker Error:', err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};
