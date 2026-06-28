import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

const topupSchema = z.object({
  amount: z.number().int().positive('Jumlah top up harus lebih besar dari 0').max(10000000, 'Maksimal top up Rp 10.000.000'),
});

export const getWallet = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;

  const wallet = await prisma.wallet.upsert({
    where: { buyerId },
    create: { buyerId, balance: 0 },
    update: {},
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  res.json(wallet);
};

export const topupWallet = async (req: Request, res: Response) => {
  const buyerId = req.user!.userId;
  const parsed = topupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { amount } = parsed.data;

  const wallet = await prisma.$transaction(async (tx) => {
    // 1. Get or create wallet
    const w = await tx.wallet.upsert({
      where: { buyerId },
      create: { buyerId, balance: amount },
      update: { balance: { increment: amount } },
    });

    // 2. Create transaction record
    await tx.walletTransaction.create({
      data: {
        walletId: w.id,
        type: 'TOPUP',
        amount,
        description: `Top up Rp ${amount.toLocaleString('id-ID')}`,
      },
    });

    return tx.wallet.findUnique({
      where: { id: w.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  });

  res.json(wallet);
};
