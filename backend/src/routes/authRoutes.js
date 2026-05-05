import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { auth, permit } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', auth, permit('admin'), register);

export default router;
