import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import router from './routes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', process.env.FRONTEND_URL || ''], credentials: true }));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many requests' } });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api', router);

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
