import { Router } from 'express';
import { chatWithEcoBot, getWeeklyRecommendations } from '../controllers/ai.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/chat', auth, chatWithEcoBot);
router.get('/recommendations', auth, getWeeklyRecommendations);

export default router;
