import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { getSystemTime } from '../utils/time';

// GET /buyer/reports
export const getBuyerReport = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;

  try {
    // All completed orders
    const orders = await prisma.order.findMany({
      where: { buyerId, status: 'PESANAN_SELESAI' },
      include: {
        store: { select: { name: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

    // Most purchased store
    const storeCounts: Record<string, { name: string; count: number }> = {};
    for (const o of orders) {
      if (!storeCounts[o.storeId]) storeCounts[o.storeId] = { name: o.store.name, count: 0 };
      storeCounts[o.storeId].count++;
    }
    const favoriteStore = Object.values(storeCounts).sort((a, b) => b.count - a.count)[0] || null;

    // Monthly breakdown — last 6 months (by virtual time)
    const now = await getSystemTime();
    const monthly: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = 0;
    }
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in monthly) monthly[key] += o.totalAmount;
    }

    res.json({
      totalSpent,
      orderCount,
      avgOrderValue,
      favoriteStore,
      monthly: Object.entries(monthly).map(([month, amount]) => ({ month, amount })),
      recentOrders: orders.slice(0, 10),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /seller/reports
export const getSellerReport = async (req: Request, res: Response) => {
  const sellerId = req.user!.userId;

  try {
    // All fulfilled orders
    const orders = await prisma.order.findMany({
      where: { sellerId, status: 'PESANAN_SELESAI' },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.subtotal - o.discountAmount), 0);
    const orderCount = orders.length;

    // Top products by quantity sold
    const productQty: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const o of orders) {
      for (const item of o.items) {
        if (!productQty[item.productId]) {
          productQty[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        productQty[item.productId].qty += item.quantity;
        productQty[item.productId].revenue += item.price * item.quantity;
      }
    }
    const topProducts = Object.entries(productQty)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Monthly revenue — last 6 months
    const now = await getSystemTime();
    const monthly: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = 0;
    }
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in monthly) monthly[key] += o.subtotal - o.discountAmount;
    }

    // Recent income transactions from seller wallet
    const wallet = await prisma.wallet.findUnique({
      where: { buyerId: sellerId },
      include: {
        transactions: {
          where: { type: 'INCOME' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    // Pending orders count
    const pendingCount = await prisma.order.count({
      where: { sellerId, status: { in: ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM'] } },
    });

    // Active products count
    const productCount = await prisma.product.count({
      where: { store: { sellerId }, isActive: true },
    });

    res.json({
      totalRevenue,
      orderCount,
      pendingCount,
      productCount,
      topProducts,
      monthly: Object.entries(monthly).map(([month, amount]) => ({ month, amount })),
      recentTransactions: wallet?.transactions || [],
      walletBalance: wallet?.balance || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
