import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config';
import router from './routes';
import { checkAndProcessOverdueOrders } from './services/overdue.service';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', process.env.FRONTEND_URL || ''], credentials: true }));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many requests' } });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, message: { error: 'Too many requests, please try again later' } });
app.use('/api', generalLimiter);

// Swagger Documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SEAPEDIA API',
      version: '1.0.0',
      description: `
        SEAPEDIA Multi-Role E-Commerce API

        ## Business Rules
        - Single-store checkout: one cart per store only
        - PPN 12% base: (subtotal - discount + deliveryFee) × 0.12
        - Discount stacking: voucher applied first, promo on remainder
        - Driver earning: 70% of delivery fee (simplified to deliveryFee in this implementation)
        - Overdue SLA: INSTANT=2 hours, NEXT_DAY=24 hours, REGULAR=72 hours

        ## Authentication
        Use Bearer token in Authorization header.
        Roles: ADMIN, SELLER, BUYER, DRIVER
      `,
    },
    servers: [{ url: '/api', description: 'API Base' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/index.ts', './dist/routes/*.js', './dist/controllers/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📖 API Documentation available at http://localhost:${PORT}/api/docs`);
});

// Run overdue check every hour
cron.schedule('0 * * * *', async () => {
  await checkAndProcessOverdueOrders();
});
