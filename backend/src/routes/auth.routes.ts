import { Router } from 'express';
import { register, login, getProfile, googleLogin } from '../controllers/auth.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/profile', auth, getProfile);

export default router;
