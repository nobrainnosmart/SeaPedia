import { Request, Response } from 'express';
import { z } from 'zod';
import { executeCheckout } from '../services/checkout.service';
import { prisma } from '../utils/prisma';
import { getSystemTime } from '../utils/time';

const checkoutSchema = z.object({
  deliveryAddressId: z.string().min(1, 'Alamat pengiriman wajib diisi'),
  deliveryMethod: z.enum(['INSTANT', 'NEXT_DAY', 'REGULAR'], {
    errorMap: () => ({ message: 'Metode pengiriman tidak valid' }),
  }),
  voucherCode: z.string().optional().nullable(),
  promoCode: z.string().optional().nullable(),
});

export const checkout = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { deliveryAddressId, deliveryMethod, voucherCode, promoCode } = parsed.data;

  try {
    const order = await executeCheckout({
      buyerId,
      deliveryAddressId,
      deliveryMethod,
      voucherCode: voucherCode || undefined,
      promoCode: promoCode || undefined,
    });
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getBuyerOrders = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;

  const orders = await prisma.order.findMany({
    where: { buyerId },
    include: {
      store: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders);
};

export const getBuyerOrderDetail = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      store: {
        select: { name: true },
      },
      deliveryAddress: true,
      items: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
      driver: {
        select: { username: true },
      },
    },
  });

  if (!order || order.buyerId !== buyerId) {
    return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
  }

  res.json(order);
};

export const getSellerOrders = async (req: Request, res: Response) => {
  const sellerId = req.user!.userId;

  const orders = await prisma.order.findMany({
    where: { sellerId },
    include: {
      buyer: {
        select: { username: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders);
};

export const getSellerOrderDetail = async (req: Request, res: Response) => {
  const sellerId = req.user!.userId;
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      buyer: {
        select: { username: true },
      },
      deliveryAddress: true,
      items: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
      driver: {
        select: { username: true },
      },
    },
  });

  if (!order || order.sellerId !== sellerId) {
    return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
  }

  res.json(order);
};

export const processOrder = async (req: Request, res: Response) => {
  const sellerId = req.user!.userId;
  const { id } = req.params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.sellerId !== sellerId) {
    return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
  }

  if (order.status !== 'SEDANG_DIKEMAS') {
    return res.status(400).json({ error: 'Status pesanan tidak valid untuk diproses' });
  }

  const systemTime = await getSystemTime();
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id },
      data: { 
        status: 'MENUNGGU_PENGIRIM',
        updatedAt: systemTime
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        status: 'MENUNGGU_PENGIRIM',
        note: 'Pesanan telah selesai dikemas dan siap untuk dikirim',
        createdAt: systemTime
      },
    });

    return updated;
  });

  res.json(updatedOrder);
};

export const cancelOverdueOrder = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order || order.buyerId !== buyerId) {
    return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
  }

  const activeStatuses = ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM'];
  if (!activeStatuses.includes(order.status)) {
    return res.status(400).json({ error: 'Pesanan sudah selesai atau dibatalkan' });
  }

  const now = await getSystemTime();
  const elapsedMs = now.getTime() - order.createdAt.getTime();
  
  let limitMs = 0;
  if (order.deliveryMethod === 'INSTANT') {
    limitMs = 2 * 60 * 60 * 1000; // 2 hours
  } else if (order.deliveryMethod === 'NEXT_DAY') {
    limitMs = 24 * 60 * 60 * 1000; // 24 hours
  } else {
    limitMs = 72 * 60 * 60 * 1000; // 72 hours (3 days)
  }

  if (elapsedMs <= limitMs) {
    return res.status(400).json({ error: 'Pesanan belum melewati batas waktu SLA pengiriman' });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { 
          status: 'DIKEMBALIKAN',
          updatedAt: now
        }
      });

      // 2. Add history
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: 'DIKEMBALIKAN',
          note: 'Pesanan dibatalkan otomatis oleh pembeli karena keterlambatan pengiriman (melebihi batas waktu SLA)',
          createdAt: now
        }
      });

      // 3. Refund wallet
      const wallet = await tx.wallet.upsert({
        where: { buyerId },
        create: { buyerId, balance: order.totalAmount },
        update: { balance: { increment: order.totalAmount } }
      });

      // 4. Record transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'REFUND',
          amount: order.totalAmount,
          description: `Refund pembatalan pesanan #${order.id.slice(-8)} akibat keterlambatan`,
          orderId: order.id,
          createdAt: now
        }
      });

      // 5. Restore product stock
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      return updatedOrder;
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
