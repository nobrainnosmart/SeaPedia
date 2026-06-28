import { Request, Response } from 'express';
import { z } from 'zod';
import { executeCheckout } from '../services/checkout.service';
import { prisma } from '../utils/prisma';

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

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id },
      data: { status: 'MENUNGGU_PENGIRIM' },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        status: 'MENUNGGU_PENGIRIM',
        note: 'Pesanan telah selesai dikemas dan siap untuk dikirim',
      },
    });

    return updated;
  });

  res.json(updatedOrder);
};
