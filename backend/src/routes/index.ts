import { Router } from 'express';
import { register, login, selectRole, logout, me } from '../controllers/auth.controller';
import { createReview, getReviews } from '../controllers/review.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/select-role', verifyToken, selectRole);
router.post('/auth/logout', verifyToken, logout);
router.get('/auth/me', verifyToken, me);

// Reviews
router.post('/reviews', (req, res, next) => { verifyToken(req, res, (err) => { if (err) return next(); next(); }); }, createReview);
router.get('/reviews', getReviews);

// Health check
router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

export default router;
