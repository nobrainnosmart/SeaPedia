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
import { getDeliveryJobsAdmin, getOverdueOrdersAdmin, getTimeSimulation, updateTimeSimulation } from '../controllers/admin.controller';
import { getSystemTime } from '../utils/time';
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

// Wallet (Buyer)
router.get('/buyer/wallet', verifyToken, requireRole('BUYER'), getWallet);
router.post('/buyer/wallet/topup', verifyToken, requireRole('BUYER'), topupWallet);

// Addresses (Buyer)
router.get('/buyer/addresses', verifyToken, requireRole('BUYER'), getAddresses);
router.post('/buyer/addresses', verifyToken, requireRole('BUYER'), createAddress);
router.put('/buyer/addresses/:id', verifyToken, requireRole('BUYER'), updateAddress);
router.delete('/buyer/addresses/:id', verifyToken, requireRole('BUYER'), deleteAddress);
router.patch('/buyer/addresses/:id/default', verifyToken, requireRole('BUYER'), setDefaultAddress);

// Cart (Buyer)
router.get('/buyer/cart', verifyToken, requireRole('BUYER'), getCart);
router.post('/buyer/cart/items', verifyToken, requireRole('BUYER'), addCartItem);
router.put('/buyer/cart/items/:itemId', verifyToken, requireRole('BUYER'), updateCartItem);
router.delete('/buyer/cart/items/:itemId', verifyToken, requireRole('BUYER'), removeCartItem);
router.delete('/buyer/cart', verifyToken, requireRole('BUYER'), clearCart);

// Checkout & Orders
router.post('/buyer/checkout', verifyToken, requireRole('BUYER'), checkout);
router.get('/buyer/orders', verifyToken, requireRole('BUYER'), getBuyerOrders);
router.get('/buyer/orders/:id', verifyToken, requireRole('BUYER'), getBuyerOrderDetail);
router.post('/buyer/orders/:id/cancel-overdue', verifyToken, requireRole('BUYER'), cancelOverdueOrder);
router.get('/seller/orders', verifyToken, requireRole('SELLER'), getSellerOrders);
router.get('/seller/orders/:id', verifyToken, requireRole('SELLER'), getSellerOrderDetail);
router.patch('/seller/orders/:id/process', verifyToken, requireRole('SELLER'), processOrder);

// Driver Delivery Jobs
router.get('/driver/jobs', verifyToken, requireRole('DRIVER'), getAvailableJobs);
router.post('/driver/jobs/:id/accept', verifyToken, requireRole('DRIVER'), acceptJob);
router.post('/driver/jobs/:id/complete', verifyToken, requireRole('DRIVER'), completeJob);
router.get('/driver/history', verifyToken, requireRole('DRIVER'), getDriverHistory);
router.get('/driver/earnings', verifyToken, requireRole('DRIVER'), getDriverEarnings);

// Admin Monitoring & Simulation
router.get('/admin/delivery-jobs', verifyToken, requireRole('ADMIN'), getDeliveryJobsAdmin);
router.get('/admin/overdue', verifyToken, requireRole('ADMIN'), getOverdueOrdersAdmin);
router.get('/admin/time-simulation', verifyToken, requireRole('ADMIN'), getTimeSimulation);
router.post('/admin/time-simulation', verifyToken, requireRole('ADMIN'), updateTimeSimulation);

// Discounts & Vouchers
router.post('/seller/vouchers', verifyToken, requireRole('SELLER'), createVoucher);
router.get('/seller/vouchers', verifyToken, requireRole('SELLER'), getSellerVouchers);
router.post('/admin/promos', verifyToken, requireRole('ADMIN'), createPromo);
router.get('/admin/promos', verifyToken, requireRole('ADMIN'), getPromos);
router.post('/discounts/validate', verifyToken, requireRole('BUYER'), validateDiscount);

// Health check
router.get('/health', async (_req, res) => res.json({ status: 'ok', timestamp: await getSystemTime() }));

export default router;
