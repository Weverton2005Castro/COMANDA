import { Router } from 'express';
import { completeOnboarding, login, onboarding, register } from '../controllers/authController.js';
import { auth, permit } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/onboarding', onboarding);
router.post('/onboarding/complete', auth, permit('admin'), completeOnboarding);
router.post('/register', auth, permit('admin'), register);

export default router;
