import { Router } from 'express';
import { register, login, selectRole, logout, me } from '../controllers/auth.controller';
import { createReview, getReviews } from '../controllers/review.controller';
import { createStore, getSellerStore, updateStore, getStorePublic } from '../controllers/store.controller';
import { createProduct, getSellerProducts, updateProduct, deleteProduct, getProductsPublic, getProductPublic } from '../controllers/product.controller';
import { getWallet, topupWallet } from '../controllers/wallet.controller';
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/address.controller';
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller';
import { checkout, getBuyerOrders, getBuyerOrderDetail, getSellerOrders, getSellerOrderDetail, processOrder, cancelOverdueOrder } from '../controllers/order.controller';
import { createVoucher, getSellerVouchers, createPromo, getPromos, validateDiscount } from '../controllers/discount.controller';
import { getAvailableJobs, acceptJob, completeJob, getDriverHistory, getDriverEarnings } from '../controllers/driver.controller';
import { getDeliveryJobsAdmin, getOverdueOrdersAdmin, getTimeSimulation, updateTimeSimulation, getPlatformStats, getAllUsers, getAllStores, getAllProducts, getAllOrders } from '../controllers/admin.controller';
import { getBuyerReport, getSellerReport } from '../controllers/report.controller';
import { getSystemTime } from '../utils/time';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post('/auth/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/auth/login', login);

/**
 * @swagger
 * /auth/select-role:
 *   post:
 *     summary: Select active role (for users with multiple roles)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role selected successfully
 */
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

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all active products with pagination and search
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/products', getProductsPublic);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product details by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 */
router.get('/products/:id', getProductPublic);

// Wallet (Buyer)
router.get('/buyer/wallet', verifyToken, requireRole('BUYER'), getWallet);

/**
 * @swagger
 * /buyer/wallet/topup:
 *   post:
 *     summary: Top up buyer wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Wallet topped up successfully
 */
router.post('/buyer/wallet/topup', verifyToken, requireRole('BUYER'), topupWallet);

// Addresses (Buyer)
router.get('/buyer/addresses', verifyToken, requireRole('BUYER'), getAddresses);
router.post('/buyer/addresses', verifyToken, requireRole('BUYER'), createAddress);
router.put('/buyer/addresses/:id', verifyToken, requireRole('BUYER'), updateAddress);
router.delete('/buyer/addresses/:id', verifyToken, requireRole('BUYER'), deleteAddress);
router.patch('/buyer/addresses/:id/default', verifyToken, requireRole('BUYER'), setDefaultAddress);

// Cart (Buyer)
router.get('/buyer/cart', verifyToken, requireRole('BUYER'), getCart);

/**
 * @swagger
 * /buyer/cart/items:
 *   post:
 *     summary: Add product to cart (Single store rule enforced)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 */
router.post('/buyer/cart/items', verifyToken, requireRole('BUYER'), addCartItem);
router.put('/buyer/cart/items/:itemId', verifyToken, requireRole('BUYER'), updateCartItem);
router.delete('/buyer/cart/items/:itemId', verifyToken, requireRole('BUYER'), removeCartItem);
router.delete('/buyer/cart', verifyToken, requireRole('BUYER'), clearCart);

// Checkout & Orders
/**
 * @swagger
 * /buyer/checkout:
 *   post:
 *     summary: Place an order from cart items
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryAddressId:
 *                 type: string
 *               deliveryMethod:
 *                 type: string
 *                 enum: [INSTANT, NEXT_DAY, REGULAR]
 *               voucherCode:
 *                 type: string
 *               promoCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
router.post('/buyer/checkout', verifyToken, requireRole('BUYER'), checkout);
router.get('/buyer/orders', verifyToken, requireRole('BUYER'), getBuyerOrders);
router.get('/buyer/orders/:id', verifyToken, requireRole('BUYER'), getBuyerOrderDetail);
router.post('/buyer/orders/:id/cancel-overdue', verifyToken, requireRole('BUYER'), cancelOverdueOrder);
router.get('/seller/orders', verifyToken, requireRole('SELLER'), getSellerOrders);
router.get('/seller/orders/:id', verifyToken, requireRole('SELLER'), getSellerOrderDetail);

/**
 * @swagger
 * /seller/orders/{id}/process:
 *   patch:
 *     summary: Process order by seller (Change status from SEDANG_DIKEMAS to MENUNGGU_PENGIRIM)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order processed successfully
 */
router.patch('/seller/orders/:id/process', verifyToken, requireRole('SELLER'), processOrder);

// Driver Delivery Jobs
router.get('/driver/jobs', verifyToken, requireRole('DRIVER'), getAvailableJobs);

/**
 * @swagger
 * /driver/jobs/{id}/accept:
 *   post:
 *     summary: Accept a delivery job by driver
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job accepted successfully
 */
router.post('/driver/jobs/:id/accept', verifyToken, requireRole('DRIVER'), acceptJob);

/**
 * @swagger
 * /driver/jobs/{id}/complete:
 *   post:
 *     summary: Complete a delivery job by driver
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job completed successfully
 */
router.post('/driver/jobs/:id/complete', verifyToken, requireRole('DRIVER'), completeJob);
router.get('/driver/history', verifyToken, requireRole('DRIVER'), getDriverHistory);
router.get('/driver/earnings', verifyToken, requireRole('DRIVER'), getDriverEarnings);

// Reports
router.get('/buyer/reports', verifyToken, requireRole('BUYER'), getBuyerReport);
router.get('/seller/reports', verifyToken, requireRole('SELLER'), getSellerReport);

// Admin Monitoring & Simulation
router.get('/admin/delivery-jobs', verifyToken, requireRole('ADMIN'), getDeliveryJobsAdmin);
router.get('/admin/overdue', verifyToken, requireRole('ADMIN'), getOverdueOrdersAdmin);
router.get('/admin/time-simulation', verifyToken, requireRole('ADMIN'), getTimeSimulation);

/**
 * @swagger
 * /admin/time-simulation:
 *   post:
 *     summary: Update or reset time simulation (Accelerate hours or days)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hours:
 *                 type: integer
 *               days:
 *                 type: integer
 *               reset:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Time simulation updated successfully
 */
router.post('/admin/time-simulation', verifyToken, requireRole('ADMIN'), updateTimeSimulation);

// Admin Super-Panel
router.get('/admin/stats', verifyToken, requireRole('ADMIN'), getPlatformStats);
router.get('/admin/users', verifyToken, requireRole('ADMIN'), getAllUsers);
router.get('/admin/stores', verifyToken, requireRole('ADMIN'), getAllStores);
router.get('/admin/products', verifyToken, requireRole('ADMIN'), getAllProducts);
router.get('/admin/orders', verifyToken, requireRole('ADMIN'), getAllOrders);

// Discounts & Vouchers
router.post('/seller/vouchers', verifyToken, requireRole('SELLER'), createVoucher);
router.get('/seller/vouchers', verifyToken, requireRole('SELLER'), getSellerVouchers);
router.post('/admin/promos', verifyToken, requireRole('ADMIN'), createPromo);
router.get('/admin/promos', verifyToken, requireRole('ADMIN'), getPromos);
router.post('/discounts/validate', verifyToken, requireRole('BUYER'), validateDiscount);

// Health check
router.get('/health', async (_req, res) => res.json({ status: 'ok', timestamp: await getSystemTime() }));

export default router;
