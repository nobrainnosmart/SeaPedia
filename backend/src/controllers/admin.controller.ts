import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { getSystemTime, setSystemTimeOffset } from '../utils/time';
import { z } from 'zod';

const timeSimulationSchema = z.object({
  hours: z.number().nonnegative().optional(),
  days: z.number().nonnegative().optional(),
  reset: z.boolean().optional(),
});

// GET /admin/delivery-jobs
export const getDeliveryJobsAdmin = async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.order.findMany({
      include: {
        buyer: { select: { username: true } },
        seller: { select: { username: true } },
        store: { select: { name: true } },
        deliveryAddress: true,
        driver: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/overdue
export const getOverdueOrdersAdmin = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM'] },
      },
      include: {
        buyer: { select: { username: true } },
        store: { select: { name: true } },
        driver: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = await getSystemTime();
    
    // Filter overdue orders
    const overdue = orders.filter((order) => {
      const elapsedMs = now.getTime() - order.createdAt.getTime();
      let limitMs = 0;
      if (order.deliveryMethod === 'INSTANT') {
        limitMs = 2 * 60 * 60 * 1000;
      } else if (order.deliveryMethod === 'NEXT_DAY') {
        limitMs = 24 * 60 * 60 * 1000;
      } else {
        limitMs = 72 * 60 * 60 * 1000; // 3 days
      }
      return elapsedMs > limitMs;
    });

    res.json(overdue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/time-simulation
export const getTimeSimulation = async (req: Request, res: Response) => {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'time_offset' } });
    const offsetMs = config ? Number(config.value) : 0;
    const virtualTime = new Date(Date.now() + offsetMs);
    
    res.json({
      realTime: new Date(),
      virtualTime,
      offsetMs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /admin/time-simulation
export const updateTimeSimulation = async (req: Request, res: Response) => {
  const parsed = timeSimulationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { hours, days, reset } = parsed.data;

  try {
    let offsetMs = 0;
    
    if (!reset) {
      const config = await prisma.systemConfig.findUnique({ where: { key: 'time_offset' } });
      const currentOffset = config ? Number(config.value) : 0;
      
      const hoursMs = (hours || 0) * 60 * 60 * 1000;
      const daysMs = (days || 0) * 24 * 60 * 60 * 1000;
      offsetMs = currentOffset + hoursMs + daysMs;
    }
    
    await setSystemTimeOffset(offsetMs);
    const virtualTime = new Date(Date.now() + offsetMs);
    
    res.json({
      message: reset ? 'Simulasi waktu direset ke waktu nyata' : `Simulasi waktu dipercepat sebesar ${hours || 0} jam, ${days || 0} hari`,
      realTime: new Date(),
      virtualTime,
      offsetMs,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// GET /admin/stats — Platform-wide KPI summary
export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalStores,
      totalProducts,
      totalOrders,
      completedOrders,
      activeOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PESANAN_SELESAI' } }),
      prisma.order.count({ where: { status: { in: ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM'] } } }),
    ]);

    // GMV = sum of all completed order totalAmounts
    const gmvResult = await prisma.order.aggregate({
      where: { status: 'PESANAN_SELESAI' },
      _sum: { totalAmount: true },
    });
    const gmv = gmvResult._sum.totalAmount || 0;

    // Role breakdown
    const roles = await prisma.userRole.groupBy({
      by: ['role'],
      _count: { role: true },
    });
    const roleCounts: Record<string, number> = {};
    for (const r of roles) roleCounts[r.role] = r._count.role;

    const virtualTime = await getSystemTime();

    res.json({
      totalUsers,
      totalStores,
      totalProducts,
      totalOrders,
      completedOrders,
      activeOrders,
      gmv,
      roleCounts,
      virtualTime,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/users — All users with roles and wallet balance
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        roles: true,
        wallet: { select: { balance: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      roles: u.roles.map(r => r.role),
      walletBalance: u.wallet?.balance || 0,
      createdAt: u.createdAt,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/stores — All stores with stats
export const getAllStores = async (req: Request, res: Response) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        seller: { select: { username: true } },
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get revenue per store from seller wallet INCOME transactions linked to orders
    const storeRevenues: Record<string, number> = {};
    const incomeTransactions = await prisma.walletTransaction.findMany({
      where: { type: 'INCOME', orderId: { not: null } },
      include: { wallet: { select: { buyerId: true } } },
    });

    // Map seller wallet income to store
    for (const store of stores) {
      const sellerIncome = incomeTransactions
        .filter(t => t.wallet.buyerId === store.sellerId)
        .reduce((sum, t) => sum + t.amount, 0);
      storeRevenues[store.id] = sellerIncome;
    }

    res.json(stores.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      sellerUsername: s.seller.username,
      productCount: s._count.products,
      orderCount: s._count.orders,
      totalRevenue: storeRevenues[s.id] || 0,
      createdAt: s.createdAt,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/products — All active products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        store: { select: { name: true, sellerId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/orders — All orders (full ledger)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        buyer: { select: { username: true } },
        seller: { select: { username: true } },
        store: { select: { name: true } },
        driver: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

