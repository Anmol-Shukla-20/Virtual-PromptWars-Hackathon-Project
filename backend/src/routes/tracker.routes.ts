import { Router } from 'express';
import { logActivity, getActivities, getFootprintSummary } from '../controllers/tracker.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/log', auth, logActivity);
router.get('/activities', auth, getActivities);
router.get('/summary', auth, getFootprintSummary);

export default router;
