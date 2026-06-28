import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { getSystemTime } from '../utils/time';

// GET /driver/jobs
// Returns all orders with status 'MENUNGGU_PENGIRIM'
export const getAvailableJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.order.findMany({
      where: { status: 'MENUNGGU_PENGIRIM' },
      include: {
        store: { select: { name: true } },
        deliveryAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// POST /driver/jobs/:id/accept
// Accept a delivery job
export const acceptJob = async (req: Request, res: Response) => {
  const driverId = req.user!.userId;
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }
    if (order.status !== 'MENUNGGU_PENGIRIM') {
      return res.status(400).json({ error: 'Pesanan tidak dapat diambil untuk dikirim' });
    }

    const now = await getSystemTime();
    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: 'SEDANG_DIKIRIM',
          driverId,
          updatedAt: now,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: 'SEDANG_DIKIRIM',
          note: `Pesanan sedang diantar oleh kurir`,
          createdAt: now,
        },
      });

      return updatedOrder;
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// POST /driver/jobs/:id/complete
// Complete a delivery job
export const completeJob = async (req: Request, res: Response) => {
  const driverId = req.user!.userId;
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
    }
    if (order.driverId !== driverId) {
      return res.status(403).json({ error: 'Pesanan ini tidak ditugaskan kepada Anda' });
    }
    if (order.status !== 'SEDANG_DIKIRIM') {
      return res.status(400).json({ error: 'Status pesanan tidak valid untuk diselesaikan' });
    }

    const now = await getSystemTime();
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: 'PESANAN_SELESAI',
          updatedAt: now,
        },
      });

      // 2. Add history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: 'PESANAN_SELESAI',
          note: 'Pesanan telah diterima oleh pembeli',
          createdAt: now,
        },
      });

      // 3. Payout to Driver (deliveryFee)
      const driverWallet = await tx.wallet.upsert({
        where: { buyerId: driverId },
        create: { buyerId: driverId, balance: order.deliveryFee },
        update: { balance: { increment: order.deliveryFee } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: driverWallet.id,
          type: 'INCOME',
          amount: order.deliveryFee,
          description: `Pendapatan pengiriman pesanan #${order.id.slice(-8)}`,
          orderId: order.id,
          createdAt: now,
        },
      });

      // 4. Payout to Seller (subtotal - discountAmount)
      const sellerId = order.store.sellerId;
      const sellerEarnings = order.subtotal - order.discountAmount;
      if (sellerEarnings > 0) {
        const sellerWallet = await tx.wallet.upsert({
          where: { buyerId: sellerId },
          create: { buyerId: sellerId, balance: sellerEarnings },
          update: { balance: { increment: sellerEarnings } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: sellerWallet.id,
            type: 'INCOME',
            amount: sellerEarnings,
            description: `Pendapatan penjualan pesanan #${order.id.slice(-8)}`,
            orderId: order.id,
            createdAt: now,
          },
        });
      }

      return updatedOrder;
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// GET /driver/history
// Returns active/completed orders assigned to driver
export const getDriverHistory = async (req: Request, res: Response) => {
  const driverId = req.user!.userId;
  try {
    const orders = await prisma.order.findMany({
      where: { driverId },
      include: {
        store: { select: { name: true } },
        deliveryAddress: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// GET /driver/earnings
// Returns driver earnings summary and wallet transactions history
export const getDriverEarnings = async (req: Request, res: Response) => {
  const driverId = req.user!.userId;
  try {
    const wallet = await prisma.wallet.upsert({
      where: { buyerId: driverId },
      create: { buyerId: driverId, balance: 0 },
      update: {},
      include: {
        transactions: {
          where: { type: 'INCOME' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    const totalEarnings = wallet.transactions.reduce((sum, t) => sum + t.amount, 0);
    
    res.json({
      balance: wallet.balance,
      totalEarnings,
      transactions: wallet.transactions,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
