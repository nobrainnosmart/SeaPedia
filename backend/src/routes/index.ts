import { Router } from 'express';
import { register, login, selectRole, logout, me } from '../controllers/auth.controller';
import { createReview, getReviews } from '../controllers/review.controller';
import { createStore, getSellerStore, updateStore, getStorePublic } from '../controllers/store.controller';
import { createProduct, getSellerProducts, updateProduct, deleteProduct, getProductsPublic, getProductPublic } from '../controllers/product.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

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

// Stores
router.post('/seller/store', verifyToken, requireRole('SELLER'), createStore);
router.get('/seller/store', verifyToken, requireRole('SELLER'), getSellerStore);
router.put('/seller/store', verifyToken, requireRole('SELLER'), updateStore);
router.get('/stores/:id', getStorePublic);

// Products
router.post('/seller/products', verifyToken, requireRole('SELLER'), createProduct);
router.get('/seller/products', verifyToken, requireRole('SELLER'), getSellerProducts);
router.put('/seller/products/:id', verifyToken, requireRole('SELLER'), updateProduct);
router.delete('/seller/products/:id', verifyToken, requireRole('SELLER'), deleteProduct);
router.get('/products', getProductsPublic);
router.get('/products/:id', getProductPublic);

// Health check
router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

export default router;
