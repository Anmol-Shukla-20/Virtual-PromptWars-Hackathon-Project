import { Request, Response } from 'express';
import { getGroqChatCompletion } from '../services/ai.service';
import User from '../models/User';
import Activity from '../models/Activity';

export const chatWithEcoBot = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        // @ts-ignore
        const userId = req.user.id;

        let user;
        let recentActivities: any[] = [];
        try {
            user = await User.findById(userId);
            recentActivities = await Activity.find({ user: userId }).sort({ date: -1 }).limit(5);
        } catch (dbErr) {
            console.warn('⚠️ DB offline, using mock context for AI Chat');
            user = { fullName: 'Dummy Tester', sustainabilityScore: 78, totalCo2Saved: 124 };
            recentActivities = [{ activityType: 'transportation', mode: 'metro', carbonEmission: 2.1 }];
        }

        let systemPrompt = `You are EcoBot, an AI Sustainability Coach for the app EcoPath AI.
Your goal is to help the user reduce their carbon footprint. 
The user's name is ${user?.fullName || 'User'}. They have a sustainability score of ${user?.sustainabilityScore || 0}/100 and have saved ${user?.totalCo2Saved || 0} kg of CO2.
Recent activities context: ${JSON.stringify(recentActivities.map(a => ({ type: a.activityType, mode: a.mode, emission: a.carbonEmission }))) }.
Keep your responses concise, highly motivating, and highly actionable. Format nicely with markdown or plain text. Do not use more than 3 short paragraphs.`;

        if (recentActivities.length === 0) {
            systemPrompt = `You are EcoBot, an AI Sustainability Coach for the app EcoPath AI. 
The user ${user?.fullName || 'User'} has just signed up for the first time and hasn't logged any activities yet. 
Your goal is to warmly welcome them, introduce yourself, and ask them a simple engaging question to help them start tracking their carbon footprint (like asking about their typical daily commute or diet). 
Keep your responses highly friendly, welcoming, concise, and formatted nicely. Do not use more than 2 short paragraphs.`;
        }

        const reply = await getGroqChatCompletion(systemPrompt, message);

        res.json({ reply });
    } catch (err: any) {
        console.error('AI Chat Error:', err);
        res.status(500).json({ error: err.message || 'Server error communicating with AI' });
    }
};

export const getWeeklyRecommendations = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        const systemPrompt = `You are EcoBot. Based on the user profile, generate 2 short, highly actionable personalized recommendations to reduce carbon footprint. Output them as a strictly formatted JSON array of strings. Do not include markdown formatting like \`\`\`json. Just the array. Example: ["Use public transport twice this week to save 5kg CO2.", "Reduce AC usage by 1 hour daily."]`;
        
        const userMessage = `My name is ${user?.fullName || 'User'}, my current score is ${user?.sustainabilityScore || 0}. Give me my weekly recommendations.`;

        const responseText = await getGroqChatCompletion(systemPrompt, userMessage);
        
        try {
            const recommendations = JSON.parse(responseText.trim());
            res.json({ recommendations });
        } catch (parseError) {
            // fallback if the model doesn't return pure JSON
            res.json({ recommendations: [responseText.replace(/`/g, '').trim()] });
        }

    } catch (err: any) {
        console.error('AI Recommendations Error:', err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

